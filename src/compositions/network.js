import { listenNetwork } from '@/utils';
import { onUnmounted } from 'vue';

export default (cb) => {
  let removeNetworkListener = listenNetwork(cb);
  onUnmounted(removeNetworkListener);
};
