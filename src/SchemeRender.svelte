<script>
  import { onMount } from "svelte";
  import SchemeSVG from "./SchemeSVG.svelte";

  export let stationsBetween;
  export let path;
  export let stations;

  import { quintOut } from "svelte/easing";
  import { fade, draw, fly } from "svelte/transition";

  let isMapActive = true;
  let showScheme = false;
  let resultPath = [];
  let stationsPath = [];

  let timerId;

  let showingStation = null;

  function showStation(index) {
    isMapActive = false;
    showingStation = index;
  }

  function onStationHover(index) {
    clearInterval(timerId);
    showStation(index);
  }

  function disableStationHover() {
    isMapActive = true;
    showingStation = null;
  }

  function onShow() {
    clearInterval(timerId);
    showScheme = true;
    showPath();
  }

  function getResultPath({ path = [], stationsBetween }) {
    let resultPath = [];

    for (let i = 1; i < path.length; i++) {
      const firstIndex = path[i - 1];
      const secondIndex = path[i];
      let stations = stationsBetween[firstIndex][secondIndex].slice(1);
      resultPath = resultPath.concat(stations);
    }
    resultPath.unshift(path[0]);

    return resultPath;
  }

  function calculatePath({ path = [], stationsBetween }) {
    let newStationsPath = [];

    if (path && path.length) {
      resultPath = getResultPath({ path, stationsBetween });

      resultPath.map(item => {
        newStationsPath.push(stations.find(station => station.id == item));
      });
    }

    return newStationsPath;
  }

  function showPath() {
    let index = 0;
    timerId = setInterval(() => {
      if (index < resultPath.length) {
        showStation(index);
        index++;
      } else {
        clearInterval(timerId);
        disableStationHover();
      }
    }, 300);
  }

  $: stationsPath = calculatePath({ path, stationsBetween });

  const colors = {
    red: "#d22531",
    blue: "#2060ba",
    green: "#41a747",
    text: "#09303b",
    textDisable: "#9c98a6"
  };
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  .container {
    display: flex;
  }
  aside {
    background: #f0f0f0;
    padding: 10px;
  }
  .station {
    opacity: 0.1;
  }
  .fadein {
    opacity: 1;
    // animation: show 0.5s linear forwards;
  }
  .activeStation {
    background: #ddd;
  }
  .map {
    display: block;
    width: 500px;
    margin: 50px auto;
  }

  .map-active {
    .station {
      opacity: 1;
    }
  }

  .start-button {
    @include button;
    margin-bottom: 20px;
  }

  .station-row {
    font-size: 12px;
    padding-bottom: 5px;
  }
</style>

{#if resultPath && resultPath.length}

  <div class="container">

    <aside>
      <button class="start-button" on:click={onShow}>Play</button>

      {#each stationsPath as station, index}
        {#if station}
          <div
            on:mouseover={() => onStationHover(index)}
            on:mouseout={disableStationHover}
            class="station-row {showingStation === index ? 'activeStation' : ''}">
            {@html station.text}
          </div>
        {/if}
      {/each}
    </aside>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      class="map {isMapActive ? 'map-active' : ''}"
      font-family="Tahoma"
      viewBox="0 0 1501 2151">

      <defs>
        <symbol id="w">
          <path
            fill="#fff"
            d="M6.6 11.5a4.9 4.9 0 110-9.8A4.8 4.8 0 019.7 3a9.7 9.7 0 004.5
            2v3.5a9.7 9.7 0 00-3.9 1.6l-.9.6a4.8 4.8 0 01-2.8 1z" />
          <path
            d="M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1
            1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000
            6.6a6.6 6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0
            014.6-1.4V3.3a8 8 0 01-5-1.8A6.5 6.5 0 006.6 0z" />
        </symbol>
      </defs>

      <path
        fill="none"
        stroke={colors.green}
        stroke-width="3"
        d="M747 1310l-18-18-241 241a72 72 0 00-21 51v85h-15v21h56v-21h-16v-85a47
        47 0 0114-34l46-45 12 12 15-15-12-12z" />

      <g font-size="34">
        <text fill={colors.red} transform="rotate(-90 1562.5 515.7)">
          Холодногірсько-заводська лінія
        </text>
        <text fill={colors.blue} transform="rotate(-90 700.6 -347.6)">
          Салтівська лінія
        </text>
        <text fill={colors.green} transform="rotate(-90 415.7 -32.8)">
          Олексіївська лінія
        </text>
      </g>
      <g fill={colors.text} font-size="53">

        {#if resultPath.length}
          {#each stationsPath as station, index (station.id)}
            {#if station}
              <g class="station {showingStation === index ? 'fadein' : ''}">
                <g fill="none" stroke-miterlimit="10" stroke-width="28">
                  <g stroke={colors[station.color]}>
                    {@html station.path}
                  </g>
                </g>

                <g fill={colors[station.color]}>
                  {@html station.stop}
                </g>

                <text style={station.style}>
                  {@html station.text}
                </text>
              </g>
            {/if}
          {/each}
        {/if}

      </g>
      <g fill={colors.textDisable} font-size="53">
        <text transform="translate(573 1556)">Державiнська</text>
        <text transform="translate(519 1690)">Одеська</text>
      </g>
    </svg>


<!-- TODO -->
    <SchemeSVG/>

  </div>
{/if}
