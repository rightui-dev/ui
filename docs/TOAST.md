# Toast

Keep `ToastViewport` mounted and pass `ToastMessage` records in newest-first order. It renders above clipped containers without blocking the rest of the page. The original `Toast` component remains available for a single notification.

Load `assets/sheet.css` in the web head as described in [Sheet](SHEET.md). Native hosts render the same authored surface directly.

## Root clock

Exact schedules tasks at the application root. Add this clock once, then pass `clock=toastTime` and `requestClock=runToastClock` to the viewport. It runs only while requested; hover and focus extend the deadline after pausing dismissal.

```contract
  state toastTime = 0
  state toastUntil = 0
  action runToastClock(duration: number)
    toastUntil = max(toastUntil, toastTime + duration)
  action tickToasts
    toastTime = min(toastUntil, toastTime + 32)
  task toastClock when toastTime < toastUntil
    every(32, tickToasts)
```

Create messages with `id`, `title`, `description`, `variant`, `actionLabel`, `createdAt` and `duration`. Use the clock's current value for `createdAt`; `duration` is milliseconds, with zero disabling automatic dismissal. Recognized variants are `default`, `success`, `info`, `warning`, `error` and `loading`. Loading uses the public Spinner and does not dismiss automatically.

```contract
  state notices: ToastMessage[] = []
  state serial = 0
  state lastAction = ""
  action notify
    let next = serial + 1
    notices = [ToastMessage(id="notice-" + next.toString(), title="Saved", description="Your changes are ready.", variant="success", actionLabel="", createdAt=toastTime, duration=5000)].concat(notices)
    serial = next
  action removeNotice(id: string)
    notices = notices.filter(item => item.id != id)
  action handleNoticeAction(id: string)
    lastAction = id
  view
    ToastViewport(id="notifications", items=notices, position="bottom-right", clock=toastTime, reduced=reduced, maxVisible=3, expandOnHover=true, requestClock=runToastClock, dismiss=removeNotice, act=handleNoticeAction)
```

Import `ToastViewport` and `ToastMessage` from `@rightui/ui`; retain the root font provider and supply your reduced-motion preference. Put the viewport beside the rest of your view. `dismiss(id)` fires after the exit animation; remove the corresponding record there. `act(id)` fires immediately when its action is pressed: perform the action and leave removal to `dismiss(id)` when preserving the exit animation.

Choose `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` or `bottom-right`. Notifications slide from that edge. `maxVisible` controls the collapsed stack; hover or keyboard focus reveals older messages when `expandOnHover` is enabled. Motion uses `ui.duration-toast` and `ui.easing-toast`; width and stacking use `ui.toast-width` and `ui.toast-peek`.

For an asynchronous operation, update the same record ID from `loading` to `success` or `error`, reset `createdAt`, choose a positive duration and call `runToastClock(duration + 1000)`. Resolve that state from your actual data operation; the website's two-second example is a local demonstration.
