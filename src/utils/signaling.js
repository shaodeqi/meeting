import { handleMessageData } from '@/utils';
const prefix = 'signaling';

export class Signaling extends EventTarget {
  constructor(socket, user) {
    super();
    this.user = user;
    this.socket = socket;

    this.socket.addEventListener('message', async ({ data }) => {
      const payload = await handleMessageData(data);
      if (
        payload.cmd === 'send' &&
        payload.data.type === `${prefix}.${this.user}`
      ) {
        const event = new CustomEvent('message', {
          detail: { ...payload.data.content, from: payload.user },
        });
        this.dispatchEvent(event);
      }
    });
  }
  send(content, toUser) {
    this.socket.send(
      JSON.stringify({
        cmd: 'send',
        data: {
          type: `${prefix}.${toUser}`,
          content,
        },
        users: toUser ? [toUser] : [],
      }),
    );
  }
}
