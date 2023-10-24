import { ref } from 'vue';
import { MultiRTCPeerConnection, Signaling } from '@/utils';

export const connect = (peers, socket) => {
  const signaling = new Signaling(socket);
  const connection = new MultiRTCPeerConnection(peers, signaling);

  const localStream = ref(null);
  const remoteStream = ref(null);

  const addStream = (originStream) => {
    remoteStream.value = null;
    localStream.value = originStream;

    originStream.getTracks().forEach((track) => {
      console.log(connection);
      connection.addTrack(track, originStream);
    });
  };

  const replaceStream = (originStream) => {
    remoteStream.value = null;
    localStream.value = originStream;

    originStream.getTracks().forEach((track) => {
      if (track.kind === 'audio') {
        const existAudioSender = connection
          .getSenders()
          .find((sender) => sender.track.kind === 'audio');

        if (existAudioSender) {
          existAudioSender.replaceTrack(track);
        } else {
          connection.addTrack(track, originStream);
        }
      }
      if (track.kind === 'video') {
        const existVideoSender = connection
          .getSenders()
          .find((sender) => sender.track.kind === 'video');

        if (existVideoSender) {
          existVideoSender.replaceTrack(track);
        } else {
          connection.addTrack(track, originStream);
        }
      }
    });
  };

  connection.addEventListener('track', ({ detail }) => {
    console.log('ontrack', detail);
    localStream.value = null;
    console.log(detail.streams);
    console.log(detail.streams);
    [remoteStream.value] = detail.streams;
    // const audio = new Audio();
    // audio.srcObject = remoteStream.value;
    // audio.play();
    // console.log(audio);
  });

  return {
    connection,
    addStream,
    replaceStream,
    localStream,
    remoteStream,
  };
};
