export * from './constants';

export const type = (content) =>
  Object.prototype.toString.call(content).slice(8, -1);

export const randomString = (min = 43, max = min) => {
  const chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charsLength = chars.length;
  let randomCharsLengh = Math.floor(
    min + Math.random() * (Math.abs(max - min) + 1)
  );

  let result = '';
  while (randomCharsLengh--) {
    const randomCharIndex = Math.floor(Math.random() * charsLength);
    result += chars[randomCharIndex];
  }
  return result;
};
