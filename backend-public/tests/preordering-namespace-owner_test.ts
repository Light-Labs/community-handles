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
        "community-handles",
        "set-namespace-owner",
        ["0x67676767676767676767", `'${deployer}.preordering-namespace-owner`],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall(
        "preordering-namespace-owner",
        "bulk-order",
        [
          types.list([
            types.tuple({
              owner: `'${account1}`,
              name: "0x3131",
              price: types.uint(2),
            }),
          ]),
        ],
        deployer
      ),
      Tx.contractCall(
        "preordering-namespace-owner",
        "name-register",
        ["0x3131", "0x01020304"],
        account1
      ),
      Tx.contractCall(
        "preordering-namespace-owner",
        "name-register",
        ["0x3232", "0x01020304"],
        account2
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr().expectUint(404); // order not found
  },
});
