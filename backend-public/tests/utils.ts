import { Tx, Chain, types, assertEquals } from "./deps.ts";

export function setupNamespace(chain: Chain, deployer: string) {
  let block = chain.mineBlock([
    Tx.contractCall(
      "community-handles",
      "namespace-setup",
      ["0x67676767676767676767", types.uint(640_000_000), types.uint(1000)],
      deployer
    ),
  ]);
  assertEquals(block.receipts.length, 1);
  block.receipts[0].result.expectOk();
}
