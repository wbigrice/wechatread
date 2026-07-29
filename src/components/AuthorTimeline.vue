<script setup>
import { computed, inject } from 'vue'
import { authors, eraOf, ERA_KEYS, esc } from '../utils/helpers.js'

const data = inject('data')

const timelineGroups = computed(() => {
  if (!data.value) return []

  const books = data.value.shelf?.books || []
  const authorCounts = {}

  books.forEach(book => {
    const name = book.author || ''
    if (!name) return
    if (!authorCounts[name]) {
      authorCounts[name] = { count: 0, year: authors[name] || null }
    }
    authorCounts[name].count++
  })

  // Group by era
  const eraMap = {}
  ERA_KEYS.forEach(k => { eraMap[k] = [] })

  Object.entries(authorCounts).forEach(([name, info]) => {
    const era = eraOf(info.year)
    if (!eraMap[era]) eraMap[era] = []
    eraMap[era].push({ name, count: info.count, year: info.year })
  })

  // Sort authors within each era by count descending
  const result = []
  ERA_KEYS.forEach(era => {
    if (eraMap[era] && eraMap[era].length > 0) {
      eraMap[era].sort((a, b) => b.count - a.count)
      result.push({ era, authors: eraMap[era] })
    }
  })

  return result
})

const maxCount = computed(() => {
  let max = 0
  timelineGroups.value.forEach(g => {
    g.authors.forEach(a => {
      if (a.count > max) max = a.count
    })
  })
  return max || 1
})
</script>

<template>
  <div class="section-panel">
    <h3 class="section-title">作者时代分布</h3>

    <div v-if="timelineGroups.length === 0" class="empty-hint">
      暂无作者数据
    </div>

    <div v-else class="timeline-wrap">
      <div class="timeline-axis">
        <div
          v-for="group in timelineGroups"
          :key="group.era"
          class="timeline-era-section"
        >
          <div class="timeline-era-dot"></div>
          <div class="timeline-era-label">{{ group.era }}</div>
          <div class="timeline-era-line"></div>
        </div>
      </div>

      <div class="timeline-body">
        <div
          v-for="group in timelineGroups"
          :key="group.era"
          class="timeline-era-block"
        >
          <div class="era-authors">
            <div
              v-for="author in group.authors"
              :key="author.name"
              class="author-chip"
              :title="`${author.name}: ${author.count}本`"
            >
              <span class="chip-name">{{ esc(author.name) }}</span>
              <span class="chip-count">{{ author.count }}</span>
            </div>
          </div>
        </div>
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
  margin: 0 0 16px 0;
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

.timeline-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-axis {
  display: flex;
  align-items: flex-start;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 12px;
}
.timeline-era-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.timeline-era-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3a7c6a;
  margin-bottom: 4px;
}
.timeline-era-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.timeline-body {
  display: flex;
}
.timeline-era-block {
  flex: 1;
  padding: 0 4px;
}
.era-authors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.author-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f0f6f3;
  border: 1px solid #d0e4d8;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 12px;
  cursor: default;
  transition: background 0.15s;
}
.author-chip:hover {
  background: #dcebe3;
}
.chip-name {
  color: #333;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chip-count {
  color: #3a7c6a;
  font-weight: 600;
  font-size: 11px;
  background: #fff;
  border-radius: 8px;
  padding: 0 5px;
  min-width: 16px;
  text-align: center;
}
</style>
