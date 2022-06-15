(define-constant err-not-authorized (err u403))

(define-data-var owned-namespace (buff 20) 0x)
(define-data-var contract-owner principal tx-sender)

(define-public (namespace-preorder (hashed-salted-namespace (buff 20))
                                   (stx-to-burn uint))
    (begin
        (try! (is-contract-owner))
        (try! (stx-transfer? stx-to-burn tx-sender (as-contract tx-sender)))
        (to-uint-response (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns
        namespace-preorder hashed-salted-namespace stx-to-burn)))))

(define-public (namespace-reveal (namespace (buff 20))
                                 (namespace-salt (buff 20))
                                 (lifetime uint)
                                 (namespace-import principal))
    (begin
        (try! (is-contract-owner))
        (var-set owned-namespace namespace)
        (to-bool-response (as-contract (contract-call?
        'SP000000000000000000002Q6VF78.bns
        namespace-reveal
        namespace
        namespace-salt
        u999999999999999999999999999999 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1
        lifetime
        namespace-import)))))

(define-public (namespace-ready (namespace (buff 20)))
    (begin
        (try! (is-contract-owner))
        (to-bool-response (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-ready namespace)))))

(define-public (name-register (name (buff 48))
                              (salt (buff 20))
                              (zonefile-hash (buff 20)))
    (let ((namespace (var-get owned-namespace)))
        (try! (is-contract-owner))
        (try! (as-contract (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-update-function-price namespace u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0))))
        (let ((result (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns name-register namespace name salt zonefile-hash))))
            (try! (as-contract (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-update-function-price namespace u999999999999999999999999999999 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1))))
            result)))
 
(define-private (to-uint-response (value (response uint int)))
    (match value
        success (ok success)
        error (err (to-uint error))))

(define-private (to-bool-response (value (response bool int)))
    (match value
        success (ok success)
        error (err (to-uint error))))

(define-private (is-contract-owner)
    (ok (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)))

(define-read-only (get-contract-owner)
    (var-get contract-owner))

(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (ok (var-set contract-owner new-owner))))
