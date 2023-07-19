<script setup>
import { ref, provide, onUnmounted, computed } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import md5 from 'blueimp-md5';

import { ElMessageBox, ElNotification } from 'element-plus';

import {
  WS_ORIGIN,
  HASH,
  NETWORK_STATUS,
  randomString,
  initViewport,
} from '@/utils';
import network from '@/compositions/network';
import ChatBlock from '@/components/chat-block.vue';

const cancelInitViewPort = initViewport();

const searchParams = new URLSearchParams(location.search);
const room = searchParams.get('room');
const mode = searchParams.get('mode');
const chatSize = ref(20);
let socket = ref();
let user = ref(randomString(8));
let online = ref(navigator.onLine);
let connectState = ref(WebSocket.CLOSED);
let currentHash = HASH;
let currentWsOrigin = WS_ORIGIN;

const networkState = computed(() =>
  online.value ? connectState.value : WebSocket.CLOSED
);

if (location.host === '127.0.0.1:5173') {
  currentHash = '10f3b500f2a4df8a0278c85954be9fcc';
  // currentWsOrigin = 'ws://127.0.0.1:9000';
}

switch (mode) {
  case 'chat':
    chatSize.value = 100;
    break;
  case 'video':
    chatSize.value = 0;
    break;
  default:
    chatSize.value = 20;
    break;
}

if (!room) {
  ElNotification({
    title: '错误',
    message: '未输入房间名，请刷新重试！',
    type: 'error',
    duration: 0,
  });
}

provide('socket', socket);
provide('room', room);
provide('user', user);

const handleResize = (delay = 0) => {
  setTimeout(() => {
    let panes = document.querySelectorAll('.pane-container');
    panes.forEach((pane) => {
      if (pane.offsetWidth <= 120) {
        pane.classList.add('narrow');
      } else {
        pane.classList.remove('narrow');
      }
    });
  }, delay);
};
handleResize(1000);

const resetConnectState = () => {
  console.log(`readyState: ${socket.value?.readyState}`);
  connectState.value = socket.value?.readyState ?? WebSocket.CLOSED;
};

const connect = () => {
  const key = md5(`${currentHash}@${room}@${user.value}`);
  const wholeWsUrl = `${currentWsOrigin}?room=${room}&user=${user.value}&key=${key}`;
  socket.value?.close();
  socket.value = new WebSocket(wholeWsUrl);

  resetConnectState();

  window.socket = socket.value;
  socket.value.addEventListener('close', ({ code, reason }) => {
    console.log(
      `socket断开连接: ${code} - ${reason} - ${new Date().toLocaleTimeString()}`
    );
    // switch (+code) {
    //   case 1006:
    //     // connect();
    //     break;
    //   default:
    //     break;
    // }
    resetConnectState();
  });
  socket.value.addEventListener('open', () => {
    resetConnectState();
  });
};

network(({ type }) => {
  online.value = navigator.onLine;

  if (type === 'online') {
    connect();
  }
});

ElMessageBox.prompt('请输入昵称', {
  showCancelButton: false,
  confirmButtonText: '确定',
  inputValue: localStorage.getItem('meet.user'),
  customStyle: { transform: 'translate(0, -100%)' },
  inputPattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]{1,30}$/,
  inputErrorMessage: '昵称校验不通过',
})
  .then(({ value }) => {
    if (value) {
      user.value = value;
    }
  })
  .catch(() => {})
  .finally(() => {
    localStorage.setItem('meet.user', user.value);
    connect();
  });

onUnmounted(cancelInitViewPort);

// 展示聊天框
// const showChat = ref(true);
// const handleFolded = () => {
//   showChat.value = !showChat.value;
// };
</script>

<template>
  <Splitpanes
    first-splitter
    class="split-panes"
    :dbl-click-splitter="true"
    @resize="handleResize"
    @resized="handleResize(300)"
  >
    <Pane class="pane-container" :size="100 - chatSize">
      <div class="pane-header">
        <svg
          class="pane-icon py-4 px-8"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M1.5 2C1.10218 2 0.720644 2.15804 0.43934 2.43934C0.158035 2.72064 0 3.10218 0 3.5L0 12.5C0 12.8978 0.158035 13.2794 0.43934 13.5607C0.720644 13.842 1.10218 14 1.5 14H14.5C14.8978 14 15.2794 13.842 15.5607 13.5607C15.842 13.2794 16 12.8978 16 12.5V3.5C16 3.10218 15.842 2.72064 15.5607 2.43934C15.2794 2.15804 14.8978 2 14.5 2H1.5ZM8.5 8H13.5C13.6326 8 13.7598 8.05268 13.8536 8.14645C13.9473 8.24021 14 8.36739 14 8.5V11.5C14 11.6326 13.9473 11.7598 13.8536 11.8536C13.7598 11.9473 13.6326 12 13.5 12H8.5C8.36739 12 8.24021 11.9473 8.14645 11.8536C8.05268 11.7598 8 11.6326 8 11.5V8.5C8 8.36739 8.05268 8.24021 8.14645 8.14645C8.24021 8.05268 8.36739 8 8.5 8Z"
          />
        </svg>
      </div>
      <div class="pane-content">
        【屏幕共享】<span class="text-grey">能力建设中...</span>
      </div>
    </Pane>
    <Pane class="pane-container" :size="chatSize">
      <div class="pane-header">
        <svg
          class="pane-icon py-4 px-8"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M9.77516e-06 4C9.77516e-06 3.46957 0.210723 2.96086 0.585796 2.58579C0.960869 2.21071 1.46958 2 2.00001 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V12C16 12.5304 15.7893 13.0391 15.4142 13.4142C15.0391 13.7893 14.5304 14 14 14C10.3333 14 2.00001 14 2.00001 14L0 15L9.77516e-06 4ZM5.00001 8C5.00001 7.73478 4.89465 7.48043 4.70712 7.29289C4.51958 7.10536 4.26523 7 4.00001 7C3.73479 7 3.48044 7.10536 3.2929 7.29289C3.10537 7.48043 3.00001 7.73478 3.00001 8C3.00001 8.26522 3.10537 8.51957 3.2929 8.70711C3.48044 8.89464 3.73479 9 4.00001 9C4.26523 9 4.51958 8.89464 4.70712 8.70711C4.89465 8.51957 5.00001 8.26522 5.00001 8ZM9.00001 8C9.00001 7.73478 8.89465 7.48043 8.70712 7.29289C8.51958 7.10536 8.26523 7 8.00001 7C7.73479 7 7.48044 7.10536 7.2929 7.29289C7.10537 7.48043 7.00001 7.73478 7.00001 8C7.00001 8.26522 7.10537 8.51957 7.2929 8.70711C7.48044 8.89464 7.73479 9 8.00001 9C8.26523 9 8.51958 8.89464 8.70712 8.70711C8.89465 8.51957 9.00001 8.26522 9.00001 8ZM12 9C12.2652 9 12.5196 8.89464 12.7071 8.70711C12.8947 8.51957 13 8.26522 13 8C13 7.73478 12.8947 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8C11 8.26522 11.1054 8.51957 11.2929 8.70711C11.4804 8.89464 11.7348 9 12 9Z"
          />
        </svg>
      </div>
      <ChatBlock />
    </Pane>
  </Splitpanes>
  <div
    class="network-status"
    :class="NETWORK_STATUS[networkState]"
    :title="NETWORK_STATUS[networkState]"
  >
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z"
      />
      <path
        d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091l.016-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z"
      />
    </svg>
  </div>
</template>
<style scoped lang="less">
.split-panes {
  width: 100%;
  height: 100%;
  .splitpanes__pane {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pane-container {
    overflow: visible;
    position: relative;
    .pane-header {
      transition: all 0.2s ease-in;
      // background-color: @bg-color-grey;
      min-width: 60px;
      display: flex;
      width: 100%;
      align-items: center;
      position: absolute;
      top: 3px;
      left: 0;
    }
    .pane-icon {
      transition: inherit;
      color: @text-color-grey;
      justify-self: center;
      width: 16px;
      height: 16px;
    }
    .pane-control {
      flex: 1;
      transition: inherit;
      text-align: right;
      margin-left: 0;
    }
    .pane-content {
      overflow: hidden;
    }
    &.narrow {
      .pane-icon {
        transform: rotate(90deg);
        transform-origin: 0 0;
        width: 12px;
        height: 12px;
      }
      .pane-control {
        margin-left: -32px;
      }
    }
  }
}
.network-status {
  margin: 4px 3px;
  position: absolute;
  left: 0;
  bottom: 0;
  &.online {
    color: #67c23a;
  }
  &.offline {
    color: #f56c6c;
    &::after {
      content: '╲';
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
  &.connecting {
    color: #409eff;
    animation: opacity-change 1s alternate infinite;
  }
}

@keyframes opacity-change {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>
