import { Clarinet, Tx, Chain, Account, types } from "./deps.ts";
import { setupNamespace, setupNamespace2 } from "./utils.ts";

Clarinet.test({
  name: "Ensure that users can register approved names",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace2(chain, deployer);
    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        ["0x67676767676767676767", `'${deployer}.ryder-handles-controller`],
        deployer
      ),
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        ["0x68686868686868686868", `'${deployer}.ryder-handles-controller`],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);

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
        "ryder-handles-controller",
        "set-approval-pubkey",
        [
          "0x02a3b986401a619013ee1deee0ccba58a5b2235260d55259106e5fc9c53e6a9d71",
        ],
        deployer
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-preorder",
        [hashResponse1.result],
        account1
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-register",
        [
          "0x67676767676767676767",
          "0x3131",
          "0x00",
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          types.principal(account1),
          "0x01020304",
        ],
        account1
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-preorder",
        [hashResponse2.result],
        account2
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-register",
        [
          "0x67676767676767676767",
          "0x3232",
          "0x00",
          "0xb045f07cc9ebcba2cefce1191271d2a740a2f8e58987edf80a7813c51797ab8c085be7ccd4c45bda051179a2037dce166d20ca58ada462dad08eeb45427e74c301",
          types.principal(account2),
          "0x01020304",
        ],
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // preorder and register a name
    block.receipts[1].result.expectOk().expectUint(148);
    block.receipts[2].result.expectOk().expectBool(true);

    // fees are sent to controller-admin and escrow on preorder
    block.receipts[1].events.expectSTXTransferEvent(
      6999999,
      account1,
      deployer
    );
    block.receipts[1].events.expectSTXTransferEvent(
      3000000,
      account1,
      `${deployer}.ryder-handles-controller`
    );

    // fees in escrow are sent to community treasury on register
    block.receipts[2].events.expectSTXTransferEvent(
      3000000,
      `${deployer}.ryder-handles-controller`,
      deployer
    );

    // preorder and register a second name
    block.receipts[3].result.expectOk().expectUint(148);
    block.receipts[4].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that fees are paid to community treasury",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        ["0x67676767676767676767", `'${deployer}.ryder-handles-controller`],
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

    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "set-approval-pubkey",
        [
          "0x02a3b986401a619013ee1deee0ccba58a5b2235260d55259106e5fc9c53e6a9d71",
        ],
        deployer
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "set-community-treasury",
        ["0x67676767676767676767", types.principal(account2)],
        deployer
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-preorder",
        [hashResponse1.result],
        account1
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-register",
        [
          "0x67676767676767676767",
          "0x3131",
          "0x00",
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          types.principal(account1),
          "0x01020304",
        ],
        account1
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // set treasury
    block.receipts[1].result.expectOk().expectBool(true);
    // preorder and register a name
    block.receipts[2].result.expectOk().expectUint(147);
    block.receipts[3].result.expectOk().expectBool(true);

    // fees are sent to controller-admin and escrow on preorder
    block.receipts[2].events.expectSTXTransferEvent(
      6999999,
      account1,
      deployer
    );
    block.receipts[2].events.expectSTXTransferEvent(
      3000000,
      account1,
      `${deployer}.ryder-handles-controller`
    );

    // fees in escrow are sent to community treasury on register
    block.receipts[3].events.expectSTXTransferEvent(
      3000000,
      `${deployer}.ryder-handles-controller`,
      account2
    );
  },
});

Clarinet.test({
  name: "Ensure that unused fees can be claimed after preorder expired",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        ["0x67676767676767676767", `'${deployer}.ryder-handles-controller`],
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

    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "set-approval-pubkey",
        [
          "0x02a3b986401a619013ee1deee0ccba58a5b2235260d55259106e5fc9c53e6a9d71",
        ],
        deployer
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "set-community-treasury",
        ["0x67676767676767676767", types.principal(account2)],
        deployer
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-preorder",
        [hashResponse1.result],
        account1
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    // preorder name only
    block.receipts[2].result.expectOk().expectUint(147);

    // fees are sent to controller-admin and escrow on preorder
    block.receipts[2].events.expectSTXTransferEvent(
      6999999,
      account1,
      deployer
    );
    block.receipts[2].events.expectSTXTransferEvent(
      3000000,
      account1,
      `${deployer}.ryder-handles-controller`
    );

    chain.mineEmptyBlock(143);

    // try to claim too early
    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "claim-fees",
        [hashResponse1.result, types.principal(account1)],
        account2
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(503); // too early

    // claim fees
    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "claim-fees",
        [hashResponse1.result, types.principal(account1)],
        account2
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // fees in escrow are sent to controller-admin not to tx-sender(account2)
    block.receipts[0].events.expectSTXTransferEvent(
      3000000,
      `${deployer}.ryder-handles-controller`,
      deployer
    );
  },
});

Clarinet.test({
  name: "Ensure that users can renewal approved name",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        ["0x67676767676767676767", `'${deployer}.ryder-handles-controller`],
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

    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "set-approval-pubkey",
        [
          "0x02a3b986401a619013ee1deee0ccba58a5b2235260d55259106e5fc9c53e6a9d71",
        ],
        deployer
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-preorder",
        [hashResponse1.result],
        account1
      ),
      Tx.contractCall(
        "ryder-handles-controller",
        "name-register",
        [
          "0x67676767676767676767",
          "0x3131",
          "0x00",
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          types.principal(account1),
          "0x01020304",
        ],
        account1
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectUint(147);
    block.receipts[2].result.expectOk().expectBool(true);

    chain.mineEmptyBlock(99);

    // try to renew with same approval
    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "name-renewal",
        [
          "0x67676767676767676767",
          "0x3131",
          "0x00",
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          types.none(),
          types.none(),
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(501); // signature already used


    block = chain.mineBlock([
      // test behaviour of changes pubkey (works also without this and the
      // correct keys)
      Tx.contractCall(
        "ryder-handles-controller",
        "set-approval-pubkey",
        [
          "0x02ff2a4519d4dce14a7938aeaedc66cb45c1078eae961bb892c10c2a6704a51e44",
        ],
        deployer
      ),
      // controller admin sets treasury
      Tx.contractCall(
        "ryder-handles-controller",
        "set-community-treasury",
        ["0x67676767676767676767", types.principal(account2)],
        deployer
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);

    // renew with new approval signature
    block = chain.mineBlock([
      Tx.contractCall(
        "ryder-handles-controller",
        "name-renewal",
        [
          "0x67676767676767676767",
          "0x3131",
          "0x01",
          "0x7eb3a3db1cff3c0296ce071d95fea1296b956f5b1165ae11dcb5eec3dc5dff0d71a3098d189e76a67d839512cb8daf983b8a34e87e84d55b8e57be16afdfe7d201",
          types.none(),
          types.none(),
        ],
        account1
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // fees are sent to controller-admin and community
    block.receipts[0].events.expectSTXTransferEvent(
      6999999,
      account1,
      deployer
    );
    block.receipts[0].events.expectSTXTransferEvent(
      3000000,
      account1,
      account2
    );
  },
});
