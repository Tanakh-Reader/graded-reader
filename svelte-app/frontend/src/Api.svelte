<script>
    import { onMount } from 'svelte';
    let words;
  
    async function fetchData() {
      const response = await fetch('/api/greeting/');
      words = await response.json();
    }
  </script>
  
  <button on:click={fetchData}>Load Words</button>
  
  {#if words}
    <ul>
      {#each words as word}
        <li>{word.text} ({word.gloss})</li>
      {/each}
    </ul>
  {/if}
  