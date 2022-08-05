export function hashString(string: string) {
  return string;
}

export const fromHexString = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
