import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that users can register approved names",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        [
          "0x67676767676767676767",
          `'${deployer}.approving-namespace-controller`,
        ],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    const hashResponse1 = chain.callReadOnlyFn(
      "crypto",
      "crypto-hash160",
      ["0x31312e6767676767676767676700"],
      deployer
    );

    const hashResponse2 = chain.callReadOnlyFn(
      "crypto",
      "crypto-hash160",
      ["0x32322e6767676767676767676700"],
      deployer
    );

    block = chain.mineBlock([
      Tx.contractCall(
        "approving-namespace-controller",
        "set-approval-pubkey",
        [
          "0x02a3b986401a619013ee1deee0ccba58a5b2235260d55259106e5fc9c53e6a9d71",
        ],
        deployer
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-preorder",
        [hashResponse1.result],
        account1
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-reveal",
        [
          "0x3131",
          "0x00",
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          "0x01020304",
        ],
        account1
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-preorder",
        [hashResponse2.result],
        account2
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-reveal",
        [
          "0x3232",
          "0x00",
          "0xb045f07cc9ebcba2cefce1191271d2a740a2f8e58987edf80a7813c51797ab8c085be7ccd4c45bda051179a2037dce166d20ca58ada462dad08eeb45427e74c301",
          "0x01020304",
        ],
        account2
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // register a name
    block.receipts[1].result.expectOk().expectUint(147);
    block.receipts[2].result.expectOk().expectBool(true);
    // register second name
    block.receipts[3].result.expectOk().expectUint(147);
    block.receipts[4].result.expectOk().expectBool(true);
  },
});
