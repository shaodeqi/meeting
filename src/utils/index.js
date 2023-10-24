export * from './constants';
export * from './string';
export * from './multi-rtc-peer-connection';
export * from './signaling';
// export * from './signaling';

export const notify = (title, body = '') => {
  if (!('Notification' in globalThis)) {
    return;
  }
  const _notify = () => {
    new Notification(title, {
      body,
      vibrate: true,
      icon: '/meeting.svg',
    }).onclick = () => {
      globalThis.focus();
    };
  };

  if (Notification.permission === 'granted') {
    _notify();
    globalThis.focus();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        _notify();
      }
    });
  }
};

export const type = (content) =>
  Object.prototype.toString.call(content).slice(8, -1);

export const handleMessageData = async (data) => {
  let payloadStr = data;
  if (type(data) === 'Blob') {
    payloadStr = await data.text();
  }
  let payload = {};
  try {
    payload = JSON.parse(payloadStr);
  } catch (e) {
    console.error(e);
  }
  return payload;
};
