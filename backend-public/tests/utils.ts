import { Tx, Chain, types, assertEquals } from "./deps.ts";

export function setupNamespace(chain: Chain, deployer: string) {
  const hashResponse = chain.callReadOnlyFn(
    "crypto",
    "crypto-hash160",
    ["0x6767676767676767676700"],
    deployer
  );

  let block = chain.mineBlock([
    Tx.contractCall(
      "community-handles",
      "namespace-preorder",
      [hashResponse.result, types.uint(640_000_000)],
      deployer
    ),
    Tx.contractCall(
      "community-handles",
      "namespace-reveal",
      ["0x67676767676767676767", "0x00", types.uint(1000), types.none()],
      deployer
    ),
  ]);
  assertEquals(block.receipts.length, 2);
  block.receipts[0].result.expectOk();
  block.receipts[1].result.expectOk();
}
