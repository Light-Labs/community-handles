import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that users can register ordered names",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "bns2",
        "set-contract-owner",
        [`'${deployer}.namespace-owner`],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall(
        "namespace-owner",
        "bulk-order",
        [
          types.list([
            types.tuple({
              owner: types.principal(account1),
              name: "0x3131",
              price: types.uint(1_000),
            }),
            types.tuple({
              owner: types.principal(account2),
              name: "0x3232",
              price: types.uint(1_000),
            }),
          ]),
        ],
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
