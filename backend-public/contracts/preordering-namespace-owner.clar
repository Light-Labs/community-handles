(define-data-var contract-owner principal tx-sender)
(define-map name-orders (buff 48) {owner: principal, price: uint})

(define-constant err-not-authorized (err u403))
(define-constant err-not-found (err u404))
(define-constant err-unsupported-namespace (err u500))

;; register an ordered name
;; @event: tx-sender sends 1 stx
;; @event: this contracts sends 1 stx
;; @event: dao-names burns 1 stx
;; @event: dao-names sends name nft to tx-sender
(define-public (name-register (namespace (buff 20))
                              (name (buff 48))
                              (salt (buff 20))
                              (zonefile-hash (buff 20)))
    (let ((name-order (unwrap! (map-get? name-orders name) err-not-found))
            (owner (get owner name-order))
            (price (get price name-order))
            (hash (hash160 (concat (concat (concat name 0x2e) namespace) 0x00))))
        (asserts! (is-managed-namespace namespace) err-unsupported-namespace)
        (asserts! (is-eq owner tx-sender) err-not-authorized)
        (try! (pay-fees price))
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        ;;(try! (as-contract (contract-call? .dao-names name-register namespace name salt zonefile-hash owner)))
        (ok true)))

(define-private (pay-fees (price uint))
    (let ((price-in-mia (usda-to-mia price))
          (fees (/ (* price-in-mia u30) u100)))
        (if true
            (ok (print {price-in-mia: price-in-mia, fees: fees}))
            err-not-found)
    ;; (try! (contract-call 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2 transfer fees owner (as-contract tx-sender)))
    ;; (try! (contract-call 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2 burn (- price-in-mia fees) owner))))
    ))
;;
;; admin functions
;;
(define-public (bulk-order (details (list 1000 {owner: principal, name: (buff 48), price: uint})))
    (begin
        (try! (is-contract-owner))
        (map insert-order details)
        (ok true)))

(define-private (insert-order (order {owner: principal, name: (buff 48), price: uint}))
    (map-set name-orders (get name order) {owner: (get owner order), price: (get price order)}))

;; hand over control of namespace to new owner
;; can only be called by contract owner of this contract
(define-public (set-new-namespace-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        ;;(as-contract (contract-call? .dao-names set-namespace-owner namespace new-owner))))
        (ok true)))

(define-private (is-contract-owner)
    (ok (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)))

(define-read-only (get-contract-owner)
    (var-get contract-owner))

(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (ok (var-set contract-owner new-owner))))

;; usda mia oracle
(define-read-only (usda-to-mia (price uint))
    (* price u1000000))

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
;;
;; oracle
;;
(define-read-only (is-managed-namespace (namespace (buff 20)))
    (is-eq namespace 0x67676767676767676767))
