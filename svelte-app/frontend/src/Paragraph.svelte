<script>
    import { onMount } from '../../vanilla-app/svelte-app/node_modules/svelte/types/runtime';
    let paragraphs = [];
  
    onMount(async () => {
      const response = await fetch('/api/paragraphs/');
      paragraphs = await response.json();
    });
  </script> d
  
  {#each paragraphs as paragraph}
    <div class="paragraph">
      <h3>Paragraph {paragraph.id} (Weight: {paragraph.weight})</h3>
      <p>
        {#each paragraph.words as word}
          <span class="word">{word.text}</span>
        {/each}
      </p>
    </div>
  {/each}
  