<script setup>
import { ref, inject, computed } from 'vue'
import { esc, catColor, hashColor, isDark } from '../utils/helpers.js'
import BookDetailModal from './BookDetailModal.vue'

const data=inject('data')
const shelfState=inject('shelfState')
const showBookDetail=inject('showBookDetail')
const bookDetailRef=ref(null)

const stNames={all:"整面书架墙",reading:"进行中",closable:"可收尾",done:"已读完",unstart:"未开始"}

const allBooks=computed(()=>{
  if(!data.value) return []
  let books=[...(data.value.shelf?.books||[])]
  const albums=data.value.shelf?.albums||[]
  albums.forEach(al=>{const ai=al.albumInfo||{};books.push({bookId:ai.albumId||"a"+Math.random(),title:ai.name||"",author:ai.authorName||"",category:"音频",cover:ai.cover||"",finishReading:ai.finish===1?1:0,progress:ai.finish===1?100:0,readUpdateTime:ai.updateTime||Math.floor(Date.now()/1000),deepLink:"",isAlbum:true})})
  if(data.value.shelf?.mp) books.push({bookId:"mp",title:"文章收藏",author:"",category:"其他",cover:"",finishReading:0,progress:0,readUpdateTime:Math.floor(Date.now()/1000),deepLink:"",isMp:true})
  return books
})

const filteredBooks=computed(()=>{
  let books=allBooks.value
  const st=shelfState.filterStatus
  if(st!=="all") books=books.filter(b=>{
    if(b.finishReading===1) return st==="done"
    const p=b.progress!=null?Number(b.progress):0
    if(p===0) return st==="unstart"
    if(p>=80) return st==="closable"
    return st==="reading"
  })
  const cat=shelfState.filterCat
  if(cat!=="all") books=books.filter(b=>(b.category||"未分类")===cat)
  const q=shelfState.search.trim().toLowerCase()
  if(q) books=books.filter(b=>(b.title||"").toLowerCase().includes(q)||(b.author||"").toLowerCase().includes(q)||(b.category||"").toLowerCase().includes(q))
  const sort=shelfState.sort
  if(sort==="update") books=[...books].sort((a,b)=>(b.readUpdateTime||0)-(a.readUpdateTime||0))
  else if(sort==="title") books=[...books].sort((a,b)=>String(a.title).localeCompare(String(b.title),"zh"))
  else if(sort==="author") books=[...books].sort((a,b)=>String(a.author).localeCompare(String(b.author),"zh"))
  return books
})

// 按分类分组，每组拆为28本/排
const shelfRows=computed(()=>{
  const groups={}
  filteredBooks.value.forEach(b=>{const c=b.category||"未分类";(groups[c]=groups[c]||[]).push(b)})
  // 按最近阅读时间排序分类：最近看过的分类排前面
  const sorted=Object.entries(groups).sort(([,a],[,b])=>{
    const ma=Math.max(...a.map(x=>x.readUpdateTime||0))
    const mb=Math.max(...b.map(x=>x.readUpdateTime||0))
    return mb-ma
  })
  const rows=[]
  const perRow=getBooksPerRow()
  sorted.forEach(([cat,list])=>{
    for(let i=0;i<list.length;i+=perRow){
      rows.push({cat,chunk:list.slice(i,i+perRow),isFirst:i===0,catTotal:list.length})
    }
  })
  return rows
})

// 分类计数（用于 pills）
const catCounts=computed(()=>{
  const counts={}
  allBooks.value.forEach(b=>{const c=b.category||"未分类";counts[c]=(counts[c]||0)+1})
  return counts
})
const sortedCats=computed(()=>Object.keys(catCounts.value).sort((a,b)=>catCounts.value[b]-catCounts.value[a]))
const visibleCats=computed(()=>{
  const all=sortedCats.value
  return shelfState.catExpanded||all.length<=6?all:all.slice(0,6)
})

function openBook(b){bookDetailRef.value?.open(b)}
const SPINE_W=20
function spineStyle(b){
  const h=90+((b.title||"").length*3)%50
  const col=hashColor(b.title)
  if(b.cover) return {height:h+"px",width:SPINE_W+"px",background:"url("+b.cover+") center/cover no-repeat",backgroundColor:col}
  return {height:h+"px",width:SPINE_W+"px",background:col}
}
function getBooksPerRow(){
  const shelf=document.querySelector(".bookshelf")
  if(!shelf) return 22
  return Math.max(5,Math.floor((shelf.clientWidth-120)/(SPINE_W+3))-1)
}
</script>

<template>
<div class="panel" style="padding-top:16px">
  <!-- 工具栏 -->
  <div class="toolbar">
    <div class="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input type="text" v-model="shelfState.search" placeholder="搜索 书名、作者、分类" />
    </div>
    <select class="sel" v-model="shelfState.sort">
      <option value="default">排序 书架布局</option>
      <option value="update">最近阅读</option>
      <option value="title">书名</option>
      <option value="author">作者</option>
    </select>
  </div>
  <!-- 状态 pills -->
  <div class="pills">
    <span class="pill" :class="{active:shelfState.filterStatus==='all'}" @click="shelfState.filterStatus='all'">全部</span>
    <span class="pill" :class="{active:shelfState.filterStatus==='reading'}" @click="shelfState.filterStatus='reading'">进行中</span>
    <span class="pill" :class="{active:shelfState.filterStatus==='closable'}" @click="shelfState.filterStatus='closable'">可收尾</span>
    <span class="pill" :class="{active:shelfState.filterStatus==='done'}" @click="shelfState.filterStatus='done'">已读完</span>
    <span class="pill" :class="{active:shelfState.filterStatus==='unstart'}" @click="shelfState.filterStatus='unstart'">未开始</span>
  </div>
  <div style="height:8px"></div>
  <!-- 分类 pills -->
  <div class="pills">
    <span class="pill" :class="{active:shelfState.filterCat==='all'}" @click="shelfState.filterCat='all'">全部类型</span>
    <span v-for="c in visibleCats" :key="c" class="pill" :class="{active:shelfState.filterCat===c}" @click="shelfState.filterCat=c">{{ esc(c) }} ({{ catCounts[c] }})</span>
    <span v-if="sortedCats.length>6" class="pill pill-toggle" @click="shelfState.catExpanded=!shelfState.catExpanded">
      {{ shelfState.catExpanded ? '收起 ▲' : '展开 ▼ (共'+sortedCats.length+'类)' }}
    </span>
  </div>
  <div style="height:14px"></div>
  <!-- 书架标题 -->
  <div class="shelf-meta">
    <h3>{{ stNames[shelfState.filterStatus]||'整面书架墙' }}{{ shelfState.filterCat!=='all'?' · '+shelfState.filterCat:'' }}</h3>
    <div class="count">{{ filteredBooks.length }} 本</div>
  </div>
  <!-- 书架主体：一个 bookshelf 容器，所有行在内部 -->
  <div class="bookshelf">
    <div v-if="!filteredBooks.length" class="empty">没有符合条件的书</div>
    <template v-for="(row,ri) in shelfRows" :key="ri">
      <div class="shelf-row">
        <!-- 分类标签书脊（仅每分类第一排） -->
        <div v-if="row.isFirst" class="cat-book" :style="{height:(110+((row.cat||'').length*2)%20)+'px'}">
          <div class="cat-name">{{ esc(row.cat) }}</div>
          <div class="cat-count">{{ row.catTotal }}本</div>
        </div>
        <!-- 普通书脊 -->
        <div v-for="b in row.chunk" :key="b.bookId" class="spine" :style="spineStyle(b)"
          :title="b.title+(b.author?' / '+b.author:'')" @click="openBook(b)">
          <img v-if="b.cover" :src="b.cover" class="spine-cover" @error="$event.target.remove()" />
          <span class="t" :class="{dark:!isDark(hashColor(b.title))}" :style="b.cover?{textShadow:'0 1px 4px rgba(0,0,0,.8)',fontWeight:'600',fontSize:'11px'}:{}">{{ esc(b.title) }}</span>
        </div>
      </div>
    </template>
  </div>
</div>
<BookDetailModal ref="bookDetailRef" />
</template>
