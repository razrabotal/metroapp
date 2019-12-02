<script>
  export let stationsPath, resultPath, stations, metroImage, schemeSVGData;

  let isMapActive = true;
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
    flex-wrap: wrap;
  }
  aside {
    order: 2;
    width: 100%;
    background: #f0f0f0;
    padding: 10px;
    max-height: initial;
    overflow: auto;
    padding-right: 24px;

    @include sm {
      order: 0;
      max-height: 800px;
    }
  }
  .station {
    opacity: 0;
  }
  .fadein {
    opacity: 1;
  }

  .svg-render {
    position: relative;
    width: 500px;
    margin: 0 auto 30px;

    @include sm {
      margin: 50px auto;
    }

    &__back {
      position: absolute;
      z-index: 1;
      opacity: 0.1;

      &.active {
        opacity: 1;
      }
    }
  }
  .map {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;

    &-active {
      opacity: 0;
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

<div class="container">

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

  <div class="svg-render">
    <img
      class="svg-render__back {isMapActive ? 'active' : ''}"
      alt="metro-image"
      src={metroImage} />

    {#if schemeSVGData}
      <svg
        font-family={schemeSVGData.font}
        viewBox={schemeSVGData.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="map {isMapActive ? 'map-active' : ''}">

        {#if schemeSVGData.defs}
          <defs>
            {@html schemeSVGData.defs}
          </defs>
        {/if}

        <g fill={colors.text}>
          {#each stationsPath as station, index (station.id)}
            {#if station}
              <g class="station {showingStation == station.id ? 'fadein' : ''}">
                <g stroke={colors[station.color]}>
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

      </svg>
    {/if}

  </div>

</div>
