(define-constant namespace 0x67676767676767676767)
(define-constant name-salt 0x00)

(define-data-var contract-owner principal tx-sender)
(define-data-var community-treasury principal tx-sender)
(define-data-var approval-pubkey (buff 33) 0x00)
(define-data-var price-in-ustx uint u9999999)

(define-constant err-not-authorized (err u403))

;; register an ordered name
;; @event: tx-sender sends 1 stx
;; @event: community-handles burns 1 stx
;; @event: community-handles sends name nft to tx-sender
(define-public (name-register (name (buff 48))
                              (approval-signature (buff 65))
                              (zonefile-hash (buff 20)))
    (let ((price (var-get price-in-ustx))
          (owner tx-sender)
          (hash (sha256 (concat (concat (concat name 0x2e) namespace) name-salt))))
        (asserts! (secp256k1-verify hash approval-signature (var-get approval-pubkey)) err-not-authorized)
        (try! (pay-fees price))
        (try! (contract-call? .community-handles name-register namespace name zonefile-hash owner))
        (ok true)))


(define-private (pay-fees (price uint))
    (let ((amount-ohf (/ (* price u70) u100))
          (amount-community (- price amount-ohf)))
        (and (> amount-ohf u0)
            (try! (stx-transfer? amount-ohf tx-sender (var-get contract-owner))))
        (and (> amount-community u0)
            (try! (stx-transfer? amount-community tx-sender (var-get community-treasury))))
        (ok true)))

;;
;; admin functions
;;
(define-public (set-price (amount-in-ustx uint))
    (begin
        (try! (is-contract-owner))
        (var-set price-in-ustx amount-in-ustx)
        (ok true)))

(define-public (set-community-treasury (new-treasury principal))
   (begin
        (try! (is-contract-owner))
        (var-set community-treasury new-treasury)
        (ok true)))

(define-public (set-approval-pubkey (new-pubkey (buff 33)))
   (begin
        (try! (is-contract-owner))
        (var-set approval-pubkey new-pubkey)
        (ok true)))


(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (var-set contract-owner new-owner)
        (ok true)))

;; hand over control of namespace to new controller
;; can only be called by contract owner of this contract
(define-public (set-namespace-controller (new-controller principal))
    (begin
        (try! (is-contract-owner))
        (try! (as-contract (contract-call? .community-handles set-namespace-controller namespace new-controller)))
        (ok true)))

(define-private (is-contract-owner)
    (ok (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)))

(define-read-only (get-contract-owner)
    (var-get contract-owner))
