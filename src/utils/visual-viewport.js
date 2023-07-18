export const initViewport = () => {
  const originHeight = globalThis.innerHeight;

  const handler = () => {
    const visualViewportHeight = globalThis.visualViewport.height;
    document.documentElement.style.height = `${globalThis.visualViewport.height}px`;
    document.documentElement.scrollTop = 0;

    // 禁止滑动
    const noMove = (e) => e.preventDefault();

    // 键盘收起
    if (visualViewportHeight > originHeight) {
      document.documentElement.addEventListener('touchmove', noMove, {
        passive: false,
      });
    }

    // 键盘弹出
    if (visualViewportHeight < originHeight) {
      document.documentElement.removeEventListener('touchmove', noMove, {
        passive: false,
      });
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
