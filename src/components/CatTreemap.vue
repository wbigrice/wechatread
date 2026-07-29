<script setup>
import { ref, inject, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { catColor } from '../utils/helpers.js'
import { _getChart, _disposeChart } from '../composables/useCharts.js'

const data = inject('data')

const chartReady = ref(false)
let chart = null
let observer = null
let visibilityResolve = null

function waitForVisible() {
  return new Promise((resolve) => {
    const el = document.getElementById('treemap')
    if (!el) { resolve(); return }
    if (el.offsetParent !== null) { resolve(); return }
    visibilityResolve = resolve
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect()
          observer = null
          resolve()
        }
      })
    })
    observer.observe(el)
  })
}

function buildChart() {
  if (!data.value) return
  const cats = data.value.overall?.preferCategory || []
  if (cats.length === 0) return

  const total = cats.reduce((s, c) => s + (c.readingCount || 0), 0)

  const seriesData = cats.map(c => ({
    name: c.categoryTitle,
    value: c.readingCount || 0,
    itemStyle: { color: catColor(c.categoryTitle) }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0
        return `<strong>${params.name}</strong><br/>${params.value} 本 (${pct}%)`
      }
    },
    series: [{
      type: 'treemap',
      data: seriesData,
      width: '100%',
      height: '100%',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        position: 'inside',
        formatter: (params) => {
          const pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0
          return `{name|${params.name}}\n{count|${params.value}本 ${pct}%}`
        },
        rich: {
          name: { fontSize: 13, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowBlur: 2 },
          count: { fontSize: 11, color: 'rgba(255,255,255,0.85)', textShadowColor: 'rgba(0,0,0,0.4)', textShadowBlur: 1 }
        }
      },
      upperLabel: { show: false },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
        gapWidth: 2
      },
      levels: [{
        itemStyle: { borderWidth: 0, gapWidth: 3 },
        upperLabel: { show: false }
      }]
    }]
  }

  chart.setOption(option, true)
}

function renderHtmlLegend() {
  if (!data.value) return
  const cats = data.value.overall?.preferCategory || []
  const total = cats.reduce((s, c) => s + (c.readingCount || 0), 0)
  const legendEl = document.getElementById('treemapLegend')
  if (!legendEl) return

  let html = ''
  cats.forEach(c => {
    const color = catColor(c.categoryTitle)
    const pct = total > 0 ? ((c.readingCount / total) * 100).toFixed(1) : 0
    html += `<span class="treemap-legend-item">
      <span class="treemap-legend-swatch" style="background:${color}"></span>
      <span class="treemap-legend-name">${c.categoryTitle}</span>
      <span class="treemap-legend-count">${c.readingCount}本 (${pct}%)</span>
    </span>`
  })
  legendEl.innerHTML = html
}

async function initChart() {
  await waitForVisible()
  await nextTick()
  chart = _getChart('treemap')
  if (chart) {
    chartReady.value = true
    buildChart()
    renderHtmlLegend()
  }
}

watch(() => data.value, (newVal) => {
  if (newVal && chartReady.value) {
    buildChart()
    renderHtmlLegend()
  }
}, { deep: true })

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  _disposeChart('treemap')
})
</script>

<template>
  <div class="section-panel">
    <h3 class="section-title">分类分布</h3>
    <div id="treemap" class="treemap-chart"></div>
    <div id="treemapLegend" class="treemap-legend"></div>
  </div>
</template>

<style scoped>
.section-panel {
  background: #fff;
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 0;
}
.section-title {
  margin: 0 0 14px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.treemap-chart {
  width: 100%;
  height: 320px;
}
.treemap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}
.treemap-legend :deep(.treemap-legend-item) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #555;
}
.treemap-legend :deep(.treemap-legend-swatch) {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}
.treemap-legend :deep(.treemap-legend-name) {
  white-space: nowrap;
}
.treemap-legend :deep(.treemap-legend-count) {
  color: #999;
  white-space: nowrap;
}
</style>
