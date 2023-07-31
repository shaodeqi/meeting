<script setup>
import { ref, inject, nextTick, watch, computed, reactive } from 'vue';
import { Signaling, MultiRTCPeerConnection } from '@/utils';
import { ElButton } from 'element-plus';

const socket = inject('socket');
const user = inject('user');
const users = inject('users');

const share = reactive({
  isSharing: false,
  connection: null,
  stream: null,
});

const stopShare = () => {
  share.connection?.getSenders().forEach((sender) => {
    share.connection.removeTrack(sender);
  });
  share.isSharing = false;
};
const listenStream = (stream) => {
  stream.getTracks()[0].addEventListener('ended', () => {
    stopShare();
  });
};

watch(
  users,
  async (users) => {
    if (!users.length) {
      return;
    }
    if (share.connection) {
      return;
    }

    share.connection = new MultiRTCPeerConnection(
      users.filter((u) => u !== user.value),
      new Signaling(socket.value),
    );

    share.connection.addEventListener('track', ({ detail }) => {
      stopShare();
      const { streams } = detail;
      [share.stream] = streams;
      listenStream(share.stream);
    });
  },
  {
    immediate: true,
  },
);

const handleShare = async () => {
  if (share.isSharing) {
    stopShare();
    return;
  }

  // 获取屏幕内容
  share.stream = await navigator.mediaDevices.getDisplayMedia();
  share.stream.getTracks().forEach((track) => {
    share.connection.addTrack(track, share.stream);
  });
  listenStream(share.stream);

  share.isSharing = true;
};
</script>

<template>
  <div class="video-container">
    <video
      class="video-element"
      autoplay
      muted
      playsinline
      disablepictureinpicture
      :srcObject="share.stream"
    ></video>
    <div class="features-bar px-12 py-8">
      <el-button size="small" type="primary" @click="handleShare()">{{
        share.isSharing ? '停止共享' : '共享屏幕'
      }}</el-button>
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
</style>
