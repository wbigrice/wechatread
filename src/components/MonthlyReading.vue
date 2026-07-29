<script setup>
import { ref, computed, inject, watch, onMounted } from 'vue'
import { fmtDuration, esc } from '../utils/helpers.js'

const data = inject('data')
const apiKey = inject('apiKey')
const callWeread = inject('callWeread')
const showErr = inject('showErr')

const monthBaseTime = ref(0)
const monthlyData = ref(null)
const loading = ref(false)
const pickerVisible = ref(false)
const pickerYear = ref(new Date().getFullYear())

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const monthLabel = computed(() => {
  if (monthBaseTime.value === 0) return '本月'
  const d = new Date(monthBaseTime.value * 1000)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

const currentMonthly = computed(() => {
  if (monthBaseTime.value === 0 && data.value?.monthly) {
    return data.value.monthly
  }
  return monthlyData.value
})

const statCards = computed(() => {
  const m = currentMonthly.value
  if (!m) return []
  const readCount = m.readLongest ? m.readLongest.length : 0
  const doneCount = m.finishedCount != null ? m.finishedCount
    : (m.readLongest ? m.readLongest.filter(x => {
        const b = x.book || x.albumInfo || {}
        return b.finishReading === 1 || x.finishReading === 1
      }).length : 0)
  return [
    { label: '看过', value: `${readCount}本`, icon: 'book' },
    { label: '读完', value: `${doneCount}本`, icon: 'check' },
    { label: '时长', value: fmtDuration(m.totalReadTime || 0), icon: 'time' },
    { label: '天数', value: `${m.readDays || 0}天`, icon: 'day' }
  ]
})

const monthBooks = computed(() => {
  const m = currentMonthly.value
  if (!m || !m.readLongest) return []
  return m.readLongest.slice(0, 20).map(x => {
    const b = x.book || x.albumInfo || {}
    return {
      title: b.title || b.name || '',
      author: b.author || b.authorName || '',
      time: x.readTime || 0,
      lines: x.lines || 0,
      ideas: x.ideas || 0,
      cover: b.cover || ''
    }
  })
})

const topBook = computed(() => {
  const list = monthBooks.value
  if (list.length === 0) return null
  return list[0]
})

const doneBooks = computed(() => {
  const m = currentMonthly.value
  if (!m) return []
  const shelf = data.value?.shelf?.books || []
  return shelf.filter(b => b.finishReading === 1).slice(0, 5).map(b => ({
    title: b.title || '',
    totalTime: 0,
    lines: 0,
    ideas: 0,
    cover: b.cover || ''
  }))
})

const summaryText = computed(() => {
  const m = currentMonthly.value
  if (!m) return ''
  const total = m.totalReadTime || 0
  const days = m.readDays || 0
  const compare = m.compare != null ? m.compare : 0
  const avgDaily = days > 0 ? Math.round(total / 60 / days) : 0
  let text = `本月阅读时长${fmtDuration(total)}，阅读${days}天`
  if (avgDaily > 0) text += `，日均阅读${avgDaily}分钟`
  if (compare > 0) text += `，较上月增长${(compare * 100).toFixed(0)}%`
  else if (compare < 0) text += `，较上月减少${Math.abs(compare * 100).toFixed(0)}%`
  return text
})

function computeBaseTime(year, month) {
  const d = new Date(year, month - 1, 1)
  return Math.floor(d.getTime() / 1000)
}

async function selectMonth(month) {
  pickerVisible.value = false
  const bt = computeBaseTime(pickerYear.value, month)
  if (bt === monthBaseTime.value) return
  monthBaseTime.value = bt
  await fetchMonthly()
}

async function fetchMonthly() {
  if (loading.value) return
  loading.value = true
  try {
    const result = await callWeread('/readdata/detail', { mode: 'monthly', baseTime: monthBaseTime.value })
    monthlyData.value = result
  } catch (e) {
    showErr('获取月度数据失败：' + e.message)
  } finally {
    loading.value = false
  }
}

function openPicker() {
  if (monthBaseTime.value === 0) {
    pickerYear.value = new Date().getFullYear()
  } else {
    pickerYear.value = new Date(monthBaseTime.value * 1000).getFullYear()
  }
  pickerVisible.value = !pickerVisible.value
}

function closePicker() {
  pickerVisible.value = false
}

function prevYear() {
  pickerYear.value--
}

function nextYear() {
  pickerYear.value++
}

function getCurrentDateFields() {
  if (monthBaseTime.value === 0) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }
  const d = new Date(monthBaseTime.value * 1000)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

async function goPrevMonth() {
  const { year, month } = getCurrentDateFields()
  let ym = month - 1
  let yy = year
  if (ym < 1) { ym = 12; yy-- }
  monthBaseTime.value = computeBaseTime(yy, ym)
  await fetchMonthly()
}

async function goNextMonth() {
  const { year, month } = getCurrentDateFields()
  let ym = month + 1
  let yy = year
  if (ym > 12) { ym = 1; yy++ }
  monthBaseTime.value = computeBaseTime(yy, ym)
  await fetchMonthly()
}

function goCurrentMonth() {
  monthBaseTime.value = 0
  monthlyData.value = data.value?.monthly || null
}

function isCurrentMonth() {
  return monthBaseTime.value === 0
}

function isSelectedMonth(month) {
  if (monthBaseTime.value === 0) {
    const now = new Date()
    return pickerYear.value === now.getFullYear() && month === now.getMonth() + 1
  }
  const d = new Date(monthBaseTime.value * 1000)
  return pickerYear.value === d.getFullYear() && month === d.getMonth() + 1
}

onMounted(() => {
  if (data.value?.monthly && monthBaseTime.value === 0) {
    monthlyData.value = data.value.monthly
  }
})

watch(() => data.value, (newVal) => {
  if (newVal && monthBaseTime.value === 0 && newVal.monthly) {
    monthlyData.value = newVal.monthly
  }
})
</script>

<template>
  <div class="section-panel monthly-section">
    <div class="monthly-header">
      <h3 class="section-title">月度阅读</h3>
      <div class="month-nav">
        <button class="month-nav-btn" @click="goPrevMonth" :disabled="loading">
          &lt;
        </button>
        <span class="month-label" @click="openPicker">{{ monthLabel }}</span>
        <button class="month-nav-btn" @click="goNextMonth" :disabled="loading">
          &gt;
        </button>
        <button v-if="!isCurrentMonth()" class="month-nav-back" @click="goCurrentMonth">回本月</button>
      </div>
    </div>

    <div class="month-picker-wrap" v-if="pickerVisible">
      <div class="month-picker-backdrop" @click="closePicker"></div>
      <div class="month-picker-popup">
        <div class="picker-year-nav">
          <button @click="prevYear">&lt;</button>
          <span>{{ pickerYear }}年</span>
          <button @click="nextYear">&gt;</button>
        </div>
        <div class="picker-month-grid">
          <button
            v-for="(m, idx) in monthNames"
            :key="idx"
            class="picker-month-btn"
            :class="{ 'picker-month-active': isSelectedMonth(idx + 1) }"
            @click="selectMonth(idx + 1)"
          >{{ m }}</button>
        </div>
      </div>
    </div>

    <div class="monthly-stat-cards">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-card-label">{{ card.label }}</div>
        <div class="stat-card-value">{{ card.value }}</div>
      </div>
    </div>

    <p v-if="summaryText" class="monthly-summary">{{ summaryText }}</p>

    <div class="monthly-body">
      <div class="monthly-main">
        <h4 class="sub-title" v-if="monthBooks.length">本月阅读</h4>
        <div class="month-book-list">
          <div v-for="(book, idx) in monthBooks" :key="idx" class="month-book-item">
            <span class="month-book-idx">{{ idx + 1 }}</span>
            <span class="month-book-cover" v-if="book.cover">
              <img :src="book.cover" :alt="book.title" />
            </span>
            <span class="month-book-cover-placeholder" v-else></span>
            <div class="month-book-info">
              <div class="month-book-title">{{ esc(book.title) }}</div>
              <div class="month-book-author">{{ esc(book.author) }}</div>
            </div>
            <div class="month-book-meta">
              <span class="month-book-time">{{ fmtDuration(book.time) }}</span>
              <span class="month-book-detail" v-if="book.lines">{{ book.lines }}划线</span>
              <span class="month-book-detail" v-if="book.ideas">{{ book.ideas }}想法</span>
            </div>
          </div>
        </div>
        <div v-if="monthBooks.length === 0 && !loading" class="empty-hint">本月暂无阅读记录</div>
      </div>

      <div class="monthly-sidebar">
        <div v-if="topBook" class="sidebar-block">
          <h4 class="sub-title">本月之最</h4>
          <div class="top-book-card">
            <span class="top-book-cover" v-if="topBook.cover">
              <img :src="topBook.cover" :alt="topBook.title" />
            </span>
            <span class="top-book-cover-placeholder" v-else></span>
            <div class="top-book-info">
              <div class="top-book-title">{{ esc(topBook.title) }}</div>
              <div class="top-book-author">{{ esc(topBook.author) }}</div>
              <div class="top-book-time">{{ fmtDuration(topBook.time) }}</div>
            </div>
          </div>
        </div>

        <div v-if="doneBooks.length > 0" class="sidebar-block">
          <h4 class="sub-title">读完</h4>
          <div class="done-book-list">
            <div v-for="(book, idx) in doneBooks" :key="idx" class="done-book-item">
              <span class="done-book-cover" v-if="book.cover">
                <img :src="book.cover" :alt="book.title" />
              </span>
              <span class="done-book-cover-placeholder" v-else></span>
              <span class="done-book-title">{{ esc(book.title) }}</span>
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
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.sub-title {
  margin: 16px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.monthly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.month-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.month-nav-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  line-height: 1;
}
.month-nav-btn:hover { background: #e8e8e8; }
.month-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.month-label {
  font-size: 14px;
  font-weight: 600;
  color: #3a7c6a;
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 4px;
  min-width: 80px;
  text-align: center;
  user-select: none;
}
.month-label:hover { background: #f0f6f3; }
.month-nav-back {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
}
.month-nav-back:hover { color: #3a7c6a; }

.month-picker-wrap {
  position: relative;
}
.month-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 98;
}
.month-picker-popup {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 99;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 14px;
  min-width: 220px;
}
.picker-year-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.picker-year-nav button {
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
.picker-year-nav button:hover { background: #e0e0e0; }
.picker-month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.picker-month-btn {
  padding: 8px 4px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  text-align: center;
}
.picker-month-btn:hover { background: #e8f4ee; border-color: #a0d4bb; }
.picker-month-active {
  background: #3a7c6a;
  color: #fff;
  border-color: #3a7c6a;
}
.picker-month-active:hover {
  background: #2f6b5a;
  color: #fff;
}

.monthly-stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
}
.stat-card-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.stat-card-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.monthly-summary {
  margin: 0 0 10px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.monthly-body {
  display: flex;
  gap: 20px;
}
.monthly-main {
  flex: 1;
  min-width: 0;
}
.monthly-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.month-book-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 560px;
  overflow-y: auto;
}
.month-book-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.month-book-idx {
  width: 20px;
  font-size: 12px;
  color: #bbb;
  text-align: center;
  flex-shrink: 0;
}
.month-book-cover, .month-book-cover-placeholder, .top-book-cover, .top-book-cover-placeholder, .done-book-cover, .done-book-cover-placeholder {
  width: 36px;
  height: 48px;
  border-radius: 3px;
  flex-shrink: 0;
  overflow: hidden;
  display: inline-block;
}
.month-book-cover img, .top-book-cover img, .done-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.month-book-cover-placeholder, .top-book-cover-placeholder, .done-book-cover-placeholder {
  background: #e8e8e8;
}
.month-book-info {
  flex: 1;
  min-width: 0;
}
.month-book-title, .top-book-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.month-book-author, .top-book-author {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.month-book-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.month-book-time {
  font-size: 12px;
  color: #3a7c6a;
  font-weight: 500;
}
.month-book-detail {
  font-size: 11px;
  color: #aaa;
}

.sidebar-block {
  margin-bottom: 16px;
}
.top-book-card {
  display: flex;
  gap: 10px;
  padding: 8px 0;
}
.top-book-info {
  min-width: 0;
}
.top-book-time {
  font-size: 12px;
  color: #3a7c6a;
  font-weight: 600;
  margin-top: 4px;
}
.done-book-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.done-book-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.done-book-title {
  font-size: 12px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-hint {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 680px) {
  .monthly-body {
    flex-direction: column;
  }
  .monthly-sidebar {
    width: 100%;
  }
  .monthly-stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
