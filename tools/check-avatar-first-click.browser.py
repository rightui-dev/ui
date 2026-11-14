# Run through Browser Harness against the built SSR site, without ?agent=.
# RIGHTUI_PREVIEW_URL selects the origin (default: http://localhost:8793).
import json
import os

origin = os.environ.get("RIGHTUI_PREVIEW_URL", "http://localhost:8793").rstrip("/")
results = []
for width in [1440, 390]:
    new_tab("about:blank")
    target = current_tab()["targetId"]
    try:
        cdp("Emulation.setDeviceMetricsOverride", width=width, height=900, deviceScaleFactor=1, mobile=width < 600)
        # Hold idle activation so the real pointer must wake/replay the SSR app.
        # This exercises a click arriving before idle, even on a fast local server.
        cdp("Page.addScriptToEvaluateOnNewDocument", source="""
          const idle=window.requestIdleCallback, queued=[];
          window.requestIdleCallback=callback=>(queued.push(callback),queued.length);
          window.__rightuiResumeIdle=()=>{window.requestIdleCallback=idle;
            for(const callback of queued)idle.call(window,callback);};
        """)
        cdp("Page.navigate", url=origin + "/docs/components/avatar?theme=light")
        wait_for_load()
        before = js("""(async()=>{
          await document.fonts.ready;
          const trigger=document.getElementById('avatar-menu');
          const image=document.getElementById('avatar-menu-avatar-image');
          await image.decode();
          trigger.scrollIntoView({block:'center'});
          await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
          const box=trigger.getBoundingClientRect(),x=box.x+box.width/2,y=box.y+box.height/2;
          const hit=document.elementFromPoint(x,y);
          return {runtimeStarted:!!window.exact?.ready,pointerEvents:getComputedStyle(image).pointerEvents,
            pressTarget:hit.closest('[data-exact-on]')?.id,x,y};
        })()""")
        assert not before["runtimeStarted"], "The test must exercise the first interaction, before activation."
        assert before["pointerEvents"] == "none" and before["pressTarget"] == "avatar-menu"
        for event in ["mousePressed", "mouseReleased"]:
            cdp("Input.dispatchMouseEvent", type=event, x=before["x"], y=before["y"], button="left", clickCount=1)
        after = js("""(async()=>{
          for(let i=0;i<80;i++){
            if(document.activeElement.id==='avatar-menu-item-profile')
              return {runtimeStarted:!!window.exact?.ready,expanded:document.getElementById('avatar-menu').getAttribute('aria-expanded'),focus:document.activeElement.id};
            await new Promise(r=>setTimeout(r,50));
          }
          return {runtimeStarted:!!window.exact?.ready,expanded:document.getElementById('avatar-menu').getAttribute('aria-expanded'),focus:document.activeElement.id};
        })()""")
        assert after["runtimeStarted"] and after["expanded"] == "true" and after["focus"] == "avatar-menu-item-profile"
        results.append({"width": width, "before": before, "after": after})
    finally:
        js("window.__rightuiResumeIdle?.()")
        cdp("Target.closeTarget", targetId=target)
print(json.dumps({"firstPointerClick": "passed", "cases": results}))
