import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { createStacksPrivateKey, signWithKey } from 'micro-stacks/transactions';

export const mainnet = false;
export const communityHandlesContract = mainnet
  ? {
      address: 'SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS',
      name: 'community-handles-v2',
    }
  : {
      address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
      name: 'molecular-aqua-zebra',
    };

export const namespaces = mainnet
  ? {
      mega: { namespace: 'mega', salt: 'pont' },
      fren: { namespace: 'fren', salt: 'bot' },
      bitcoinmonkey: { namespace: 'bitcoinmonkey', salt: 'family' },
      satoshible: { namespace: 'satoshible', salt: 'bridge' },
      stacksparrot: { namespace: 'stacksparrot', salt: 'bird' },
      citycoins: { namespace: 'citycoins', salt: 'cities' },
      crashpunk: { namespace: 'crashpunk', salt: 'snowflake' },
    }
  : {
      nnnnnnno: {
        namespace: 'nnnnnnoo',
        salt: 'yes',
        controllerContract: {
          address: 'ST2Z3FFKYT0MGAGWP8A8NZJZHGWW4Q3VGBSC1NDEB',
          name: 'panicky-fuchsia-marlin',
        },
      },
    };

export const lifetime = 144 * 365;

const privateKey = createStacksPrivateKey('deadbeaf...privatekey');

// public key of approver as hex without prefix
export const pubkey = '027881a9f9e209b2e22cb1c6eb486d41b142abaacbdd755bfcff41d3e3851c83d5';

// as ascii
export const name = 'oo';
// as hex without prefix

export function signatureVrsToRsv(sig: string) {
  return sig.slice(2) + sig.slice(0, 2);
}

async function approve(name: string) {
  const input = hashSha256(utf8ToBytes(`${name}yes`));
  const data = await signWithKey(privateKey, bytesToHex(input));
  console.log({ data });
  return signatureVrsToRsv(data.data);
}

export const signature = await approve(`${name}.nnnnnnoo`);
