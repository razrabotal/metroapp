<script>
  export let value = "";

  let attrs = {};

  $: {
    const { value, ...other } = $$props;
    attrs = other;
  }
</script>

<style lang="scss">
  @import "src/styles/base.scss";

  label {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    margin-bottom: 8px;

    @include sm {
      flex-direction: column;
      align-items: flex-start;
      width: 50%;
    }

    span {
      margin-bottom: 5px;
      min-width: 140px;
    }

    input {
      @include text-input;
      width: 70px;
    }
  }
</style>

<label>
  <span>
    <slot />
  </span>
  <input
    {...attrs}
    class="text-input"
    bind:value
    type="number"/>
</label>
