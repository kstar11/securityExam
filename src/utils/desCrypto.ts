import CryptoJS from 'crypto-js';

export const encryptByDES = (text: string, key: string) => {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.DES.encrypt(text, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const hexStr = encrypted.ciphertext.toString().toUpperCase();
  // return CryptoJS.enc.Hex.parse(hexStr).toString();\
  return encrypted.toString();
};

export const decryptByDES = (pwd: string, key: string) => {
  // const hexStr = CryptoJS.enc.Hex.parse(pwd);
  // const pwdStr = CryptoJS.enc.Base64.stringify(hexStr);
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const decrypted = CryptoJS.DES.decrypt(pwd, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const result_value = decrypted.toString(CryptoJS.enc.Utf8);
  return result_value;
};

export const toMD5 = (pwd: string) => {
  return CryptoJS.MD5(pwd).toString();
};

export const DES_KEY = 'fsst###***';
