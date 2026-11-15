// Load on the Sheet documentation page, arm one trigger, then click it normally.
// A DOM .click() has detail=0 and misses the pointer-driven focus regression.
// Read window.rightuiSheetMotion.result after 800ms. No app styles are changed.
(() => {
  const check = { result: null };
  check.arm = (triggerId, dialogId, side) => {
    const trigger = document.getElementById(triggerId);
    if (!trigger) throw new Error(`Missing trigger: ${triggerId}`);
    check.result = null;
    trigger.addEventListener('click', event => {
      const pointerClick = event.detail > 0;
      const start = performance.now();
      const frames = [];
      const horizontal = side === 'left' || side === 'right';
      const sign = side === 'left' || side === 'top' ? 1 : -1;
      const record = () => {
        const layer = document.getElementById(`rightui-modal-${dialogId}-layer`);
        const dialog = document.getElementById(dialogId) ?? document.getElementById(`${dialogId}-panel`);
        const panel = document.getElementById(`${dialogId}-panel`);
        if (!layer?.matches(':popover-open') || !dialog || !panel) {
          if (performance.now() - start < 800) requestAnimationFrame(record);
          else check.result = { triggerId, passed: false, error: 'Sheet did not open' };
          return;
        }
        const rect = panel.getBoundingClientRect();
        frames.push({
          t: performance.now() - start,
          position: horizontal ? rect.x : rect.y,
          extent: horizontal ? rect.width : rect.height,
          scroll: Math.abs(layer.scrollLeft) + Math.abs(layer.scrollTop) + Math.abs(dialog.scrollLeft) + Math.abs(dialog.scrollTop),
        });
        if (performance.now() - start < 800) {
          requestAnimationFrame(record);
          return;
        }
        const maxScroll = Math.max(...frames.map(frame => frame.scroll));
        const backtracks = frames.filter((frame, index) => index > 0 && sign * (frame.position - frames[index - 1].position) < -0.5).length;
        const travel = Math.abs(frames.at(-1).position - frames[0].position);
        check.result = {
          triggerId, side, pointerClick, frames: frames.length, maxScroll, backtracks, travel,
          passed: pointerClick && frames.length > 5 && maxScroll === 0 && backtracks === 0 && travel > frames[0].extent / 2,
        };
      };
      queueMicrotask(record);
    }, { capture: true, once: true });
    return { armed: triggerId };
  };
  window.rightuiSheetMotion = check;
})();
