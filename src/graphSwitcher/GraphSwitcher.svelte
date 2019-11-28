<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let selectedMetro;

// TODO: move to js file
  const schemes = {
    kharkiv: {
      graphUrl: 'https://metro.kh.ua/metroapi.php?value=path',
      stationsUrl: 'https://metro.kh.ua/metroapi.php?value=stations'
    },
    custom: {
      graphUrl: null,
      stationsUrl: null
    }
  }

  function onChange() {
    const currentScheme = schemes[selectedMetro];

    dispatch("onSelectMetro", {
      result: selectedMetro,
      graphUrl: currentScheme && currentScheme.graphUrl,
      stationsUrl: currentScheme && currentScheme.stationsUrl
    });
  }
</script>

<style>
  section {
    margin-bottom: 30px;
  }
</style> 

<section>
  <label>
    <input type=radio bind:group={selectedMetro} on:change={onChange} value={'kharkiv'}>
    Kharkiv metro
  </label>

  <label>
    <input type=radio bind:group={selectedMetro} on:change={onChange} value={'custom'}>
    Other metro
  </label>
</section>

