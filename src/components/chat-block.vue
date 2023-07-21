<script setup>
import { ref, inject, nextTick, watch } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import { type, notify, CLOSE_COOLING_MS } from '@/utils';

let socket = inject('socket');
let user = inject('user');
let room = inject('room');

const users = ref([]);
const dialogs = ref([]);
const messageContainer = ref(null);
let readyReceiveDialogs = false;
let justClosedUser = '';

watch(
  socket,
  (socket) => {
    if (!socket) {
      return;
    }

    socket.addEventListener('message', async ({ data }) => {
      let payloadStr = data;
      if (type(data) === 'Blob') {
        payloadStr = await data.text();
      }
      let payload = {};
      try {
        payload = JSON.parse(payloadStr);
      } catch (e) {
        console.error(e);
      }
      switch (payload.cmd) {
        case 'send':
          switch (payload.data?.type) {
            // 消息提醒
            case 'message.text':
              if (payload.user !== user.value) {
                notify(payload.data.content, room);
              }
              dialogs.value.push({
                ...payload.data,
                timestamp: payload.timestamp,
                user: payload.user,
              });
              break;

            // 需要消息历史
            case 'history.pull':
              post('send', {
                type: 'history.push',
                content: dialogs.value,
              });
              break;

            // 更新消息历史(仅获取一次)
            case 'history.push':
              if (readyReceiveDialogs) {
                dialogs.value = payload.data.content;
              }
              readyReceiveDialogs = false;
              break;

            case 'command.reload':
              location.reload();
              break;
          }

          break;

        case 'connect':
          if (justClosedUser && justClosedUser === payload.user) {
            dialogs.value.pop();
          } else {
            dialogs.value.push({
              type: payload.cmd,
              user: payload.user,
            });
          }
          post('users');
          break;

        case 'close':
          justClosedUser = payload.user;
          setTimeout(() => {
            justClosedUser = '';
          }, CLOSE_COOLING_MS);

          dialogs.value.push({
            type: payload.cmd,
            user: payload.user,
          });
          post('users');
          break;

        case 'users':
          users.value = payload.data;
          break;
      }
      nextTick(() => {
        if (messageContainer.value) {
          messageContainer.value.scrollTop =
            messageContainer.value.scrollHeight; // 滚动高度
        }
      });
    });

    // 请求历史消息
    socket.addEventListener('open', () => {
      readyReceiveDialogs = true;
      nextTick(() => {
        post('send', {
          type: 'history.pull',
        });
      });
    });
  },
  {
    immediate: true,
  },
);

const post = (cmd, data, users) => {
  if (!socket.value) {
    return;
  }
  socket.value.send(
    JSON.stringify({
      users,
      cmd,
      data,
    }),
  );
};

const message = ref('');
const handleEnter = (e) => {
  if (!message.value) {
    return;
  }
  const { shiftKey, ctrlKey, altKey } = e;
  if (!shiftKey && !ctrlKey && !altKey) {
    post(
      'send',
      {
        type: 'message.text',
        content: message.value,
      },
      [],
    );
    message.value = '';
    e.preventDefault();
  }
};
</script>

<template>
  <Splitpanes horizontal class="split-panes" :dbl-click-splitter="false">
    <Pane class="chat-dialogs-pane">
      <div class="chat-dialogs-container">
        <div class="user-list">
          {{ users.length }}人在线：{{ users.join(',') }}
        </div>
        <div ref="messageContainer" class="chat-messages-container">
          <div v-for="(dialog, mIndex) in dialogs" :key="`dialog-${mIndex}`">
            <div
              v-if="dialog.type === 'message.text'"
              class="dialog-item"
              :class="{ self: dialog.user === user }"
            >
              <div class="dialog-user cursor-pointer">
                <div></div>
                <div :title="new Date(dialog.timestamp).toLocaleString()">
                  {{ dialog.user }}:
                </div>
              </div>
              <div class="dialog-message">
                <div></div>
                <div>{{ dialog.content }}</div>
              </div>
            </div>
            <div
              v-if="dialog.type === 'connect'"
              class="text-grey text-center f-12"
            >
              {{ dialog.user }} 进入房间
            </div>
            <div
              v-if="dialog.type === 'close'"
              class="text-grey text-center f-12"
            >
              {{ dialog.user }} 离开房间
            </div>
          </div>
        </div>
      </div>
    </Pane>
    <Pane
      style="min-height: 100px; max-height: 400px"
      class="chat-input-pane"
      max-size="30"
      min-size="10"
      size="15"
    >
      <!-- <div class="chat-features">
        <svg
          class="mr-8"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
          />
          <path
            d="M12.331 9.5a1 1 0 0 1 0 1A4.998 4.998 0 0 1 8 13a4.998 4.998 0 0 1-4.33-2.5A1 1 0 0 1 4.535 9h6.93a1 1 0 0 1 .866.5zM7 6.5c0 .828-.448 0-1 0s-1 .828-1 0S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 0-1 0s-1 .828-1 0S9.448 5 10 5s1 .672 1 1.5z"
          />
        </svg>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          <path
            d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"
          />
        </svg>
      </div> -->
      <textarea
        v-model="message"
        enterkeyhint="send"
        placeholder="请输入..."
        class="chat-input flex-1"
        @keydown.enter="handleEnter"
      ></textarea>
    </Pane>
  </Splitpanes>
</template>

<style scoped lang="less">
.chat-dialogs-pane,
.chat-input-pane {
  display: flex;
  flex-direction: column;
}

.chat-dialogs-container,
.chat-input {
  min-width: 120px;
}

.chat-dialogs-container {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  line-height: 1.5;
  overflow: hidden;

  .user-list {
    padding: 8px 16px;
    color: @text-color-grey;
    text-align: center;
    border-bottom: 1px solid @border-color;
  }

  .chat-messages-container {
    flex: 1;
    padding: 16px;
    overflow: auto;
    .dialog-item {
      .dialog-user {
        display: flex;
        color: @text-color-grey;
      }
      .dialog-message {
        display: flex;
        white-space: break-spaces;
      }
      &.self {
        .dialog-user {
          flex-direction: row-reverse;
        }
        .dialog-message {
          flex-direction: row-reverse;
        }
      }
    }
  }
}

.chat-features {
  padding: 8px 16px;
  display: flex;
  justify-items: flex-end;
}
.chat-input {
  padding: 16px;
  border: none;
  background-color: transparent;
  outline: none;
  resize: none;
  color: @text-color;
  font-size: inherit;
}
</style>
