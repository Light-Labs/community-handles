(define-constant namespace 0x67676767676767676767)

(define-data-var contract-owner principal tx-sender)
(define-data-var dao-treasury principal tx-sender)

(define-map name-orders (buff 48) {owner: principal, price: uint})

(define-constant err-not-authorized (err u403))
(define-constant err-not-found (err u404))
(define-constant err-unsupported-namespace (err u500))

;; register an ordered name
;; @event: tx-sender sends 1 stx
;; @event: this contracts sends 1 stx
;; @event: community-handles burns 1 stx
;; @event: community-handles sends name nft to tx-sender
(define-public (name-register (name (buff 48))
                              (zonefile-hash (buff 20)))
    (let ((name-order (unwrap! (map-get? name-orders name) err-not-found))
            (owner (get owner name-order))
            (price (get price name-order)))
        (asserts! (is-eq owner tx-sender) err-not-authorized)
        (try! (pay-fees price))
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        (try! (as-contract (contract-call? .community-handles name-register namespace name zonefile-hash)))
        (try! (as-contract (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer namespace name owner (some zonefile-hash)))))
        (ok true)))

(define-private (pay-fees (price uint))
    (let ((amount-ohf (/ (* price u70) u100))
          (amount-dao (- price amount-ohf)))
        (and (> amount-ohf u0)
            (try! (stx-transfer? amount-ohf tx-sender (var-get contract-owner))))
        (and (> amount-ohf u0)
            (try! (stx-transfer? amount-dao tx-sender (var-get dao-treasury))))
        (ok true)))

;;
;; admin functions
;;
(define-public (bulk-order (details (list 1000 {owner: principal, name: (buff 48), price: uint})))
    (begin
        (try! (is-contract-owner))
        (ok (map insert-order details))))

(define-private (insert-order (order {owner: principal, name: (buff 48), price: uint}))
    (map-set name-orders (get name order) {owner: (get owner order), price: (get price order)}))

;; hand over control of namespace to new controller
;; can only be called by contract owner of this contract
(define-public (set-namespace-controller (new-controller principal))
    (begin
        (try! (is-contract-owner))
        (as-contract (contract-call? .community-handles set-namespace-controller namespace new-controller))))

(define-private (is-contract-owner)
    (ok (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)))

(define-read-only (get-contract-owner)
    (var-get contract-owner))

(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (ok (var-set contract-owner new-owner))))

;; convenience

;; convert response to standard uint response with uint error
;; (response uint int) (response uint uint)
(define-private (to-uint-response (value (response uint int)))
    (match value
        success (ok success)
        error (err (to-uint error))))

;; convert response to standard bool response with uint error
;; (response bool int) (response bool uint)
(define-private (to-bool-response (value (response bool int)))
    (match value
        success (ok success)
        error (err (to-uint error))))
