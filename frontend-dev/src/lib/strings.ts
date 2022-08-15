import { utf8ToBytes } from 'micro-stacks/common';
import { hashRipemd160, ripemd160 } from 'micro-stacks/crypto';
import { hashSha256 } from 'micro-stacks/crypto-sha';

export function addSaltAndhash160(string: string, salt: string) {
  return hashRipemd160(hashSha256(utf8ToBytes(`${string}${salt}`)));
}

export const fromHexString = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
