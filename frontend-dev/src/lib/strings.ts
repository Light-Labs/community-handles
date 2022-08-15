import { hashRipemd160 } from 'micro-stacks/crypto';

export function addSaltAndhash160(string: string, salt: string) {
  return hashRipemd160(
    Uint8Array.from(
      string
        .split('')
        .map(x => x.charCodeAt(0))
        .concat(salt.split('').map(x => x.charCodeAt(0)))
    )
  );
}

export const fromHexString = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
