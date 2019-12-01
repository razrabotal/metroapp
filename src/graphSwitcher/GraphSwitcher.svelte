<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from "svelte";
  import schemes from './_schemes';
  const dispatch = createEventDispatcher();

  let selectedMetro, timeOnStation;

  function onChange() {
    const currentScheme = schemes.find(item => item.id === selectedMetro);

    dispatch("onSelectMetro", {
      result: selectedMetro,
      timeOnStation: timeOnStation,
      graphUrl: currentScheme && currentScheme.graphUrl,
      stationsUrl: currentScheme && currentScheme.stationsUrl,
      schemeUrl: currentScheme && currentScheme.schemeUrl,
      metroImage: currentScheme.image
    });
  } 

  onMount(() => {
    selectedMetro = schemes && schemes.length && schemes[0].id;
    timeOnStation = 5;
    onChange();
	}); 
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  .graph-wsitcher {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
  }
 
  .input-number {
    padding: 8px 10px;
    border: 1px solid $background-color--light;
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
    margin-left: 20px;

    span {
      margin-bottom: 5px;
    }
  }

  .radio-input { 
    margin-right: 20px; 
    
    section {
      display: block;
      border: 1px solid $background-color--light;
      background: #fff;
      border-radius: 10px;
      padding: 10px;
      transition: 0.2s;

      &:hover {
        cursor: pointer;
        background: $background-color--light;
        // border-color: darken($background-color--dark, 20%);
      }

      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 8px;
      }

      h3 {
        font-size: 14px;
        text-align: center;
        font-weight: 400;
      }
    }

    &__input {
      display: none;

      &:checked + section {
        background: $background-color--base;

        &:hover {
          cursor: default;
          border-color: $background-color--base;
        }
      }
    } 
  }
</style> 

<section class="graph-wsitcher">
  
  {#each schemes as { id, name, image }}
    <label class="radio-input">
      <input class="radio-input__input" type='radio' bind:group={selectedMetro} on:change={onChange} value={id}>
      <section>
        <img alt={name} src={image}/>
        <h3>{name}</h3>
      </section>
    </label>
  {/each} 

  <label class="text-field">
    <span>Station stay time, min</span>
    <input class="input-number" bind:value={timeOnStation} type="number" on:change={onChange} min="0" max="10"/>
  </label>

</section>
