
;; bns2
;;
(define-data-var owned-namespace (buff 20) 0x67676767676767676767)
(define-data-var owner principal tx-sender)

(define-public (namespace-preorder (hashed-salted-namespace (buff 20))
                                   (stx-to-burn uint))
    (let ((this-ctr (as-contract tx-sender)))
        (asserts! (is-authorized tx-sender) err-not-authorized)
        (try! (stx-transfer? stx-to-burn tx-sender this-ctr))
        (to-uint-response (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns
        namespace-preorder hashed-salted-namespace stx-to-burn)))))

(define-public (namespace-reveal (namespace (buff 20))
                                 (namespace-salt (buff 20))
                                 (p-func-base uint)
                                 (p-func-coeff uint)
                                 (p-func-b1 uint)
                                 (p-func-b2 uint)
                                 (p-func-b3 uint)
                                 (p-func-b4 uint)
                                 (p-func-b5 uint)
                                 (p-func-b6 uint)
                                 (p-func-b7 uint)
                                 (p-func-b8 uint)
                                 (p-func-b9 uint)
                                 (p-func-b10 uint)
                                 (p-func-b11 uint)
                                 (p-func-b12 uint)
                                 (p-func-b13 uint)
                                 (p-func-b14 uint)
                                 (p-func-b15 uint)
                                 (p-func-b16 uint)
                                 (p-func-non-alpha-discount uint)
                                 (p-func-no-vowel-discount uint)
                                 (lifetime uint)
                                 (namespace-import principal))
    (begin
        (asserts! (is-authorized tx-sender) err-not-authorized)
        (to-bool-response (as-contract (contract-call?
        'SP000000000000000000002Q6VF78.bns
        namespace-reveal
        namespace
        namespace-salt
        p-func-base
        p-func-coeff
        p-func-b1
        p-func-b2
        p-func-b3
        p-func-b4
        p-func-b5
        p-func-b6
        p-func-b7
        p-func-b8
        p-func-b9
        p-func-b10
        p-func-b11
        p-func-b12
        p-func-b13
        p-func-b14
        p-func-b15
        p-func-b16
        p-func-non-alpha-discount
        p-func-no-vowel-discount
        lifetime
        namespace-import)))))

(define-public (namespace-ready (namespace (buff 20)))
    (begin
        (asserts! (is-authorized tx-sender) err-not-authorized)
        (to-bool-response (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns
        namespace-ready namespace)))))

(define-public (get-name-price (namespace (buff 20)) (name (buff 48)))
     (begin                              
        (try! (set-low-price))
        (let ((result (contract-call? 'SP000000000000000000002Q6VF78.bns get-name-price namespace name)))
            (try! (set-high-price))
            result)))

(define-public (name-register (namespace (buff 20))
                              (name (buff 48))
                              (salt (buff 20))
                              (zonefile-hash (buff 20)))
       (begin                              
        (try! (set-low-price))
        (let ((result (contract-call? 'SP000000000000000000002Q6VF78.bns name-register namespace name salt zonefile-hash)))
            (try! (set-high-price))
            result)))
 

(define-public (update-owner (new-owner principal))
    (begin
        (asserts! (is-authorized tx-sender) err-not-authorized)
        (var-set owner new-owner)
        (ok true)))

(define-private (set-low-price)
    (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-update-function-price
     (var-get owned-namespace) u1 u1 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16
        u1 u1)))


(define-private (set-high-price)
    (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-update-function-price
        (var-get owned-namespace) u2 u1 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16
        u1 u1)))

(define-private (is-authorized (user principal))
    (is-eq user (var-get owner)))

(define-private (to-uint-response (value (response uint int)))
    (match value
          success (ok success)
          error (err (to-uint error))))

(define-private (to-bool-response (value (response bool int)))
    (match value
          success (ok success)
          error (err (to-uint error))))

(define-constant err-not-authorized (err u403))