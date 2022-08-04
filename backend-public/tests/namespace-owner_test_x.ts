import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that users can register names",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "dao-names",
        "set-contract-owner",
        [`'${deployer}.namespace-owner-2`],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall(
        "namespace-owner",
        "name-register",
        ["0x67676767676767676767", "0x3131", "0x00", "0x01020304"],
        account1
      ),
      Tx.contractCall(
        "namespace-owner",
        "name-register",
        ["0x67676767676767676767", "0x3232", "0x00", "0x01020304"],
        account2
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});
