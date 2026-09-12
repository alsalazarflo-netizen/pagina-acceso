<script>
  import { onMount } from "svelte";
  import { createOcean } from "./ocean.js";

  let canvas = $state();
  onMount(() => createOcean(canvas));
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 z-0 h-full w-full"></canvas>
