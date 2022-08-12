(define-public (do-it (namespace-controller (optional principal)))
    (begin
        (try! (contract-call? .community-handles namespace-preorder 0x36ca0f0b340aa9c0689f89749804ebe26a6ad9dc u640000000))
        (contract-call? .community-handles namespace-reveal 0x67676767676767676767 0x00 u100 namespace-controller)))