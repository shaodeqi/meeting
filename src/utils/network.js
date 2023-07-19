export const listenNetwork = (cb) => {
  globalThis.addEventListener('offline', cb);
  globalThis.addEventListener('online', cb);

  return () => {
    globalThis.removeEventListener('offline', cb);
    globalThis.removeEventListener('online', cb);
  };
};
