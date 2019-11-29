<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from "svelte";
  import schemes from './schemes';
  const dispatch = createEventDispatcher();

  let selectedMetro, timeOnStation;

  function onChange() {
    const currentScheme = schemes.find(item => item.id === selectedMetro);

    dispatch("onSelectMetro", {
      result: selectedMetro,
      timeOnStation: timeOnStation,
      graphUrl: currentScheme && currentScheme.graphUrl,
      stationsUrl: currentScheme && currentScheme.stationsUrl
    });
  }

  onMount(() => {
    selectedMetro = schemes && schemes.length && schemes[0].id;
    timeOnStation = 5;
    onChange();
	});
</script>

<style lang="scss">
  section {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }

  .input-number {
    padding: 8px 10px;
    border: 1px solid #bbb;
    font-size: 16px;
    border-radius: 4px;
    width: 100%;
    margin-right: 8px;

    width: 140px;
  }

  .text-field {
    display: inline-flex;
    flex-direction: column;
    font-size: 12px;
    margin-right: 20px;

    span {
      margin-bottom: 5px;
    }
  }

  .radio-input {
    margin-right: 20px;
  }
</style> 

<section>
  <label class="text-field">
    <span>Station stay time, min</span>
    <input class="input-number" bind:value={timeOnStation} type="number" on:change={onChange} min="0" max="10"/>
  </label>

  {#each schemes as { id, name }}
    <label class="radio-input"><input type='radio' bind:group={selectedMetro} on:change={onChange} value={id}>{name}</label>
  {/each} 
</section>
