import * as crypto from 'crypto';

export function isMd5(string: string) {
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(string); // true
}

export function compareMD5Hash(inputString, md5Hash) {
  const hash = crypto.createHash('md5').update(inputString).digest('hex');
  return hash === md5Hash;
}
