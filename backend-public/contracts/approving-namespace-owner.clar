(define-constant namespace 0x6868686868686868)

(define-data-var contract-owner principal tx-sender)
(define-data-var dao-treasury principal tx-sender)
(define-data-var approval-pubkey (buff 33) 0x00)
(define-data-var price-in-ustx uint u4999999)

(define-constant err-not-authorized (err u403))
(define-constant err-not-found (err u404))
(define-constant err-unsupported-namespace (err u500))

;; register an ordered name
;; @event: tx-sender sends 1 stx
;; @event: this contracts sends 1 stx
;; @event: dao-names burns 1 stx
;; @event: dao-names sends name nft to tx-sender
(define-public (name-register (name (buff 48))
                              (approval-signature (buff 65))
                              (zonefile-hash (buff 20)))
    (let ((price (var-get price-in-ustx))
            (salt 0x00)
            (owner tx-sender)
            (hash (sha256 (concat (concat (concat name 0x2e) namespace) salt))))
        (asserts! (secp256k1-verify hash approval-signature (var-get approval-pubkey)) err-not-authorized)
        (try! (pay-fees price))
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        (try! (as-contract (contract-call? .dao-names name-register namespace name salt zonefile-hash owner)))
        (ok true)))


(define-private (pay-fees (price uint))
    (let ((amount-ohf (/ (* price u70) u100))
          (amount-dao (- price amount-ohf)))
        (try! (stx-transfer? amount-ohf tx-sender (var-get contract-owner)))
        (try! (stx-transfer? amount-dao tx-sender (var-get dao-treasury)))
        (ok true)))

;;
;; admin functions
;;
(define-public (set-price (amount-in-ustx uint))
    (begin
        (try! (is-contract-owner))
        (var-set price-in-ustx amount-in-ustx)
        (ok true)))

(define-public (set-dao-treasury (new-treasury principal))
   (begin
        (try! (is-contract-owner))
        (var-set dao-treasury new-treasury)
        (ok true)))

(define-public (set-approval-pubkey (new-pubkey (buff 33)))
   (begin
        (try! (is-contract-owner))
        (var-set approval-pubkey new-pubkey)
        (ok true)))


(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (ok (var-set contract-owner new-owner))))

;; hand over control of namespace to new owner
;; can only be called by contract owner of this contract
(define-public (set-new-namespace-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (as-contract (contract-call? .dao-names set-namespace-owner namespace new-owner))))

(define-private (is-contract-owner)
    (ok (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)))

(define-read-only (get-contract-owner)
    (var-get contract-owner))
