(define-constant bns-name {namespace: 0x627363, name: 0x3232})
(define-data-var name-owner tx-sender)
(define-data-var requested-amount-in-ustx uint 100)
(define-data-var namespace 0x627363)

;; transfer to escrow
(contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace bns-name) (get name bns-name) 
    tx-sender (as-contract tx-sender))
    
(define-public (buy (amount-in-ustx uint))
    (let ((buyer tx-sender))
        (asserts! (is-eq amount-in-ustx (var-get requested-amount-in-ustx)) err-offer-mismatch)
        (asserts! (is-eq name-owner (get-current-name-owner)) err-not-authorized)
        (try! (stx-transfer? amount-in-ustx buyer name-owner))
        (try! (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace bns-name) (get name bns-name)  
                    tx-sender buyer)))
        (ok true)))

;; succeeds only if name is in escrow
(define-public (set-price (amount-in-ustx uint))
    (begin
        (asserts! (is-eq tx-sender (var-get name-owner)) err-not-authorized)
        (var-set requested-amount-in-ustx amount-in-ustx)
        (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal (as-contract tx-sender))))

;;
(define-public (new-offer (amount-in-ustx uint))
    (match (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal tx-sender)
        name
    (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer  
    tx-sender (as-contract tx-sender))
)