import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { setupNamespace } from "./utils.ts";

Clarinet.test({
  name: "Ensure that user can register names after changing controller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    // setup controller
    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        [
          "0x67676767676767676767",
          `'${deployer}.preordering-namespace-controller`,
        ],
        deployer
      ),
      Tx.contractCall(
        "preordering-namespace-controller",
        "bulk-order",
        [
          types.list([
            types.tuple({
              owner: types.principal(account1),
              name: "0x3131",
              price: types.uint(2),
            }),
          ]),
        ],
        deployer
      ),
      Tx.contractCall(
        "preordering-namespace-controller",
        "name-register",
        ["0x3131", "0x01020304"],
        account1
      ),
      Tx.contractCall(
        "preordering-namespace-controller",
        "set-namespace-controller",
        [`'${deployer}.preordering-namespace-controller-2`],
        deployer
      ),
      Tx.contractCall(
        "preordering-namespace-controller-2",
        "bulk-order",
        [
          types.list([
            types.tuple({
              owner: types.principal(account2),
              name: "0x3232",
              price: types.uint(9999999),
            }),
          ]),
        ],
        deployer
      ),
      Tx.contractCall(
        "preordering-namespace-controller-2",
        "name-register",
        ["0x3232", "0x01020304"],
        account2
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectList()[0].expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    // change controller
    block.receipts[3].result.expectOk().expectBool(true);
    block.receipts[4].result.expectOk().expectList()[0].expectBool(true);
    block.receipts[5].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that user can renewal cheaply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!.address;
    const account1 = accounts.get("wallet_1")!.address;
    const account2 = accounts.get("wallet_2")!.address;

    setupNamespace(chain, deployer);

    const hashResponse1 = chain.callReadOnlyFn(
      "crypto",
      "crypto-hash160",
      ["0x31312e6767676767676767676700"],
      deployer
    );

    // setup controller
    let block = chain.mineBlock([
      Tx.contractCall(
        "community-handles",
        "set-namespace-controller",
        [
          "0x67676767676767676767",
          `'${deployer}.approving-namespace-controller`,
        ],
        deployer
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "set-approval-pubkey",
        [
          "0x02a3b986401a619013ee1deee0ccba58a5b2235260d55259106e5fc9c53e6a9d71",
        ],
        deployer
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-preorder",
        [hashResponse1.result],
        account1
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-reveal",
        [
          "0x3131",
          "0x00",
          types.principal(account1),
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          "0x01020304",
        ],
        account1
      ),
      Tx.contractCall(
        "approving-namespace-controller",
        "name-renewal",
        [
          "0x3131",
          "0x00",
          "0xd693e8d1d558a5aabff258de2bd5ec6da5eea52ec9b45e4c2c9f34aa547cabb3235ad7223adf3a8d4e51f3cd7fbefdc001fcee9d3e8ddda4643c42dcea07bb6700",
          types.none(),
          types.some("0x01020304"),
        ],
        account1
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectUint(146);
    block.receipts[3].result.expectOk().expectBool(true);
    console.log(block.receipts[3].events);
  },
});
