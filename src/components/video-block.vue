<script setup>
import { ref, inject, nextTick, watch, computed, reactive } from 'vue';
import { type, Sharer, Receiver, Signaling, handleMessageData } from '@/utils';
import { ElButton } from 'element-plus';

const socket = inject('socket');
const post = inject('post');
const user = inject('user');
const users = inject('users');

const share = reactive({
  isSharing: false,
  sharer: null,
  stream: null,
});

const signaling = computed(() =>
  socket.value ? new Signaling(socket.value, user.value) : null,
);

watch(
  socket,
  (socket) => {
    if (!socket) {
      return;
    }

    socket.addEventListener('message', async ({ data }) => {
      const payload = await handleMessageData(data);
      const { cmd, user } = payload;
      switch (cmd) {
        case 'send':
          switch (payload.data?.type) {
            // 消息提醒
            case 'share.start':
              const receiver = new Receiver(signaling.value);
              receiver.onStream = (remoteStream) => {
                share.stream = remoteStream;
              };
              await receiver.create();
              break;
            case 'share.check':
              if (share.isSharing) {
                nextTick(() => {
                  share.sharer.join(user);
                  post(
                    {
                      type: 'share.start',
                    },
                    [user],
                  );
                });
              }
              break;
          }
      }
    });

    // 请求历史消息
    socket.addEventListener('open', () => {
      nextTick(() => {
        post({
          type: 'share.check',
        });
      });
    });
  },
  {
    immediate: true,
  },
);

const stopShare = () => {
  share.sharer?.stop();
  share.isSharing = false;
};

const handleShare = async () => {
  // if (share.isSharing) {
  //   stopShare();
  //   return;
  // }
  // 获取屏幕内容
  share.stream = await navigator.mediaDevices.getDisplayMedia();
  share.sharer = await new Sharer(
    share.stream,
    users.value.filter((currentUser) => currentUser !== user.value),
    signaling.value,
  ).create();
  // share.isSharing = true;
  post({
    type: 'share.start',
  });
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
