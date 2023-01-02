import { isErr, parseAuthorAddress, parseShareAddress } from "earthstar";

export function getAuthorShortName(address: string): string {
  const parsedAuthor = parseAuthorAddress(address);
  if (isErr(parsedAuthor)) {
    return address;
  }

  return parsedAuthor.name;
}

export function getShareName(address: string) {
  const parsedShareAddress = parseShareAddress(address);

  if (isErr(parsedShareAddress)) {
    return address;
  }

  return parsedShareAddress.name;
}
