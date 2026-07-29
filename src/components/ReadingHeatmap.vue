<script setup>
import { computed, inject } from 'vue'

const data = inject('data')

const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

const colorScale = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']

const heatmapData = computed(() => {
  if (!data.value || !data.value.heat) return { years: [], grid: {} }

  const raw = data.value.heat
  const yearSet = new Set()
  const grid = {}

  Object.entries(raw).forEach(([key, val]) => {
    const [y, m] = key.split('-')
    if (!y || !m) return
    const year = parseInt(y, 10)
    const month = parseInt(m, 10)
    yearSet.add(year)
    const minutes = Math.round((Number(val) || 0) / 60)
    if (!grid[year]) grid[year] = Array(12).fill(0)
    if (month >= 1 && month <= 12) {
      grid[year][month - 1] = minutes
    }
  })

  const years = Array.from(yearSet).sort((a, b) => a - b)
  return { years, grid }
})

function getLevel(minutes) {
  if (minutes <= 0) return 0
  if (minutes < 120) return 1
  if (minutes < 480) return 2
  if (minutes < 960) return 3
  return 4
}

function formatDuration(minutes) {
  if (minutes <= 0) return '0'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return '0'
}
</script>

<template>
  <div class="section-panel">
    <h3 class="section-title">阅读热力图</h3>
    <div v-if="heatmapData.years.length === 0" class="empty-hint">暂无数据</div>
    <div v-else class="heatmap-wrap">
      <table class="hm-table">
        <thead>
          <tr>
            <th class="hm-year-col"></th>
            <th v-for="m in months" :key="m" class="hm-month-hd">{{ m }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="year in heatmapData.years" :key="year">
            <td class="hm-year-lbl">{{ year }}</td>
            <td
              v-for="(m, mi) in months"
              :key="mi"
              class="hm-cell"
              :class="`hm-lv-${getLevel(heatmapData.grid[year]?.[mi] || 0)}`"
              :title="`${year}年${mi + 1}月: ${heatmapData.grid[year]?.[mi] || 0}分钟`"
            >
              {{ formatDuration(heatmapData.grid[year]?.[mi] || 0) }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="hm-legend">
        <span class="hm-legend-label">少</span>
        <span
          v-for="(c, i) in colorScale"
          :key="i"
          class="hm-legend-block"
          :style="{ backgroundColor: c }"
        ></span>
        <span class="hm-legend-label">多</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-panel {
  background: #fff;
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}
.section-title {
  margin: 0 0 14px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.empty-hint {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
}
.heatmap-wrap {
  overflow-x: auto;
}
</style>

<style>
.hm-table {
  border-collapse: separate;
  border-spacing: 3px;
  width: 100%;
}
.hm-year-col {
  width: 48px;
}
.hm-month-hd {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 2px 4px;
  font-weight: 500;
}
.hm-year-lbl {
  font-size: 12px;
  color: #555;
  text-align: right;
  padding-right: 6px;
  font-weight: 500;
  white-space: nowrap;
}
.hm-cell {
  text-align: center;
  font-size: 11px;
  color: #555;
  border-radius: 3px;
  padding: 6px 4px;
  min-width: 36px;
  font-variant-numeric: tabular-nums;
}
.hm-lv-0 { background: #ebedf0; color: #bbb; }
.hm-lv-1 { background: #c6e48b; color: #555; }
.hm-lv-2 { background: #7bc96f; color: #fff; }
.hm-lv-3 { background: #239a3b; color: #fff; }
.hm-lv-4 { background: #196127; color: #fff; }

.hm-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 10px;
}
.hm-legend-label {
  font-size: 11px;
  color: #999;
}
.hm-legend-block {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 2px;
}
</style>
