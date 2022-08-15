(define-read-only (crypto-hash160 (value (buff 10000)))
    (hash160 value))