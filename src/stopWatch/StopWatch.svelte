<script>
  import { onDestroy } from "svelte";
  import StopWatchSVG from "./StopWatchSVG.svelte";
  import { time } from "./stores.js";

  export let running = false;

  let lapse = 0;
  let unsubscribe;

  $: if (running) {
    stop();
    start();
  } else {
    pause();
  }

  function start() {
    unsubscribe = time.subscribe(value => {
      lapse = value;
    });
  }

  function pause() {
    terminate();
  }

  function terminate() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  function stop() {
    lapse = 0;
    terminate();
  }

  $: subscription = !!unsubscribe;

  onDestroy(() => {
    terminate();
  });
</script>

<div class="stopwatch">
  <StopWatchSVG {lapse} />
</div>
