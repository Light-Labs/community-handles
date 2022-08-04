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
        "dao-names",
        "set-namespace-owner",
        ["0x67676767676767676767", `'${deployer}.namespace-owner-2`],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall(
        "namespace-owner-2",
        "set-approval-pubkey",
        [
          "0x023cb81443c04149724c20839f438378921240e0f24a7483d24d6b60728057e8f3",
        ],
        deployer
      ),
      Tx.contractCall(
        "namespace-owner-2",
        "name-register",
        [
          "0x3131",
          "0x34e6a0fa550c51c9a8871aff2e4cfc1fb122edb64a9c934c6a3b37a41d6302f276d4d564a2da66e15e8743a98ddd658f790ddc103c41bfe117c68cf5b63567d001",
          "0x01020304",
        ],
        account1
      ),
      Tx.contractCall(
        "namespace-owner-2",
        "name-register",
        [
          "0x3232",
          "0x044e76eb356a4771edca0b0c3bf297ce32346911e33b473066732bac5e2e2c8a6dcf1242250328b3b2abad1905f0b25f3393b0c0dd63307fa1e6d206e346759d01",
          "0x01020304",
        ],
        account2
      ),
    ]);

    console.log(block.receipts[0].events);
    console.log(block.receipts[1].events);
    console.log(block.receipts[2].events);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
  },
});
