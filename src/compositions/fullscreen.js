import { onUnmounted, ref } from 'vue';

const isFullscreen = ref(!!document.fullscreenElement);

const listenFullscreen = () => {
  const handleFullscreenChange = (e) => {
    isFullscreen.value = !!document.fullscreenElement;
  };
  document.addEventListener('fullscreenchange', handleFullscreenChange);

  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  };
};

const switchFullscreen = () => {
  if (isFullscreen.value) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
};

export default (cb) => {
  onUnmounted(listenFullscreen());
  return {
    isFullscreen,
    switchFullscreen,
  };
};
