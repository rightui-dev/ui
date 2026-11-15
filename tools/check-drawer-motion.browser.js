// Load in a browser, call rightuiDrawerMotion.arm(panelId, triggerId), then use
// a real pointer on that trigger. Read .result after the gesture has settled.
// Samples describe geometry; they do not certify physical display frame rate.
(() => {
  const check = { result: null };
  check.arm = (panelId, triggerId = panelId) => {
    const trigger = document.getElementById(triggerId);
    if (!trigger) throw new Error(`Missing trigger: ${triggerId}`);
    check.result = null;
    trigger.addEventListener('pointerdown', event => {
      const started = performance.now();
      const samples = [];
      let ended = started + 1800;
      window.addEventListener('pointerup', () => {
        ended = performance.now() + 1200;
      }, { once: true });
      const record = () => {
        const panel = document.getElementById(panelId);
        if (panel) {
          const box = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          const header = panel.firstElementChild;
          const backdrop = document.getElementById(`${panelId}-backdrop`);
          samples.push({
            time: performance.now() - started,
            top: box.top, height: box.height,
            radius: parseFloat(style.borderTopLeftRadius),
            headerInset: header ? parseFloat(getComputedStyle(header).paddingTop) : null,
            backdrop: backdrop ? Number(getComputedStyle(backdrop).opacity) : null,
          });
        }
        if (performance.now() < ended && performance.now() - started < 10000) {
          requestAnimationFrame(record);
          return;
        }
        check.result = {
          panelId, trustedPointer: event.isTrusted, samples,
          distinctHeights: new Set(samples.map(sample => sample.height)).size,
          maxHeight: samples.length ? Math.max(...samples.map(sample => sample.height)) : null,
          final: samples.at(-1) ?? null,
        };
      };
      record();
    }, { capture: true, once: true });
    return { armed: triggerId, panelId };
  };
  window.rightuiDrawerMotion = check;
})();
