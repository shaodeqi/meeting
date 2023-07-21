export * from './constants';
export * from './string';

export const notify = (title, body = '') => {
  if (!('Notification' in globalThis)) {
    return;
  }
  const _notify = () => {
    new Notification(title, {
      body,
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
