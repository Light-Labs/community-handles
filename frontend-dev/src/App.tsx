import reactLogo from './assets/react.svg';
import './App.css';

import * as MicroStacks from '@micro-stacks/react';
import { WalletConnectButton } from './components/wallet-connect-button';
import { UserCard } from './components/user-card';
import { NamespaceBuyButton } from './components/namespace-buy-button';
import { namesApi, network } from './lib/stacksApi';
import { useEffect, useState } from 'react';
import { name, namespace, pubkey, signature } from './lib/constants';
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
      <p className="read-the-docs">You should know what you are doing</p>
      {stxAddress && (
        <>
          <NamespaceBuyButton
            stxAddress={stxAddress}
            namespaceContract={{
              address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
              name: 'neutral-gold-scorpion',
            }}
            namespace={namespace}
            stxToBurn={stxToBurn || 0}
          />

          <NamespaceSetOwnerButton
            stxAddress={stxAddress}
            namespaceContract={{
              address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
              name: 'neutral-gold-scorpion',
            }}
            namespace={namespace}
            newOwner={{
              address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
              name: 'superior-yellow-gecko',
            }}
          />
          <OwnerPubkeyButton
            stxAddress={stxAddress}
            contract={{
              address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
              name: 'superior-yellow-gecko',
            }}
            namespace={namespace}
            pubkey={pubkey}
          />

          <RegisterNameButton
            stxAddress={stxAddress}
            contract={{
              address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
              name: 'superior-yellow-gecko',
            }}
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
