<script setup>
import { computed, inject } from 'vue'
import { fmtDuration } from '../utils/helpers.js'

const data = inject('data')

const stats = computed(() => {
  if (!data.value?.overall?.readStat) return []
  return data.value.overall.readStat
})

const totalTime = computed(() => {
  if (!data.value?.overall?.totalReadTime) return ''
  return fmtDuration(data.value.overall.totalReadTime)
})

const profileName = computed(() => {
  return data.value?.profile?.name || ''
})
</script>

<template>
  <div class="overview-cards">
    <div class="overview-header" v-if="profileName">
      <span class="overview-greeting">{{ profileName }} 的阅读足迹</span>
    </div>

    <div class="overview-stat-row">
      <div v-for="(s, idx) in stats" :key="idx" class="overview-stat-card">
        <div class="overview-stat-num">{{ s.counts.replace(/[^0-9.]/g, '') }}<span class="overview-stat-unit">{{ s.counts.replace(/[0-9.]/g, '') }}</span></div>
        <div class="overview-stat-label">{{ s.stat }}</div>
      </div>
    </div>

    <div class="overview-total" v-if="totalTime">
      <span class="overview-total-label">累计阅读时长</span>
      <span class="overview-total-value">{{ totalTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.overview-cards {
  background: linear-gradient(135deg, #3a7c6a 0%, #2d6b5a 40%, #1f5245 100%);
  border-radius: 12px;
  padding: 22px 20px;
  margin-bottom: 20px;
  color: #fff;
}
.overview-header {
  margin-bottom: 14px;
}
.overview-greeting {
  font-size: 14px;
  opacity: 0.85;
}
.overview-stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.overview-stat-card {
  text-align: center;
}
.overview-stat-num {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}
.overview-stat-unit {
  font-size: 14px;
  font-weight: 400;
  margin-left: 2px;
}
.overview-stat-label {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 2px;
}
.overview-total {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.overview-total-label {
  font-size: 13px;
  opacity: 0.75;
}
.overview-total-value {
  font-size: 15px;
  font-weight: 600;
}
@media (max-width: 480px) {
  .overview-stat-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .overview-stat-num {
    font-size: 22px;
  }
}
</style>
