const AUTHOR_NAME_REGEX = /@(.*)\./;

export function getAuthorShortName(address: string): string {
  const result = AUTHOR_NAME_REGEX.exec(address);

  if (result) {
    return result[1];
  }

  return address;
}
