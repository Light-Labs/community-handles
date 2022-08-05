import reactLogo from './assets/react.svg';
import './App.css';

import * as MicroStacks from '@micro-stacks/react';
import { WalletConnectButton } from './components/wallet-connect-button';
import { UserCard } from './components/user-card';
import { NamespaceBuyButton } from './components/namespace-buy-button';
import { namesApi, network } from './lib/stacksApi';
import { useEffect, useState } from 'react';
import {
  daoNamesContract,
  name,
  namespace,
  ownerContract,
  ownerContractName,
  pubkey,
  signature,
} from './lib/constants';
import { OwnerPubkeyButton } from './components/owner-pubkey-button';
import { RegisterNameButton } from './components/register-name-button';
import { NamespaceSetOwnerButton } from './components/namespace-set-owner-button';

function Contents() {
  const { stxAddress } = MicroStacks.useAccount();
  const [stxToBurn, setStxToBurn] = useState<number>();

  useEffect(() => {
    const fn = async () => {
      const price = await namesApi.getNamespacePrice({
        tld: namespace,
      });
      console.log(price.amount);
      setStxToBurn(parseInt(price.amount));
    };
    fn();
  }, [setStxToBurn, namesApi]);
  return (
    <>
      <div className={'logos'}>
        <a
          href="https://vitejs.dev"
          target="_blank"
        >
          <img
            src="/vite.svg"
            className="logo"
            alt="Vite logo"
          />
        </a>
      </div>
      <h1>BNS Ryder admin</h1>
      <div className="card">
        <UserCard />
        <WalletConnectButton />
        <p
          style={{
            display: 'block',
            marginTop: '40px',
          }}
        >
          Manage the namespace
        </p>
      </div>

      {stxAddress && (
        <>
          <p className="read-the-docs">Add the new namespace</p>
          <NamespaceBuyButton
            stxAddress={stxAddress}
            namespaceContract={daoNamesContract}
            namespace={namespace}
            stxToBurn={stxToBurn || 0}
          />

          <NamespaceSetOwnerButton
            stxAddress={stxAddress}
            namespaceContract={daoNamesContract}
            namespace={namespace}
            newOwner={ownerContract}
          />

          <p className="read-the-docs">Setup the namespace owner</p>

          <OwnerPubkeyButton
            stxAddress={stxAddress}
            contract={ownerContract}
            namespace={namespace}
            pubkey={pubkey}
          />
          <p className="read-the-docs">Register a name</p>

          <RegisterNameButton
            stxAddress={stxAddress}
            contract={ownerContract}
            namespace={namespace}
            name={name}
            signature={signature}
            zoneFileHash={'0x010203'}
          />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <MicroStacks.ClientProvider
      appName={'BNS admin'}
      appIconUrl={reactLogo}
      network={network}
    >
      <Contents />
    </MicroStacks.ClientProvider>
  );
}
