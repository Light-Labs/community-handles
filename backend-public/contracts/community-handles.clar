(define-constant err-not-authorized (err u403))
(define-constant internal-price-high u999999999999999999999999999999)

(define-map namespace-controller (buff 20) principal)

;; variables for iteration functions
(define-data-var ctx-bulk-registration-namespace (buff 20) 0x00)

;; register the namespace on-chain
(define-public (namespace-setup (namespace (buff 20)) (stx-to-burn uint) (lifetime uint))
    (let ((namespace-salt 0x00)
          (hashed-salted-namespace (hash160 (concat namespace namespace-salt))))    
        (map-set namespace-controller namespace contract-caller)
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

;; register name for 1 ustx by namespace controller only
;; @param name: the name in the managed namespace
;; @param salt: any value works
;; @param zonefile-hash: the hash of the attachment/zonefile for the name
(define-public (name-register (namespace (buff 20))
                              (name (buff 48))
                              (zonefile-hash (buff 20))
                              (owner principal))
    (let (
        (salt 0x00)
        (hash (hash160 (concat (concat (concat name 0x2e) namespace) salt))))
        (try! (is-namespace-controller namespace))
        (try! (stx-transfer? u1 tx-sender (as-contract tx-sender)))
        (try! (as-contract (to-uint-response (contract-call? 'ST000000000000000000002AMW42H.bns name-preorder hash u1))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u1 u1))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-register namespace name salt zonefile-hash))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer namespace name owner (some zonefile-hash)))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace internal-price-high u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1))))        
        (ok true)))

;; iterator for bulk-name-register
(define-private (bulk-name-register-iter (entry {name: (buff 48), owner: principal, zonefile-hash: (buff 20)}) (prev (response bool uint)))
    (let ((salt 0x00)
          (namespace (var-get ctx-bulk-registration-namespace))
          (name (get name entry))
          (hash (hash160 (concat (concat (concat name 0x2e) namespace) salt)))
          (zonefile-hash (get zonefile-hash entry)))
        (try! prev)
        (try! (as-contract (to-uint-response (contract-call? 'ST000000000000000000002AMW42H.bns name-preorder hash u1))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-register namespace name salt zonefile-hash))))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer namespace name (get owner entry) (some zonefile-hash)))))
        (ok true)))

;; register multiple namens for 1 ustx by namespace controller only
;; @param name: the name in the controlled namespace
;; @param zonefile-hash: the hash of the attachment/zonefile for the name
(define-public (bulk-name-register (namespace (buff 20)) (names (list 1000 {name: (buff 48), owner: principal, zonefile-hash: (buff 20)})))
    (begin
        (try! (is-namespace-controller namespace))
        (var-set ctx-bulk-registration-namespace namespace)
        (try! (stx-transfer? (len names) tx-sender (as-contract tx-sender)))
        (try! (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u1 u1))))
        (try! (fold bulk-name-register-iter names (ok true)))
        (var-set ctx-bulk-registration-namespace 0x00)
        (as-contract (to-bool-response (contract-call? 'ST000000000000000000002AMW42H.bns namespace-update-function-price namespace internal-price-high u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1 u1)))))

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

(define-private (is-namespace-controller (namespace (buff 20)))
    (ok (asserts! (is-eq (map-get? namespace-controller namespace) (some contract-caller)) err-not-authorized)))

(define-read-only (get-namespace-controller (namespace (buff 20)))
    (map-get? namespace-controller namespace))

;;
;; Admin functions
;;
(define-public (set-namespace-controller (namespace (buff 20)) (new-controller principal))
    (begin
        (try! (is-namespace-controller namespace))
        (ok (map-set namespace-controller namespace new-controller))))
