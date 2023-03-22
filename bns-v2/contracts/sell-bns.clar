;; (define-constant bns-name (unwrap-panic (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal tx-sender))
(define-constant bns-name {namespace: 0x67676767676767676767, name: 0x303132})
(define-constant name-owner tx-sender)
(define-data-var requested-amount-in-ustx uint u1000000000)

;; transfer to escrow
(print (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace bns-name) (get name bns-name) 
    (as-contract tx-sender) none))

    
(define-public (buy (amount-in-ustx uint) (zonefile-hash (optional (buff 20))))
    (let ((buyer tx-sender))
        (asserts! (is-eq amount-in-ustx (var-get requested-amount-in-ustx)) (err u500))
        (try! (stx-transfer? amount-in-ustx buyer name-owner))
        (try! (to-bool-response (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace bns-name) (get name bns-name)  
                 buyer zonefile-hash))))
        (ok true)))

;; succeeds only if name is in escrow
(define-public (set-price (amount-in-ustx uint))
    (begin
        (asserts! (is-eq tx-sender name-owner) (err {code: 403, name: none}))
        (var-set requested-amount-in-ustx amount-in-ustx)
        (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal (as-contract tx-sender))))

(define-public (cancel (zonefile-hash (optional (buff 20))))
    (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace bns-name) (get name bns-name)  
                 name-owner zonefile-hash)))



;; convert response to standard bool response with uint error
;; (response bool int) (response bool uint)
(define-private (to-bool-response (value (response bool int)))
    (match value
           success (ok success)
           error (err (to-uint error))))