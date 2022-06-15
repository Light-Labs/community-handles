(define-constant err-not-authorized (err u403))
(define-constant err-already-initialized (err u500))

(define-data-var owned-namespace (buff 20) 0x)
(define-data-var ready bool false)
(define-data-var contract-owner principal tx-sender)

;; pre order namespace to not reveal it early during contract deployment
(define-public (namespace-preorder (hashed-salted-namespace (buff 20))
                                   (stx-to-burn uint))
    (begin
        (try! (is-contract-owner))
        (try! (stx-transfer? stx-to-burn tx-sender (as-contract tx-sender)))
        (to-uint-response (contract-call? 'SP000000000000000000002Q6VF78.bns
        namespace-preorder hashed-salted-namespace stx-to-burn))))

;; reveal the namespace
(define-public (namespace-reveal (namespace (buff 20))
                                 (namespace-salt (buff 20))
                                 (lifetime uint))
    (begin
        (try! (is-contract-owner))
        (asserts! (not (var-get ready)) err-already-initialized)
        (var-set ready true)
        (var-set owned-namespace namespace)
        (to-bool-response (contract-call?
        'SP000000000000000000002Q6VF78.bns
        namespace-reveal
        namespace
        namespace-salt
        u999999999999999999999999999999 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1
        lifetime
        (as-contract tx-sender)))))

;; make namespace ready for registration
;; bns.namespace-ready can only be called by namespace owner, i.e. this contract 
(define-public (namespace-ready (namespace (buff 20)))
    (begin
        (try! (is-contract-owner))
        (to-bool-response (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-ready namespace)))))

;; register name for 1 ustx by contract owner only
;; @param name: the name in the managed namespace
;; @param salt: any value works
;; @param zonefile-hash: the hash of the attachment/zonefile for the name
(define-public (name-register (name (buff 48))
                              (salt (buff 20))
                              (zonefile-hash (buff 20))
                              (owner principal))
    (let ((namespace (var-get owned-namespace))
        (hash (hash160 (concat (concat (concat name 0x2e) namespace) salt))))
        (try! (is-contract-owner))
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        (try! (as-contract (to-uint-response (contract-call? 'SP000000000000000000002Q6VF78.bns name-preorder hash u1))))
        (try! (as-contract (to-bool-response (contract-call?
        'SP000000000000000000002Q6VF78.bns namespace-update-function-price
        namespace u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u1 u1))))
        (try! (as-contract (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns name-register namespace name salt zonefile-hash))))
        (try! (as-contract (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer namespace name owner (some zonefile-hash)))))
        (try! (as-contract (to-bool-response (contract-call? 'SP000000000000000000002Q6VF78.bns namespace-update-function-price namespace u999999999999999999999999999999 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1))))        
        (ok true)))

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

(define-private (is-contract-owner)
    (ok (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)))

(define-read-only (get-contract-owner)
    (var-get contract-owner))

(define-public (set-contract-owner (new-owner principal))
    (begin
        (try! (is-contract-owner))
        (ok (var-set contract-owner new-owner))))
