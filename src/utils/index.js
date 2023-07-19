export * from './constants';
export * from './string';

export const notify = (title, body) => {
  if (!('Notification' in globalThis)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
};

export const type = (content) =>
  Object.prototype.toString.call(content).slice(8, -1);
