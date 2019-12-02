<script>
  import { fly } from "svelte/transition";
  import SchemeRender from "./SchemeRender.svelte";

  export let stationsBetween, path, stations, metroImage, schemeSVGData;

  let resultPath = [];
  let stationsPath = [];

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

    if (stations) {
      resultPath.map(gap => {
        gap.stations.map(item => {
          newStationsPath.push(stations.find(station => station.id == item));
        });
      });
    }

    return newStationsPath;
  }
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  h3 {
    margin-bottom: 10px;
  }

  section {
    display: block;
    margin-bottom: 30px;
    width: 100%;
  }

  .path-list-wrapper {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 20px;
  }

  .path-list {
    word-break: break-word;
    display: flex;

    &__part {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 10px;

      &:not(:last-child) {
        .path-list__item {
          &:not(:last-child):after {
            content: "↓";
          }
          &:last-child:after {
            content: "→";
          }
        }
      }
      &:last-child {
        align-items: center;
      }

      &:after {
        content: "";
        height: 24px;
        width: 24px;
        border-radius: 50%;
        border: 1px solid #ccc;
        padding: 2px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='rgba(0,0,0,0.75)' viewBox='0 0 150 190'%3E%3Cpath d='M95 100l-7-6V82l17 15c-1 4-6 6-10 3zM66 54c-1-11 17-13 17-1 0 13-15 12-17 1zm16 16l1 36 18 40c-2 2-8 4-10-1L65 99l-2-17-7 2-3 18s-8 1-8-5l2-20 17-11c12 0 18 4 18 4zm-20 35l8 14-15 29c-4 0-9-3-6-9l13-34z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center center;
      }
    }

    &__item {
      display: flex;
      white-space: nowrap;
      justify-content: flex-end;
      margin-bottom: 4px;
    }
  }
</style>

{#if stationsPath && resultPath && stations}
  <section class="scheme" in:fly={{ y: 50, duration: 1000 }}>
    <h3>Path render</h3>
    <SchemeRender
      {stations}
      {stationsPath}
      {resultPath}
      {metroImage}
      {schemeSVGData} />
  </section>
{/if}

{#if resultPath}
  <section class="full-path" in:fly={{ y: 50, duration: 1000 }}>
    <h3>Full best path</h3>

    <div class="path-list-wrapper">
      <div class="path-list">
        {#each resultPath as gap, index}
          <div class="path-list__part">
            {#each gap.stations as station, indexInside}
              <span class="path-list__item">{station}</span>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

