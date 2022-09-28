import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that users can register approved names",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-transfer",
        ["0x67676767676767676767", "0x303132","'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sell-bns", "none"],
        deployer
      ),
      Tx.contractCall("sell-bns", "cancel", ["none"], deployer),
    ]);

    block.receipts[0].result.expectOk();
    console.log(block.receipts[1].events);
  },
});
