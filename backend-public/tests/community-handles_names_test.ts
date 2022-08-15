import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that controller can register name cheaply and bns price is still high",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const anyAccount = accounts.get("wallet_2")!.address;
    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // check name owner
    const ownerResponse = chain.callReadOnlyFn(
      "SP000000000000000000002Q6VF78.bns",
      "name-resolve",
      ["0x67676767676767676767", "0x6767"],
      anyAccount
    );
    ownerResponse.result
      .expectOk()
      .expectTuple()
      ["owner"].expectPrincipal(account1);

    // check bns price
    const priceResponse = chain.callReadOnlyFn(
      "SP000000000000000000002Q6VF78.bns",
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
  name: "Ensure that controller can't renew not-owned name cheaply",
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
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),

      Tx.contractCall(
        "community-handles",
        "name-renewal",
        [
          "0x67676767676767676767",
          "0x6767",
          types.uint(1),
          types.none(),
          types.none(),
        ],
        deployer // namespace controller not owning the name
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(2006); // not authorized operation
  },
});

Clarinet.test({
  name: "Ensure that owner can't renew owned name",
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
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),

      Tx.contractCall(
        "community-handles",
        "name-renewal",
        [
          "0x67676767676767676767",
          "0x6767",
          types.uint(1),
          types.none(),
          types.none(),
        ],
        account1 // name owner
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(403); // not authorized operation
  },
});

Clarinet.test({
  name: "Ensure that another user can re-register owned name after expiry before end of grace period",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    chain.mineEmptyBlock(999);

    block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          types.principal(account2),
          "0x0102030405060708090a",
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(2004); // name unavailable

    block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          types.principal(account2),
          "0x0102030405060708090a",
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that owner can renew name pricely via bns (without paying the fees due to bug in stacks 2.0)",
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
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),

      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-renewal",
        [
          "0x67676767676767676767",
          "0x6767",
          types.uint(9999999999999999999999999999990n),
          types.none(),
          types.none(),
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that owner can transfer name",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6767",
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // check current name owner
    let ownerResponse = chain.callReadOnlyFn(
      "SP000000000000000000002Q6VF78.bns",
      "name-resolve",
      ["0x67676767676767676767", "0x6767"],
      account2
    );
    let nameData = ownerResponse.result.expectOk().expectTuple();
    nameData["owner"].expectPrincipal(account1);
    nameData["lease-ending-at"].expectSome().expectUint(1002);

    chain.mineEmptyBlock(800); // lifetime is 1000

    block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-transfer",
        [
          "0x67676767676767676767",
          "0x6767",
          types.principal(account2),
          types.none(),
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // check new name owner
    ownerResponse = chain.callReadOnlyFn(
      "SP000000000000000000002Q6VF78.bns",
      "name-resolve",
      ["0x67676767676767676767", "0x6767"],
      account2
    );
    nameData = ownerResponse.result.expectOk().expectTuple();
    nameData["owner"].expectPrincipal(account2);
    nameData["lease-ending-at"].expectSome().expectUint(1002); // lease does not change on transfer
    nameData["zonefile-hash"].expectBuff(new Uint8Array([])); // no zonefile hash was set during transfer
  },
});

Clarinet.test({
  name: "Ensure that owner can update name",
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
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-update",
        ["0x67676767676767676767", "0x6767", "0x0102030405060708090b"],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that owner can revoke name",
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
          types.principal(account1),
          "0x0102030405060708090a",
        ],
        deployer
      ),

      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-revoke",
        ["0x67676767676767676767", "0x6767"],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that controller can register names in bulk cheaply and bns price is still high",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

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
            types.tuple({
              name: "0x6868",
              "zonefile-hash": "0x0102030405060708090b",
              owner: types.principal(account2),
            }),
          ]),
        ],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    const priceResponse = chain.callReadOnlyFn(
      "SP000000000000000000002Q6VF78.bns",
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
    priceResponse.result
      .expectOk()
      .expectUint(9999999999999999999999999999990n);

    let block = chain.mineBlock([
      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "name-preorder",
        ["0x8838d9f51c845dfa4aa1c26e677196d6fc3186e9", types.uint(price)],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectUint(146); // preorder expiry block height
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
    block.receipts[0].result.expectErr().expectInt(2007); // burn insuffient
    /* balance can't be set to the actual price in devnet.toml
    block.receipts[0].events.expectNonFungibleTokenMintEvent(
      "{name: 0x6767, namespace: 0x67676767676767676767}",
      account1,
      "SP000000000000000000002Q6VF78.bns",
      "names"
    );
    */
  },
});
