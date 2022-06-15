import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";

export function setupNamespace(chain: Chain, deployer: string) {
  let block = chain.mineBlock([
    Tx.contractCall(
      "bns2",
      "namespace-preorder",
      ["0x99961db0e28d17557ffc9530f215b5eeb7860b8f", types.uint(640_000_000)],
      deployer
    ),
    Tx.contractCall(
      "bns2",
      "namespace-reveal",
      [
        "0x67676767676767676767",
        "0x0000",
        types.uint(1000000)
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
