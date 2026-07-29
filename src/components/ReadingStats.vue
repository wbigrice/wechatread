<script setup>
import OverviewCards from './OverviewCards.vue'
import CatTreemap from './CatTreemap.vue'
import ProgressDist from './ProgressDist.vue'
import ReadingHeatmap from './ReadingHeatmap.vue'
import MonthlyReading from './MonthlyReading.vue'
import BubbleMap from './BubbleMap.vue'
import AuthorTimeline from './AuthorTimeline.vue'
</script>

<template>
  <div class="stats-root">
    <OverviewCards />
    <div class="stats-two-col">
      <div class="stats-col-left">
        <CatTreemap />
      </div>
      <div class="stats-col-right">
        <ProgressDist />
      </div>
    </div>
    <ReadingHeatmap />
    <MonthlyReading />
    <BubbleMap />
    <AuthorTimeline />
  </div>
</template>

<style scoped>
.stats-root {
  padding: 0 16px 24px;
  max-width: 960px;
  margin: 0 auto;
}
.stats-two-col {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stats-col-left {
  flex: 1 1 55%;
  min-width: 0;
}
.stats-col-right {
  flex: 1 1 45%;
  min-width: 0;
}
@media (max-width: 680px) {
  .stats-two-col {
    flex-direction: column;
  }
}
</style>
