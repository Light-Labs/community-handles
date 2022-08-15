import reactLogo from './assets/react.svg';
import './App.css';

import * as MicroStacks from '@micro-stacks/react';
import { WalletConnectButton } from './components/wallet-connect-button';
import { UserCard } from './components/user-card';
import { NamespaceRevealButton } from './components/namespace-reveal-button';
import { namesApi, network } from './lib/stacksApi';
import { useEffect, useState } from 'react';
import { communityHandlesContract, name, namespaces, pubkey, signature } from './lib/constants';
import { OwnerPubkeyButton } from './components/owner-pubkey-button';
import { NamespaceSetControllerButton } from './components/namespace-set-controller-button';
import { NamespacePreorderButton } from './components/namespace-preorder-button';
import { RevealNameButton } from './components/reveal-name-button';
import { PreorderNameButton } from './components/preorder-name-button';

const { namespace, salt, controllerContract } = namespaces.nnnnnnno as {
  namespace: string;
  salt: string;
  controllerContract?: { address: string; name: string };
};

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
          <NamespacePreorderButton
            stxAddress={stxAddress}
            communityHandlesContract={communityHandlesContract}
            namespace={namespace}
            stxToBurn={stxToBurn || 0}
            salt={salt}
          />

          <NamespaceRevealButton
            stxAddress={stxAddress}
            communityHandlesContract={communityHandlesContract}
            namespace={namespace}
            salt={salt}
          />

          {controllerContract?.name && (
            <NamespaceSetControllerButton
              stxAddress={stxAddress}
              namespaceContract={communityHandlesContract}
              namespace={namespace}
              newController={controllerContract}
            />
          )}

          {controllerContract && (
            <>
              <p className="read-the-docs">Setup the namespace controller</p>

              <OwnerPubkeyButton
                stxAddress={stxAddress}
                contract={controllerContract}
                namespace={namespace}
                pubkey={pubkey}
              />

              <p className="read-the-docs">Register a name</p>

              <PreorderNameButton
                stxAddress={stxAddress}
                contract={controllerContract}
                namespace={namespace}
                name={name}
                salt={salt}
              />

              <RevealNameButton
                stxAddress={stxAddress}
                contract={controllerContract}
                namespace={namespace}
                name={name}
                salt={salt}
                signature={signature}
                zoneFileHash={'0x010203'}
              />
            </>
          )}
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
