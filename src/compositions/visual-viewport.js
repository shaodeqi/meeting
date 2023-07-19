import { onUnmounted } from 'vue';

export const visualViewport = () => {
  const handler = () => {
    document.documentElement.style.height = `${globalThis.visualViewport.height}px`;
    if (document.documentElement.scrollTop > 0) {
      document.documentElement.scrollTop = 0;
    }
  };

  if (globalThis.visualViewport) {
    globalThis.visualViewport.addEventListener('resize', handler);
    globalThis.visualViewport.addEventListener('scroll', handler);
  }

  return () => {
    globalThis.visualViewport.removeEventListener('resize', handler);
    globalThis.visualViewport.removeEventListener('scroll', handler);
  };
};

export default () => {
  onUnmounted(visualViewport());
};
