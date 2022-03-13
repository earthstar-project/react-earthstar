import { isErr, parseAuthorAddress } from "earthstar";

export function getAuthorShortName(address: string): string {
  const parsedAuthor = parseAuthorAddress(address);
  if (isErr(parsedAuthor)) {
    return address;
  }

  return parsedAuthor.name;
}

const WORKSPACE_NAME_REGEX = /\+(.*)\./;

export function getWorkspaceName(address: string) {
  const result = WORKSPACE_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}

export function makeStorageKey(customKey: string | undefined, key: string) {
  if (!customKey) {
    return `earthstar-peer-${key}`;
  }

  return `earthstar-peer-${customKey}-${key}`;
}

export function getLocalStorage<T>(key: string): T | null {
  const value = localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
