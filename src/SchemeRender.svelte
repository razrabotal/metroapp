<script>
  import { fly } from 'svelte/transition';

  export let stationsBetween, path, stations;

  let isMapActive = true;
  let resultPath = [];
  let stationsPath = [];
  let timerId;
  let showingStation,
    showingRow = null;

  const ANIMATION_DURATION = 200;

  // Events
  function onStationHover(index, rowIndex) {
    clearListInterval();
    showStation(index);
    showingRow = null;
  }
  function onPlay() {
    clearListInterval();
    initInterval();
  }

  function initInterval() {
    let index = 0;
    timerId = setInterval(() => {
      if (index < stationsPath.length) {
        showStation(stationsPath[index].id);
        showingRow = index;
        index++;
      } else {
        clearListInterval();
        disableStationHover();
      }
    }, ANIMATION_DURATION);
  }
  function clearListInterval() {
    showingRow = null;
    clearInterval(timerId);
  }
  function showStation(index) {
    isMapActive = false;
    showingStation = index;
  }
  function disableStationHover() {
    isMapActive = true;
    showingStation = null;
  }

  $: stationsPath = calculatePath({ path, stationsBetween });

  function getResultPath({ path = [], stationsBetween }) {
    let resultPath = new Array(path.length);
    let resultWeight = [];
    let counter = 0;

    for (let i = 1; i < path.length; i++) {
      const firstIndex = path[i - 1];
      const secondIndex = path[i];
      const currentGap = stationsBetween[firstIndex][secondIndex];
      counter += currentGap.length - 1;

      resultPath[i] = {
        stations: currentGap.slice(1),
        weight: currentGap.weight,
        counter
      };

      
    }

    resultPath[0] = {
      stations: [path[0].toString()],
      weight: 0,
      counter: 0
    };

    return resultPath;
  }

  function calculatePath({ path = [], stationsBetween }) {
    let newStationsPath = [];

    resultPath = getResultPath({ path, stationsBetween });

    resultPath.map(gap => {
      gap.stations.map(item => {
        newStationsPath.push(stations.find(station => station.id == item));
      });
    });

    return newStationsPath;
  }

  // For render
  const getStation = station => stations.find(item => item.id == station) || {};

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
  }
  .map {
    display: block;
    width: 500px;
    margin: 50px auto;

    &-active {
      .station {
        opacity: 1;
      }
    }
  }

  .start-button {
    @include button;
    margin-bottom: 20px;
  }

  .aside-row {
    font-size: 12px;
    display: flex;
    justify-content: space-between;

    &__name {
      padding-bottom: 7px;
      margin-bottom: -2px;

      &.active,
      &:hover {
        background: #ccc;
      }

      :global(tspan) {
        pointer-events: none;
      }
    }

    &__stations {
      flex: 1;
    }

    &__weight {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 7px;
      margin-bottom: -2px;
      margin-left: 16px;

      &:before {
        content: "";
        position: absolute;
        display: block;
        top: 0;
        right: 4px;
        bottom: 22px;
        width: 2px;
        background: #000;
      }
    }
  }
</style>

<div class="container" in:fly="{{ y: 50, duration: 1000 }}" >

  <aside>
    <button class="start-button" on:click={onPlay}>Play</button>

    {#each resultPath as gap, index}
      <div class="aside-row">
        <div class="aside-row__stations">
          {#each gap.stations as station, indexInside}
            <div
              class="aside-row__name {gap.counter - gap.stations.length + indexInside + 1 === showingRow ? 'active' : ''}"
              on:mouseenter={() => onStationHover(getStation(station).id)}
              on:mouseout={disableStationHover}>
              {@html getStation(station).text}
            </div>
          {/each}
        </div>
        <div class="aside-row__weight">{gap.weight}</div>
      </div>
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
          1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000 6.6a6.6
          6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0 014.6-1.4V3.3a8 8 0
          01-5-1.8A6.5 6.5 0 006.6 0z" />
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
      {#each stationsPath as station, index (station.id)}
        {#if station}
          <g class="station {showingStation == station.id ? 'fadein' : ''}">
            <g
              fill="none"
              stroke-miterlimit="10"
              stroke-width="28"
              stroke={colors[station.color]}>
              {@html station.path}
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
    </g>
    <g fill={colors.textDisable} font-size="53">
      <text transform="translate(573 1556)">Державiнська</text>
      <text transform="translate(519 1690)">Одеська</text>
    </g>
  </svg>

</div>
