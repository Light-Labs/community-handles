(define-constant err-not-authorized (err u403))

(define-map namespace-owners (buff 20) principal)

(define-constant internal-price-high u999999999999999999999999999999)

;; register the namespace on-chain
(define-public (namespace-setup (namespace (buff 20)) (stx-to-burn uint) (lifetime uint))
    (let ((namespace-salt 0x00)
          (hashed-salted-namespace (hash160 (concat namespace namespace-salt))))    
        (map-set namespace-owners namespace contract-caller)
        (try! (contract-call? 'ST000000000000000000002AMW42H.bns
                namespace-preorder hashed-salted-namespace stx-to-burn))    
        (try! (contract-call? 'ST000000000000000000002AMW42H.bns
                                namespace-reveal
                                namespace
                                namespace-salt
                                internal-price-high u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1
                                lifetime
                                (as-contract tx-sender)))        
        (try! (as-contract (contract-call? 'ST000000000000000000002AMW42H.bns
                                namespace-ready namespace)))
        (ok true)))

;; register name for 1 ustx by contract owner only
;; @param name: the name in the managed namespace
;; @param salt: any value works
;; @param zonefile-hash: the hash of the attachment/zonefile for the name
(define-public (name-register (namespace (buff 20))
                              (name (buff 48))
                              (salt (buff 20))
                              (zonefile-hash (buff 20))
                              (owner principal))
    (let ((hash (hash160 (concat (concat (concat name 0x2e) namespace) salt))))
        (try! (is-owner namespace))
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        (try! (as-contract (to-uint-response (contract-call? 'ST000000000000000000002AMW42H.bns name-preorder hash u1))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u1 u1))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-register namespace name salt zonefile-hash))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer namespace name owner (some zonefile-hash)))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace internal-price-high u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1))))        
        (ok true)))

;; iterator for bulk-name-register
(define-private (bulk-name-register-iter (entry {namespace: (buff 20), name: (buff 48), owner: principal, zonefile-hash: (buff 20)}) (prev (response bool uint)))
    (let ((salt 0x00)
          (hash (hash160 (concat (concat (concat name 0x2e) namespace) salt))))
        (try! prev)
        (try! (as-contract (to-uint-response (contract-call? 'ST000000000000000000002AMW42H.bns name-preorder hash u1))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-register (get namespace entry) (get name entry) salt (get zonefile-hash entry)))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer (get namespace entry) (get name entry) (get owner entry) (some zonefile-hash)))))
        (ok true)))

;; register multiple namens for 1 ustx by contract owner only
;; @param name: the name in the managed namespace
;; @param zonefile-hash: the hash of the attachment/zonefile for the name
(define-public (bulk-name-register (names (list 1000 {namespace: (buff 20), name: (buff 48), owner: principal, zonefile-hash: (buff 20)})))
    (begin
        (try! (is-owner namespace))
        (try! (stx-transfer? (len names) tx-sender (as-contract tx-sender)))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u1 u1))))
        (try! (fold bulk-name-register-iter names (ok true)))
        ((as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace internal-price-high u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1))))
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

(define-private (is-owner (namespace (buff 20)))
    (ok (asserts! (is-eq (map-get? namespace-owners namespace) (some contract-caller)) err-not-authorized)))

(define-read-only (get-namespace-owner (namespace (buff 20)))
    (map-get? namespace-owners namespace))

;;
;; Admin functions
;;
(define-public (set-namespace-owner (namespace (buff 20)) (new-owner principal))
    (begin
        (try! (is-owner namespace))
        (ok (map-set namespace-owners namespace new-owner))))
