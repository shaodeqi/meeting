export class MultiRTCPeerConnection extends EventTarget {
  constructor(peers, signaling) {
    super();
    this.peers = peers;
    this.connections = [];
    this.signaling = signaling;

    this.listen();

    peers.forEach(async (peer) => {
      console.log(`准备与${peer}建立连接`);
      await this.join(peer);
    });
  }

  listen() {
    const { signaling, connections, join } = this;

    signaling.addEventListener(
      'message',
      async ({
        detail: {
          from,
          content: { type, data },
        },
      }) => {
        let connection = connections.find((connection) => {
          return connection.peer === from;
        });

        if (!connection) {
          console.log('未找到匹配的 connection, 重新创建');
          connection = await join.call(this, from, true);
        }

        switch (type) {
          case 'offer':
            console.log('收到offer', data);
            connection.setRemoteDescription(data);
            const answer = await connection.createAnswer();
            signaling.send({ type: 'answer', data: answer }, from);
            console.log('发送answer', answer);
            connection.setLocalDescription(answer);
            break;

          case 'answer':
            console.log('收到 answer', data);
            console.log('setRemoteDescription', data, connection);
            connection.setRemoteDescription(data);
            break;

          case 'candidate':
            console.log('收到 candidate', data);
            connection.addIceCandidate(data);
            break;
        }
      },
    );
  }

  async join(peer, passive = false) {
    const { signaling, connections } = this;
    const connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun.l.google.com:19302?transport=udp',
            'stun:stun.services.mozilla.com',
          ],
        },
      ],
    });

    console.log('创建 RTCPeerConnection', peer);

    connection.peer = peer;

    const sendOffer = async (connection) => {
      const offer = await connection.createOffer({
        // offerToReceiveAudio: true,
        // offerToReceiveVideo: true,
        // iceRestart: true,
      });
      connection.setLocalDescription(offer);
      signaling.send(
        {
          type: 'offer',
          data: offer,
        },
        connection.peer,
      );
      console.log('发送offer', offer);
    };

    connection.addEventListener('icecandidate', ({ candidate }) => {
      if (!candidate) {
        return;
      }
      signaling.send({ type: 'candidate', data: candidate }, connection.peer);
    });
    connection.addEventListener('negotiationneeded', async (event) => {
      console.log('negotiationneeded');
      sendOffer(connection);
    });
    connection.addEventListener('connectionstatechange', async () => {
      if (connection.connectionState === 'connected') {
        console.log('我的对等连接成功！', +new Date());
      }
      if (connection.connectionState === 'disconnected') {
        console.log('我的连接已断开！', +new Date());
      }
    });

    connection.addEventListener('track', async (event) => {
      const trackEvent = new CustomEvent('track', {
        detail: event,
      });
      this.dispatchEvent(trackEvent);
    });

    if (!passive) {
      sendOffer(connection);
    }

    connections.push(connection);
    return connection;
  }

  getSenders() {
    return this.connections?.[0].getSenders();
  }
  addTrack(track, stream) {
    this.connections.map((connection) => connection.addTrack(track, stream));
  }
  removeTrack(senders) {
    this.connections.forEach((connection) => {
      connection.removeTrack(senders);
    });
  }
}
