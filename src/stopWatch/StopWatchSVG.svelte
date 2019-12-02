<script>
  import { formatTime } from "./utils.js";

  export let lapse = 0;

  $: rotation = ((lapse / 1000 / 60) * 360) % 360;
  let seconds;
  let minutes;
  let transitioned;

  $: if (!lapse && minutes && seconds) {
    minutes.style.transition = "transform 0.2s ease-in-out";
    seconds.style.transition = "transform 0.2s ease-in-out";
    transitioned = false;
  }
  $: if (lapse && !transitioned) {
    minutes.style.transition = "none";
    seconds.style.transition = "none";
    transitioned = true;
  }
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  svg {
    font-family: monospace;
    color: hsl(0, 0%, 5%);
    width: 130px;
    height: 130px;

    @include sm {
      width: 170px;
      height: 170px;
    }
  }
</style>

<svg viewBox="0 0 100 100" width="230" height="230">
  <g transform="translate(50 50)">
    <circle
      cx="0"
      cy="0"
      r="42"
      fill="none"
      stroke="currentColor"
      stroke-width="6"
      stroke-dasharray="0.3 1.898"
      transform="scale(-1 1)"/>

    <g bind:this={minutes} transform="rotate({rotation})">
      <g transform="translate(0 -50)">
        <path
          d="M -2.25 0 h 4.5 l -2.25 2.5 l -2.25 -2.5"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="1"
          stroke-linejoin="round"
          stroke-linecap="round" />
      </g>
    </g>

    <g
      transform="translate(0 20)"
      stroke="currentColor"
      stroke-width="0.4"
      fill="none">
      <g bind:this={seconds} transform="rotate({(rotation * 60) % 360})">
        <path
          d="M 0 -1 v -7.5"
          stroke-linejoin="round"
          stroke-linecap="round" />
      </g>
      <circle r="9" />
      <circle r="1" />
    </g>

    <text
      text-anchor="middle"
      fill="currentColor"
      dominant-baseline="middle"
      font-size="14"
      style="font-weight: 300; letter-spacing: 1px;">
      {formatTime(lapse)}
    </text>
  </g>
</svg>
