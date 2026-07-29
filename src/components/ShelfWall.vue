<script setup>
import { ref, inject, computed } from 'vue'
import { esc, catColor, hashColor, isDark } from '../utils/helpers.js'
import BookDetailModal from './BookDetailModal.vue'

const data = inject('data')
const shelfState = inject('shelfState')

// ---- spine dimension helpers ----
function spineHash(str, seed) {
  let h = seed
  for (let i = 0; i < str.length; i++) {
    h = ((h * 31) + str.charCodeAt(i)) & 0x7fffffff
  }
  return h
}

function spineHeight(bookId) {
  return 90 + (spineHash(String(bookId || ''), 17) % 51)
}

function spineWidth(bookId) {
  return 14 + (spineHash(String(bookId || ''), 43) % 19)
}

// ---- unified book list ----
const allBooks = computed(() => {
  const shelf = data.value?.shelf
  if (!shelf) return []

  const items = []

  // Books
  if (Array.isArray(shelf.books)) {
    for (const b of shelf.books) {
      items.push({
        bookId: b.bookId || '',
        title: b.title || '',
        author: b.author || '',
        category: b.category || '未分类',
        cover: b.cover || '',
        finishReading: b.finishReading || 0,
        progress: b.progress || 0,
        readUpdateTime: b.readUpdateTime || 0,
        deepLink: b.deepLink || '',
        _type: 'book'
      })
    }
  }

  // Albums
  if (Array.isArray(shelf.albums)) {
    for (const a of shelf.albums) {
      const info = a.albumInfo || {}
      items.push({
        bookId: info.bookId || '',
        title: info.title || info.name || '',
        author: info.author || info.authorName || '',
        category: info.category || '未分类',
        cover: info.cover || '',
        finishReading: info.finish || (info.finishReading === 1 ? 1 : 0),
        progress: info.progress || 0,
        readUpdateTime: a.readUpdateTime || 0,
        deepLink: info.deepLink || '',
        _type: 'album'
      })
    }
  }

  // MP (公众号)
  if (shelf.mp) {
    const mp = shelf.mp
    const info = mp.mpInfo || {}
    items.push({
      bookId: info.bookId || '',
      title: info.title || info.name || '',
      author: info.author || info.authorName || '',
      category: '公众号',
      cover: info.cover || '',
      finishReading: info.finish || (info.finishReading === 1 ? 1 : 0),
      progress: info.progress || 0,
      readUpdateTime: mp.readUpdateTime || 0,
      deepLink: info.deepLink || '',
      _type: 'mp'
    })
  }

  return items
})

// ---- status filter ----
const STATUS_ITEMS = [
  { key: 'all', label: '全部' },
  { key: 'reading', label: '进行中' },
  { key: 'finishable', label: '可收尾' },
  { key: 'done', label: '已读完' },
  { key: 'unread', label: '未开始' }
]

function matchesStatus(book, status) {
  switch (status) {
    case 'reading':
      return book.finishReading !== 1 && book.progress > 0
    case 'finishable':
      return book.finishReading !== 1 && book.progress >= 80
    case 'done':
      return book.finishReading === 1
    case 'unread':
      return book.progress === 0
    default:
      return true
  }
}

// ---- filtered & sorted ----
const filteredBooks = computed(() => {
  let books = allBooks.value

  // Status filter
  const status = shelfState.filterStatus || 'all'
  if (status !== 'all') {
    books = books.filter(b => matchesStatus(b, status))
  }

  // Category filter
  const cat = shelfState.filterCat || 'all'
  if (cat !== 'all') {
    books = books.filter(b => (b.category || '未分类') === cat)
  }

  // Search filter
  const search = (shelfState.search || '').trim().toLowerCase()
  if (search) {
    books = books.filter(b =>
      (b.title || '').toLowerCase().includes(search) ||
      (b.author || '').toLowerCase().includes(search)
    )
  }

  return books
})

const sortedBooks = computed(() => {
  const books = [...filteredBooks.value]
  const sort = shelfState.sort || 'default'

  switch (sort) {
    case 'title':
      books.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'zh'))
      break
    case 'author':
      books.sort((a, b) => (a.author || '').localeCompare(b.author || '', 'zh') || (a.title || '').localeCompare(b.title || '', 'zh'))
      break
    case 'recent':
      books.sort((a, b) => (b.readUpdateTime || 0) - (a.readUpdateTime || 0))
      break
    case 'progress':
      books.sort((a, b) => (b.progress || 0) - (a.progress || 0))
      break
    default:
      // Keep original order
      break
  }

  return books
})

// ---- category pills ----
const allCategories = computed(() => {
  // Compute from ALL books (not filtered), to show full counts
  const catMap = new Map()
  for (const b of allBooks.value) {
    const cat = b.category || '未分类'
    catMap.set(cat, (catMap.get(cat) || 0) + 1)
  }
  const result = []
  for (const [name, count] of catMap) {
    result.push({ name, count })
  }
  result.sort((a, b) => b.count - a.count)
  return result
})

const visibleCategories = computed(() => {
  const cats = allCategories.value
  if (cats.length <= 6 || shelfState.catExpanded) return cats
  return cats.slice(0, 6)
})

const hiddenCategoryCount = computed(() => {
  const total = allCategories.value.length
  return total > 6 ? total - 6 : 0
})

// ---- shelf rows (grouped by category, chunked by 28) ----
const SHELF_CHUNK = 28

const categoryTotalCounts = computed(() => {
  const map = new Map()
  for (const b of sortedBooks.value) {
    const cat = b.category || '未分类'
    map.set(cat, (map.get(cat) || 0) + 1)
  }
  return map
})

const shelfRows = computed(() => {
  const rows = []
  const books = sortedBooks.value
  if (books.length === 0) return rows

  // Group by category
  const groups = new Map()
  for (const b of books) {
    const cat = b.category || '未分类'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat).push(b)
  }

  for (const [catName, catBooks] of groups) {
    const chunkCount = Math.ceil(catBooks.length / SHELF_CHUNK)
    for (let i = 0; i < chunkCount; i++) {
      const chunk = catBooks.slice(i * SHELF_CHUNK, (i + 1) * SHELF_CHUNK)
      rows.push({
        category: catName,
        isFirstOfCategory: i === 0,
        books: chunk,
        rowIndex: rows.length
      })
    }
  }

  return rows
})

// ---- spine style ----
function spineStyle(book) {
  const h = spineHeight(book.bookId)
  const w = spineWidth(book.bookId)
  const style = { height: h + 'px', width: w + 'px' }
  if (book.cover) {
    style.backgroundImage = `url(${book.cover})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  } else {
    const color = hashColor(book.title || book.bookId)
    style.backgroundColor = color
  }
  return style
}

function textColorClass(book) {
  if (book.cover) return ''
  const color = hashColor(book.title || book.bookId)
  return isDark(color) ? '' : 'dark'
}

// ---- modal ----
const bookDetailModalRef = ref(null)

function openBookDetail(book) {
  bookDetailModalRef.value?.open(book)
}
</script>

<template>
  <div class="panel">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          :value="shelfState.search"
          @input="shelfState.search = $event.target.value"
          placeholder="搜索书名、作者..."
        />
      </div>

      <select class="sel" v-model="shelfState.sort">
        <option value="default">默认排序</option>
        <option value="title">书名排序</option>
        <option value="author">作者排序</option>
        <option value="recent">最近阅读</option>
        <option value="progress">阅读进度</option>
      </select>
    </div>

    <!-- Status pills -->
    <div class="pills" style="margin-bottom:12px">
      <button
        v-for="s in STATUS_ITEMS"
        :key="s.key"
        class="pill"
        :class="{ active: (shelfState.filterStatus || 'all') === s.key }"
        @click="shelfState.filterStatus = s.key"
      >{{ s.label }}</button>
    </div>

    <!-- Category pills -->
    <div v-if="allCategories.length > 0" class="pills" style="margin-bottom:12px">
      <button
        class="pill"
        :class="{ active: (shelfState.filterCat || 'all') === 'all' }"
        @click="shelfState.filterCat = 'all'"
      >全部类型</button>
      <button
        v-for="cat in visibleCategories"
        :key="cat.name"
        class="pill"
        :class="{ active: shelfState.filterCat === cat.name }"
        @click="shelfState.filterCat = cat.name"
      >
        {{ esc(cat.name) }}
        <span style="margin-left:4px;font-size:11px;opacity:.7">{{ cat.count }}</span>
      </button>
      <button
        v-if="hiddenCategoryCount > 0"
        class="pill pill-toggle"
        @click="shelfState.catExpanded = !shelfState.catExpanded"
      >{{ shelfState.catExpanded ? '收起' : '展开全部 (' + hiddenCategoryCount + ')' }}</button>
    </div>

    <!-- Empty state -->
    <div v-if="sortedBooks.length === 0" class="empty">
      没有找到匹配的书籍
    </div>

    <!-- Shelf rows -->
    <template v-for="row in shelfRows" :key="row.category + '-' + row.rowIndex">
      <div v-if="row.isFirstOfCategory" class="shelf-meta">
        <h3>{{ esc(row.category) }}</h3>
        <span class="count">{{ categoryTotalCounts.get(row.category) }} 本</span>
      </div>

      <div class="bookshelf">
        <div class="shelf-row">
          <!-- Category label book (first row of each category only) -->
          <div
            v-if="row.isFirstOfCategory"
            class="cat-book"
            :style="{ height: '130px', width: 'auto', minWidth: '36px', background: catColor(row.category) }"
          >
            <div class="cat-name" style="color:#fff">{{ esc(row.category) }}</div>
            <div class="cat-count" style="background:rgba(0,0,0,.15);border-top-color:rgba(255,255,255,.2)">
              {{ categoryTotalCounts.get(row.category) }}
            </div>
          </div>

          <!-- Book spines -->
          <div
            v-for="book in row.books"
            :key="book.bookId"
            class="spine"
            :style="spineStyle(book)"
            :title="book.title + (book.author ? ' - ' + book.author : '')"
            @click="openBookDetail(book)"
          >
            <span
              v-if="!book.cover"
              class="t"
              :class="textColorClass(book)"
            >{{ esc(book.title) }}</span>
          </div>
        </div>
      </div>
    </template>

    <BookDetailModal ref="bookDetailModalRef" />
  </div>
</template>
