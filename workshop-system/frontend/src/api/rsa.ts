import request from './request';
import JSEncrypt from 'jsencrypt';

let cachedPublicKey: string | null = null;

function toPemFormat(rawBase64: string): string {
  if (rawBase64.includes('-----BEGIN')) {
    return rawBase64;
  }
  return '-----BEGIN PUBLIC KEY-----\n' + rawBase64 + '\n-----END PUBLIC KEY-----';
}

export async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }
  const res = await request.get('/auth/public-key');
  cachedPublicKey = toPemFormat(res.data.data.publicKey);
  return cachedPublicKey!;
}

export function encryptPassword(password: string, publicKey: string): string {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(password);
  if (!encrypted) {
    throw new Error('密码加密失败');
  }
  return encrypted;
}

export async function encryptPasswordAsync(password: string): Promise<string> {
  const publicKey = await getPublicKey();
  return encryptPassword(password, publicKey);
}
