<script setup>
import { Splitpanes, Pane } from 'splitpanes';

defineProps({});
</script>

<template>
  <Splitpanes horizontal class="split-panes" :dbl-click-splitter="false">
    <Pane>2</Pane>
    <Pane max-size="25" min-size="10" size="20">3</Pane>
  </Splitpanes>
</template>

<style scoped></style>
