<script setup>
import { ref, inject, nextTick, watch, computed, reactive } from 'vue';
import { Signaling, MultiRTCPeerConnection } from '@/utils';
import {
  ElButton,
  ElIcon,
  ElDropdown,
  ElDropdownItem,
  ElDivider,
} from 'element-plus';
import { Microphone, Mute } from '@element-plus/icons-vue';
import { connect } from '@/compositions/share';

const DefaultDeviceId = 'default';

const socket = inject('socket');
const user = inject('user');
const users = inject('users');
watch(
  users,
  async (users) => {
    if (!users.length) {
      return;
    }
    if (share.value.connection) {
      return;
    }

    // share.connection = new MultiRTCPeerConnection(
    //   users.filter((u) => u !== user.value),
    //   new Signaling(socket.value),
    // );

    // share.connection.addEventListener('track', ({ detail }) => {
    //   stopShare();
    //   const { streams } = detail;
    //   [share.stream] = streams;
    //   listenStream(share.stream);
    // });
    share.value = connect(
      users.filter((currUser) => currUser !== user.value),
      socket.value,
    );

    share.value?.remoteStream?.getTracks()[0].addEventListener('ended', () => {
      console.log('share ended');
    });

    share.value.connection.addEventListener(
      'offer',
      ({ detail: connection }) => {
        globalThis.$currConnection = connection;

        if (share.value.localStream) {
          connection.getSenders()?.forEach((sender) => {
            connection.removeTrack(sender);
          });

          share.value.localStream.getTracks().forEach((track) => {
            connection.addTrack(track, share.value.localStream);
          });
        }
      },
    );

    share.value.connection.connections[0].addEventListener(
      'datachannel',
      (e) => {
        const channel = e.channel;
        console.log('datachannel');
        channel.onmessage = (ev) => {
          console.log('收到', ev);
        };
      },
    );
  },
  {
    immediate: true,
  },
);

const videoELe = ref(null);

const muted = ref(false);
const handleSwitchMuted = () => {
  muted.value = !muted.value;
};
watch(muted, (muted) => {
  share.value.connection?.connections.forEach(async (connection) => {
    const sender = connection
      .getSenders()
      .find((sender) => sender.track?.kind === 'audio');
    sender.track.enabled = !muted;
  });
});

const audioInputDevices = ref([]);
const audioInputDeviceId = ref(DefaultDeviceId);
const switchAudioInputDeviceId = async () => {
  if (!audioInputDevices.value.length) {
    return;
  }

  const deviceId =
    audioInputDevices.value.find(
      ({ deviceId }) => deviceId === audioInputDeviceId.value,
    )?.deviceId || DefaultDeviceId;

  if (deviceId !== audioInputDeviceId.value) {
    audioInputDeviceId.value = deviceId;
    return;
  }

  const newAudioStream = await navigator.mediaDevices.getUserMedia({
    audio: { deviceId: { exact: deviceId } },
  });
  console.log('newAudioStream', newAudioStream, deviceId);
  const newAudioTrack = newAudioStream.getAudioTracks()[0];

  share.value.connection?.connections.forEach(async (connection) => {
    const sender = connection
      .getSenders()
      .find((sender) => sender.track?.kind === newAudioTrack.kind);

    try {
      await sender?.replaceTrack(newAudioTrack);
    } catch (e) {
      console.error(e);
    }
  });
};
watch(audioInputDeviceId, async () => {
  await switchAudioInputDeviceId();
});

const audioOutputDevices = ref([]);
const audioOutputDeviceId = ref(DefaultDeviceId);
const switchAudioOutputDeviceId = async () => {
  if (!audioOutputDevices.value.length) {
    return;
  }

  const deviceId =
    audioOutputDevices.value.find(
      ({ deviceId }) => deviceId === audioOutputDeviceId.value,
    )?.deviceId || DefaultDeviceId;

  if (deviceId !== audioOutputDeviceId.value) {
    audioOutputDeviceId.value = deviceId;
    return;
  }

  videoELe.value.setSinkId(deviceId);
};
watch(audioOutputDeviceId, async () => {
  switchAudioOutputDeviceId();
});

const handleSwitchAudioDeviceId = (typeAndDeviceId = '') => {
  let [type, deviceId] = typeAndDeviceId.split('.');
  switch (type) {
    case 'input':
      audioInputDeviceId.value = deviceId;
      break;
    case 'output':
      audioOutputDeviceId.value = deviceId;
      break;
    default:
      break;
  }
};

const share = ref({
  connection: null,
  localStream: null,
  remoteStream: null,
});

const refreshDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  console.log('refreshDevices', devices);
  audioInputDevices.value = devices.filter(
    (device) => device.kind === 'audioinput' && device.deviceId,
  );

  audioOutputDevices.value = devices.filter(
    (device) => device.kind === 'audiooutput' && device.deviceId,
  );
  switchAudioInputDeviceId();
  switchAudioOutputDeviceId();
};

navigator.mediaDevices.addEventListener('devicechange', async () => {
  console.log('devicechange');
  await refreshDevices();
});
refreshDevices();

const stopShare = () => {
  share.value.connection?.getSenders().forEach((sender) => {
    share.value.connection.removeTrack(sender);
  });
  share.value.isSharing = false;
};
const listenStream = (stream) => {
  stream.getTracks()[0].addEventListener('ended', () => {
    stopShare();
  });
};

const peers = computed(
  () =>
    share.value.connection?.connections.map(({ peer }) => ({
      peer,
    })) ?? [],
);

const handleShare = async () => {
  // 获取屏幕内容
  const videoStream = await navigator.mediaDevices.getDisplayMedia();
  const audioSteam = await navigator.mediaDevices.getUserMedia({
    audio: { deviceId: { exact: audioInputDeviceId.value } },
  });
  const stream = new MediaStream([
    ...audioSteam.getTracks(),
    ...videoStream.getTracks(),
  ]);
  // share.value.addStream(stream);
  share.value.replaceStream(stream);
  // share.value.addStream(stream1);
  // share.stream.getTracks().forEach((track) => {
  //   share.connection.addTrack(track, share.stream);
  // });
  // listenStream(share.stream);

  // share.isSharing = true;

  // connect(users)
};

const sendData = () => {
  const dataChannel =
    share.value.connection?.connections[0].createDataChannel('test');
  console.log(dataChannel);
  setTimeout(() => {
    // dataChannel.send('你好！');
  }, 1000);
};
</script>

<template>
  <div class="peer-list">
    {{ peers }}
  </div>
  <div class="video-container">
    <video
      ref="videoELe"
      class="video-element"
      autoplay
      playsinline
      disablepictureinpicture
      :muted="share.localStream"
      :srcObject="share.localStream || share.remoteStream"
    ></video>
    <div class="features-bar px-12 py-8">
      <el-button
        size="small"
        class="mr-12"
        type="primary"
        @click="handleShare()"
        >{{ share.isSharing ? '停止共享' : '共享屏幕' }}</el-button
      >
      <el-button @click="sendData">发送数据</el-button>
      <el-dropdown
        v-if="audioInputDevices.length || audioOutputDevices.length"
        size="small"
        split-button
        type="primary"
        @click="handleSwitchMuted"
        @command="handleSwitchAudioDeviceId"
      >
        <el-icon>
          <Mute v-if="muted"></Mute>
          <Microphone v-else></Microphone>
        </el-icon>

        <template #dropdown>
          <el-dropdown-menu>
            <template v-if="audioInputDevices.length">
              <el-divider content-position="left">输入设备</el-divider>
              <el-dropdown-item
                v-for="device in audioInputDevices"
                :key="device.deviceId"
                :command="`input.${device.deviceId}`"
                :class="{
                  active: device.deviceId === audioInputDeviceId,
                }"
                class="dropdown-item-device"
                >{{
                  device.deviceId === 'default' ? '系统默认' : device.label
                }}</el-dropdown-item
              >
            </template>
            <template v-if="audioOutputDevices.length">
              <el-divider content-position="left">输出设备</el-divider>
              <el-dropdown-item
                v-for="device in audioOutputDevices"
                :key="device.deviceId"
                :command="`output.${device.deviceId}`"
                :class="{
                  active: device.deviceId === audioOutputDeviceId,
                }"
                class="dropdown-item-device"
              >
                {{ device.deviceId === 'default' ? '系统默认' : device.label }}
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped lang="less">
.video-container {
  width: 100%;
  height: 100%;
  &:hover {
    .features-bar {
      visibility: visible;
    }
  }
}
.video-element {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
.features-bar {
  // visibility: hidden;
  position: absolute;
  width: 50%;
  left: 0;
  top: 0;
  transform: translateX(50%) translateY(10px);
  background-color: rgba(125, 125, 125, 0.5);
  border-radius: 4px;
}
:deep(.dropdown-item-device) {
  &.active {
    font-weight: bold;
    color: var(--el-dropdown-menuItem-hover-color);
  }
}
</style>
