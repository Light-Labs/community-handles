import { Tx, Chain, types, assertEquals } from "./deps.ts";

export function setupNamespace(chain: Chain, deployer: string) {
  const hashResponse = chain.callReadOnlyFn(
    "crypto",
    "crypto-hash160",
    ["0x6767676767676767676700"], // namespace + salt 0x00
    deployer
  );

  const hashResponseName = chain.callReadOnlyFn(
    "crypto",
    "crypto-hash160",
    ["0x3031322e6767676767676767676700"], // name + . + namespace + salt 0x00
    deployer
  );

  let block = chain.mineBlock([
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "namespace-preorder",
      [hashResponse.result, types.uint(640_000_000)],
      deployer
    ),
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "namespace-reveal",
      [
        "0x67676767676767676767",
        "0x00",
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.uint(1),
        types.uint(50000),
        types.principal(deployer),
      ],
      deployer
    ),
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "namespace-ready",
      ["0x67676767676767676767"],
      deployer
    ),
  ]);
  block.receipts[0].result.expectOk();
  block.receipts[1].result.expectOk();
  block.receipts[2].result.expectOk();

  chain.mineEmptyBlock(1);
  block = chain.mineBlock([
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "get-namespace-properties",
      ["0x67676767676767676767"],
      deployer
    ),
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "can-name-be-registered",
      ["0x67676767676767676767", "0x303132"],
      deployer
    ),

    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "name-preorder",
      [hashResponseName.result, types.uint(640_000_000)],
      deployer
    ),
    Tx.contractCall(
      "SP000000000000000000002Q6VF78.bns",
      "name-register",
      ["0x67676767676767676767", "0x303132", "0x00", "0x"],
      deployer
    ),
  ]);
  block.receipts[0].result.expectOk();
  block.receipts[1].result.expectOk().expectBool(true);
  block.receipts[2].result.expectOk();
  block.receipts[3].result.expectOk();
}
