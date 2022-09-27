(define-data-var controller principal tx-sender)
(define-map bns uint principal)
(define-data-var version uint 0)

(define-public (set-next-version (bns principal))
    (let ((new-version (+ u1 (var-get version))))
        (asssert! (is-eq contract-caller (var-get controller)))
        (var-set version new-version)
        (map-set bns new-version bns)
        (ok true)))

(define-public (set-controller (new-controller principal))
    (begin
        (assert! (is-eq contract-caller (var-get controller)))
        (var-set controller new-controller)
        (ok true)))

(define-read-only (get-version)
    (var-get version))

(define-read-only (get-bns)
    (unwrap-panic (map-get? bns (get-version))))

(define-read-only (get-controller)
    (var-get controller))