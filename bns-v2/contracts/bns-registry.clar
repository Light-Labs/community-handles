(define-data-var controller principal tx-sender)
(define-map bns-versions uint principal)
(define-data-var version uint u0)

(define-constant err-not-authorized (err 403))

(define-public (set-next-version (bns principal))
    (let ((new-version (+ u1 (var-get version))))
        (asserts! (is-eq contract-caller (var-get controller)) err-not-authorized)
        (var-set version new-version)
        (map-set bns-versions new-version bns)
        (ok true)))

(define-public (set-controller (new-controller principal))
    (begin
        (asserts! (is-eq contract-caller (var-get controller)) err-not-authorized)
        (var-set controller new-controller)
        (ok true)))

(define-read-only (get-version)
    (var-get version))

(define-read-only (get-bns)
    (unwrap-panic (map-get? bns-versions (get-version))))

(define-read-only (get-controller)
    (var-get controller))