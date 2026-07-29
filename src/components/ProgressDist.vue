<script setup>
import { computed, inject } from 'vue'

const data = inject('data')

const buckets = [
  { label: '0-25%', range: [0, 25], color: '#c5c1b9' },
  { label: '25-50%', range: [25, 50], color: '#a8cbb9' },
  { label: '50-75%', range: [50, 75], color: '#d4b36a' },
  { label: '75-99%', range: [75, 99], color: '#c98a5a' },
  { label: '100%', range: [100, 100], color: '#4a7c6a' }
]

const distribution = computed(() => {
  if (!data.value) return []
  const books = data.value.shelf?.books || []
  const counts = buckets.map(() => 0)

  books.forEach(book => {
    const prog = book.progress != null ? Number(book.progress) : 0
    for (let i = 0; i < buckets.length; i++) {
      const [lo, hi] = buckets[i].range
      if (prog >= lo && prog <= hi) {
        counts[i]++
        break
      }
    }
  })

  const total = books.length || 1
  return buckets.map((b, i) => ({
    ...b,
    count: counts[i],
    pct: ((counts[i] / total) * 100).toFixed(1)
  }))
})

const maxCount = computed(() => {
  const dist = distribution.value
  if (dist.length === 0) return 1
  return Math.max(...dist.map(d => d.count), 1)
})
</script>

<template>
  <div class="section-panel">
    <h3 class="section-title">阅读进度分布</h3>
    <div v-if="!data.value" class="empty-hint">暂无数据</div>
    <div v-else class="progress-dist">
      <div
        v-for="(bucket, idx) in distribution"
        :key="idx"
        class="progress-row"
      >
        <span class="progress-label">{{ bucket.label }}</span>
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill"
            :style="{
              width: maxCount > 0 ? (bucket.count / maxCount * 100) + '%' : '0%',
              backgroundColor: bucket.color
            }"
          ></div>
        </div>
        <span class="progress-count">{{ bucket.count }}本</span>
        <span class="progress-pct">{{ bucket.pct }}%</span>
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
  margin-bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.empty-hint {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
}
.progress-dist {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  justify-content: center;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-label {
  width: 56px;
  font-size: 12px;
  color: #666;
  text-align: right;
  flex-shrink: 0;
}
.progress-bar-track {
  flex: 1;
  height: 18px;
  background: #f0f0f0;
  border-radius: 9px;
  overflow: hidden;
  min-width: 40px;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 9px;
  min-width: 4px;
  transition: width 0.5s ease;
}
.progress-count {
  width: 38px;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  text-align: right;
  flex-shrink: 0;
}
.progress-pct {
  width: 42px;
  font-size: 12px;
  color: #999;
  text-align: right;
  flex-shrink: 0;
}
@media (max-width: 680px) {
  .progress-dist {
    gap: 10px;
  }
  .progress-bar-track {
    height: 16px;
  }
}
</style>
