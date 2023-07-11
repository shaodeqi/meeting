<script setup>
import { ref } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';

import ChatBlock from './components/chat-block.vue';
import './assets/chat.svg';

const handleResize = (delay = 0) => {
  setTimeout(() => {
    let panes = document.querySelectorAll('.pane-container');
    panes.forEach((pane) => {
      if (pane.offsetWidth <= 100) {
        pane.classList.add('narrow');
      } else {
        pane.classList.remove('narrow');
      }
    });
  }, delay);
};

// 展示聊天框
const showChat = ref(true);
const handleFolded = () => {
  showChat.value = !showChat.value;
};
</script>

<template>
  <Splitpanes
    first-splitter
    class="split-panes"
    :dbl-click-splitter="true"
    @resize="handleResize"
    @resized="handleResize(300)"
  >
    <Pane class="pane-container">
      <div class="pane-header">
        <svg
          class="pane-icon py-4 px-8"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          @dblclick="alert(1)"
        >
          <path
            d="M1.5 2C1.10218 2 0.720644 2.15804 0.43934 2.43934C0.158035 2.72064 0 3.10218 0 3.5L0 12.5C0 12.8978 0.158035 13.2794 0.43934 13.5607C0.720644 13.842 1.10218 14 1.5 14H14.5C14.8978 14 15.2794 13.842 15.5607 13.5607C15.842 13.2794 16 12.8978 16 12.5V3.5C16 3.10218 15.842 2.72064 15.5607 2.43934C15.2794 2.15804 14.8978 2 14.5 2H1.5ZM8.5 8H13.5C13.6326 8 13.7598 8.05268 13.8536 8.14645C13.9473 8.24021 14 8.36739 14 8.5V11.5C14 11.6326 13.9473 11.7598 13.8536 11.8536C13.7598 11.9473 13.6326 12 13.5 12H8.5C8.36739 12 8.24021 11.9473 8.14645 11.8536C8.05268 11.7598 8 11.6326 8 11.5V8.5C8 8.36739 8.05268 8.24021 8.14645 8.14645C8.24021 8.05268 8.36739 8 8.5 8Z"
          />
        </svg>
        <div class="pane-control px-8 f-12">
          <svg
            width="16"
            height="16"
            fill="currentColor"
            class="clickable"
            viewBox="0 0 16 16"
            :class="{ rotate180: !showChat }"
            @click="handleFolded"
          >
            <path
              fill-rule="evenodd"
              d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8Zm-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5Z"
            />
          </svg>
        </div>
      </div>
      <div class="pane-content">1</div>
    </Pane>
    <Pane
      v-if="showChat"
      class="pane-container"
      size="20"
      style="min-width: 400px"
    >
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
</template>
<style scoped lang="less">
.split-panes {
  width: 100%;
  height: 100vh;
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
      background-color: @bg-color-grey;
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
</style>
