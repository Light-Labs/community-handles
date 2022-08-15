import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that user can preorder and register a namespace",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    setupNamespace(chain, deployer);

    const response = chain.callReadOnlyFn(
      "community-handles",
      "get-namespace-controller",
      ["0x67676767676767676767"],
      account1
    );
    response.result.expectSome().expectPrincipal(deployer);
  },
});

Clarinet.test({
  name: "Ensure that user can't register namespace with wrong salt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    const hashResponse = chain.callReadOnlyFn(
      "crypto",
      "crypto-hash160",
      ["0x6767676767676767676700"],
      deployer
    );
    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "namespace-preorder",
        [hashResponse.result, types.uint(640_000_000)],
        deployer
      ),
      Tx.contractCall(
        "community-handles",
        "namespace-reveal",
        ["0x67676767676767676767", "0xff", types.uint(1000), types.none()],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk();
    block.receipts[1].result.expectErr().expectInt(1001);
  },
});

Clarinet.test({
  name: "Ensure that user don't control namespace when called via contract with no controller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    let block = chain.mineBlock([
      Tx.contractCall("register-namespace", "do-it", [types.none()], deployer),
    ]);
    block.receipts[0].result.expectOk();

    const response = chain.callReadOnlyFn(
      "community-handles",
      "get-namespace-controller",
      ["0x67676767676767676767"],
      account1
    );
    response.result
      .expectSome()
      .expectPrincipal(`${deployer}.register-namespace`);
  },
});

Clarinet.test({
  name: "Ensure that user does control namespace when called via contract with user as controller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    let block = chain.mineBlock([
      Tx.contractCall(
        "register-namespace",
        "do-it",
        [types.some(types.principal(account1))],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk();

    const response = chain.callReadOnlyFn(
      "community-handles",
      "get-namespace-controller",
      ["0x67676767676767676767"],
      account1
    );
    response.result.expectSome().expectPrincipal(account1);
  },
});

Clarinet.test({
  name: "Ensure that user does control namespace when called via contract and user as controller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;

    let block = chain.mineBlock([
      Tx.contractCall(
        "register-namespace",
        "do-it",
        [types.some(types.principal(deployer))],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk();

    const response = chain.callReadOnlyFn(
      "community-handles",
      "get-namespace-controller",
      ["0x67676767676767676767"],
      account1
    );
    response.result.expectSome().expectPrincipal(deployer);
  },
});

Clarinet.test({
  name: "Ensure that controller can't register names after price function editing was revoked",
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

      Tx.contractCall(
        "SP000000000000000000002Q6VF78.bns",
        "namespace-revoke-function-price-edition",
        ["0x67676767676767676767"],
        deployer
      ),

      Tx.contractCall(
        "community-handles",
        "namespace-revoke-function-price-edition",
        ["0x67676767676767676767"],
        deployer
      ),

      Tx.contractCall(
        "community-handles",
        "name-register",
        [
          "0x67676767676767676767",
          "0x6868",
          types.principal(account2),
          "0x0102030405060708090a",
        ],
        deployer
      ),
    ]);

    // register name
    block.receipts[0].result.expectOk().expectBool(true);
    // try to block price function editing via bns
    block.receipts[1].result
      .expectErr()
      // unauthorized because owned by contract
      .expectInt(1011);

    // do block price function editing via community handles
    block.receipts[2].result.expectOk().expectBool(true);

    // try to register a name for another user
    block.receipts[3].result
      .expectErr()
      // unauthorized to change the price function for cheap name registration
      .expectUint(1011);
  },
});
