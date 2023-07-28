export class MultiRTCPeerConnection extends EventTarget {
  constructor(peers, signaling) {
    this.peers = peers;
    this.signaling = signaling;
    this.connections = [];

    peers.forEach((peer) => {
      let connection = new RTCPeerConnection({
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

      connection.addEventListener('negotiationneeded', (event) => {
        connection.createOffer();
      });

      signaling.send;
    });
  }
}
// 分享方
export class Sharer extends EventTarget {
  constructor(stream, toUsers = [], signaling) {
    super();
    this.connections = [];
    this.stream = stream;
    this.signaling = signaling;
    this.toUsers = toUsers;
  }

  async create() {
    this.toUsers.forEach((user) => {
      this.join(user);
    });

    this.listenEvents();
    return this;
  }

  async join(user) {
    let connection = this.connections.find(
      (connection) => connection.peer === user,
    );
    if (connection) {
      console.log('connection', connection);
    }

    if (!connection || connection.connectionState !== 'connected') {
      connection = this.addConnection(user);
      this.addStream(connection);
    }

    // await this.sendOffer(connection);
  }

  addConnection(user) {
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

    connection.peer = user;
    connection.onicecandidate = ({ candidate }) => {
      console.log('candidate', candidate);
      if (!candidate) {
        return;
      }
      this.signaling.send(
        { type: 'candidate', data: candidate },
        connection.peer,
      );
    };
    connection.onconnectionstatechange = async () => {
      if (connection.connectionState === 'connected') {
        console.log('对等连接成功！', +new Date());
      }
      if (connection.connectionState === 'disconnected') {
        console.log('连接已断开！', +new Date());
      }
    };
    connection.addEventListener('negotiationneeded', (event) => {
      this.sendOffer(connection);
    });
    this.connections.push(connection);
    return connection;
  }

  // 添加流
  async addStream(connection) {
    this.stream.getTracks().forEach((track) => {
      console.log('addTrack', connection, this.stream);
      connection.addTrack(track, this.stream);
    });
  }

  async stop() {
    this.stream?.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // 事件监听
  listenEvents() {
    // 信令服务收到消息
    this.signaling.addEventListener('message', ({ detail: message }) => {
      const { connections } = this;
      const { type, data, from } = message;
      const connection = connections.find((connection) => {
        return connection.peer === from;
      });

      switch (type) {
        case 'answer':
          console.log('answer', data);
          connection.setRemoteDescription(data);
          break;

        case 'candidate':
          console.log('candidate', data);
          connection.addIceCandidate(data);
          break;
      }
    });
  }

  // 发送 offer
  async sendOffer(connection) {
    const offer = await connection.createOffer({
      // offerToReceiveAudio: true,
      // offerToReceiveVideo: true,
      // iceRestart: true,
    });
    this.signaling.send({ type: 'offer', data: offer }, connection.peer);
    connection.setLocalDescription(offer);
  }
}

// 被分享方
export class Receiver {
  constructor(signaling) {
    this.signaling = signaling;

    // 创建 RTCPeerConnection
    this.connection = new RTCPeerConnection();
  }
  async create() {
    await this.listenEvents();
  }

  // 事件监听
  async listenEvents() {
    const { connection, signaling } = this;

    // 信令服务收到消息
    this.signaling.addEventListener('message', ({ detail: message }) => {
      this.from = message.from;
      const { type, data } = message;
      switch (type) {
        case 'offer':
          console.log('offer', data);
          connection.setRemoteDescription(data);
          this.sendAnswer();
          break;
        case 'candidate':
          console.log('candidate', data);
          connection.addIceCandidate(data);
          break;
      }
    });

    connection.onicecandidate = ({ candidate }) => {
      if (!candidate) {
        return;
      }
      this.signaling.send({ type: 'candidate', data: candidate }, this.from);
    };

    connection.onconnectionstatechange = async () => {
      if (connection.connectionState === 'connected') {
        console.log('对等连接成功！', +new Date());
      }
      if (connection.connectionState === 'disconnected') {
        console.log('连接已断开！', +new Date());
      }
    };

    connection.ontrack = async (event) => {
      console.log('ontrack', event);
      let [remoteStream] = event.streams;
      this.onStream(remoteStream);
    };
  }

  // 发送 answer
  async sendAnswer() {
    const { connection, signaling } = this;

    const answer = await connection.createAnswer();
    this.signaling.send({ type: 'answer', data: answer }, this.from);
    console.log('setLocalDescription', answer);
    connection.setLocalDescription(answer);
  }
}
