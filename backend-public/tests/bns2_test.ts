import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";
Clarinet.test({
  name: "Ensure that user can register name cheaply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-preorder",
        ["0x8838d9f51c845dfa4aa1c26e677196d6fc3186e9", types.uint(10)],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();

    block = chain.mineBlock([
      Tx.contractCall(
        "bns2",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          "0x0000",
          "0x0102030405060708090a",
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "Ensure that user can't register name via bns cheaply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-preorder",
        ["0x8838d9f51c845dfa4aa1c26e677196d6fc3186e9", types.uint(10)],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();

    block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          "0x0000",
          "0x0102030405060708090a",
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectErr().expectInt(2007); //stx burnt insuffient
  },
});

Clarinet.test({
  name: "Ensure that user can register name via bns pricely",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    // check price
    const price = 10_000_000_000_000;
    const priceResponse = chain.callReadOnlyFn(
      "SP000000000000000000002Q6VF78.bns",
      "get-name-price",
      ["0x67676767676767676767", "0x6767"],
      account1
    );
    priceResponse.result.expectOk().expectUint(price);

    let block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-preorder",
        ["0x8838d9f51c845dfa4aa1c26e677196d6fc3186e9", types.uint(price)],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();
    // expect burn event (missing api) block.receipts[0].events.expectStxBurnEvent(price);

    block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          "0x0000",
          "0x0102030405060708090a",
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();
    block.receipts[0].events.expectNonFungibleTokenMintEvent(
      "{name: 0x6767, namespace: 0x67676767676767676767}",
      account1,
      "SP000000000000000000002Q6VF78.bns",
      "names"
    );
  },
});
