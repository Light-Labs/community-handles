import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";

export function setupNamespace(chain: Chain, deployer: string) {
  let block = chain.mineBlock([
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "namespace-preorder",
      ["0x99961db0e28d17557ffc9530f215b5eeb7860b8f", types.uint(640_000_000)],
      deployer
    ),
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "namespace-reveal",
      [
        "0x67676767676767676767",
        "0x0000",
        types.uint(1_000_000),
        types.uint(1),
        types.uint(1),
        types.uint(2),
        types.uint(3),
        types.uint(4),
        types.uint(5),
        types.uint(6),
        types.uint(7),
        types.uint(8),
        types.uint(9),
        types.uint(10),
        types.uint(11),
        types.uint(12),
        types.uint(13),
        types.uint(14),
        types.uint(15),
        types.uint(16),
        types.uint(1),
        types.uint(1),
        types.uint(1000),
        types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bns2"),
      ],
      deployer
    ),
  ]);
  assertEquals(block.receipts.length, 2);
  block.receipts[0].result.expectOk();
  block.receipts[1].result.expectOk();

  block = chain.mineBlock([
    Tx.contractCall(
      "bns2",
      "namespace-ready",
      ["0x67676767676767676767"],
      deployer
    ),
  ]);
  block.receipts[0].result.expectOk();
}
