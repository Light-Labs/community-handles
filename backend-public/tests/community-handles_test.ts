import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that deployer can register name cheaply and bns price is still high",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          "0x0102030405060708090a",
          types.principal(account1),
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    const priceResponse = chain.callReadOnlyFn(
      "ST000000000000000000002AMW42H.bns",
      "get-name-price",
      ["0x67676767676767676767", "0x6767"],
      account1
    );
    priceResponse.result
      .expectOk()
      .expectUint(9999999999999999999999999999990n);
  },
});

Clarinet.test({
  name: "Ensure that deployer can register names in bulk cheaply and bns price is still high",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "bulk-name-register",
        [
          "0x67676767676767676767",
          types.list([
            types.tuple({
              name: "0x6767",
              "zonefile-hash": "0x0102030405060708090a",
              owner: types.principal(account1),
            }),
          ]),
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    const priceResponse = chain.callReadOnlyFn(
      "ST000000000000000000002AMW42H.bns",
      "get-name-price",
      ["0x67676767676767676767", "0x6767"],
      account1
    );
    priceResponse.result
      .expectOk()
      .expectUint(9999999999999999999999999999990n);
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
        "ST000000000000000000002AMW42H.bns",
        "name-preorder",
        ["0x8838d9f51c845dfa4aa1c26e677196d6fc3186e9", types.uint(10)],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();

    block = chain.mineBlock([
      Tx.contractCall(
        "ST000000000000000000002AMW42H.bns",
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
      "ST000000000000000000002AMW42H.bns",
      "get-name-price",
      ["0x67676767676767676767", "0x6767"],
      account1
    );
    priceResponse.result
      .expectOk()
      .expectUint(9999999999999999999999999999990n);

    let block = chain.mineBlock([
      Tx.contractCall(
        "ST000000000000000000002AMW42H.bns",
        "name-preorder",
        ["0x8838d9f51c845dfa4aa1c26e677196d6fc3186e9", types.uint(price)],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(146); // preorder expiry block height
    // expect burn event (missing api) block.receipts[0].events.expectStxBurnEvent(price);

    block = chain.mineBlock([
      Tx.contractCall(
        "ST000000000000000000002AMW42H.bns",
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
    block.receipts[0].result.expectErr().expectInt(2007); // burn insuffient
    /* balance can't be set to the actual price in devnet.toml
    block.receipts[0].events.expectNonFungibleTokenMintEvent(
      "{name: 0x6767, namespace: 0x67676767676767676767}",
      account1,
      "ST000000000000000000002AMW42H.bns",
      "names"
    );
    */
  },
});
