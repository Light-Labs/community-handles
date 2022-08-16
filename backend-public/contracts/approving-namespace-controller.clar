(define-constant namespace 0x67676767676767676767)

(define-data-var contract-owner principal tx-sender)
(define-data-var community-treasury principal tx-sender)
(define-data-var approval-pubkey (buff 33) 0x00)
(define-data-var price-in-ustx uint u9999999)

(define-constant err-not-authorized (err u403))
(define-constant err-not-found (err u404))
(define-constant err-max-renewal-reached (err u500))
(define-constant err-signature-already-used (err u501))

(define-constant err-name-already-claimed (err u2011))
(define-constant err-name-claimability-expired (err u2012))
(define-constant err-preorder-already-exists (err u2016))
(define-constant err-hash-malformated (err u2017))

(define-constant name-preorder-claimability-ttl u144)

(define-map name-preorders
  { hashed-salted-fqn: (buff 20), buyer: principal }
  { created-at: uint, claimed: bool })

(define-map renewal-signatures (buff 65) (buff 48))

;; preorder a name by registering a hash of the salted name
;; tx-sender has to pay registration fees here
(define-public (name-preorder (hashed-salted-fqn (buff 20)))
  (let ((price (var-get price-in-ustx))
        (former-preorder
            (map-get? name-preorders { hashed-salted-fqn: hashed-salted-fqn, buyer: tx-sender })))
    ;; Ensure eventual former pre-order expired
    (asserts!
      (if (is-none former-preorder)
        true
        (>= block-height (+ name-preorder-claimability-ttl
                            (unwrap-panic (get created-at former-preorder)))))
      err-preorder-already-exists)
    ;; Ensure that the hashed fqn is 20 bytes long
    (asserts! (is-eq (len hashed-salted-fqn) u20) err-hash-malformated)
    ;; Ensure that user will be paying
    (try! (pay-fees price))
    ;; Register the pre-order
    (map-set name-preorders
      { hashed-salted-fqn: hashed-salted-fqn, buyer: tx-sender }
      { created-at: block-height, claimed: false })
    (ok (+ block-height name-preorder-claimability-ttl))))

;; reveal an ordered name
;; @event: tx-sender sends 1 stx
;; @event: community-handles burns 1 stx
;; @event: community-handles sends name nft to tx-sender
(define-public (name-reveal (name (buff 48))
                            (salt (buff 20))
                            (owner principal)
                            (approval-signature (buff 65))
                            (zonefile-hash (buff 20)))
    (let ((hashed-salted-fqn (hash160 (concat (concat (concat name 0x2e) namespace) salt)))
          (preorder (unwrap!
            (map-get? name-preorders { hashed-salted-fqn: hashed-salted-fqn, buyer: owner })
            err-not-found))
          (hash (sha256 (concat (concat (concat name 0x2e) namespace) salt))))
        ;; Name must be approved by current approver
        (asserts! (secp256k1-verify hash approval-signature (var-get approval-pubkey)) err-not-authorized)
        ;; The preorder entry must be unclaimed
        (asserts!
            (is-eq (get claimed preorder) false)
            err-name-already-claimed)
        ;; Less than 24 hours must have passed since the name was preordered
        (asserts!
            (< block-height (+ (get created-at preorder) name-preorder-claimability-ttl))
            err-name-claimability-expired)
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        (try! (as-contract (contract-call? .community-handles name-register namespace name owner zonefile-hash)))
        (ok true)))


;; renew a name
;; a new signature is required for each renewal
;; @param name; the name to renew
;; @param salt; the salt used by the approver
;; @param approval-signature; signed hash by the approver
;; @param new-owner;
;; @param zonefile-hash;
(define-public (name-renewal (name (buff 48))
                             (salt (buff 20))
                             (approval-signature (buff 65))
                             (new-owner (optional principal))
                             (zonefile-hash (optional (buff 20))))
    (let ((price (var-get price-in-ustx))
          (owner tx-sender)
          (hash (sha256 (concat (concat (concat name 0x2e) namespace) salt))))
        ;; signature must be correct
        (asserts! (secp256k1-verify hash approval-signature (var-get approval-pubkey)) err-not-authorized)
        ;; signature must be unused
        (asserts! (is-none (map-get? renewal-signatures approval-signature)) err-signature-already-used) 
        (map-set renewal-signatures approval-signature name)
        (try! (pay-fees price))
        (try! (contract-call? .community-handles name-renewal namespace name new-owner zonefile-hash))
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

;; convert response to standard bool response with uint error
;; (response bool int) (response bool uint)
(define-private (to-bool-response (value (response bool int)))
    (match value
        success (ok success)
        error (err (to-uint error))))
