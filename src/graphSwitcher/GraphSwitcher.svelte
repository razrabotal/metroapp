<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let selectedMetro;

  function onChange() {
    dispatch("onSelectMetro", {
      result: selectedMetro
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
    <input type=radio bind:group={selectedMetro} on:change={onChange} value={1}>
    Kharkiv metro
  </label>

  <label>
    <input type=radio bind:group={selectedMetro} on:change={onChange} value={2}>
    Other metro
  </label>
</section>