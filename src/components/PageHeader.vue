<script setup>
import { inject, computed } from 'vue'
const data=inject('data')
const showSettings=inject('showSettings')
const p=computed(()=>data.value?.profile||{})
const sh=computed(()=>data.value?.shelf||{books:[],albums:[]})
const total=computed(()=>sh.value.books.length+(sh.value.albums||[]).length+(sh.value.mp?1:0))
const done=computed(()=>sh.value.books.filter(x=>x.finishReading===1).length+(sh.value.albums||[]).filter(x=>x.albumInfo&&x.albumInfo.finish===1).length)
const title=computed(()=>(p.value.name?p.value.name+"，":"")+"欢迎使用微信读书书架墙")
</script>

<template>
<header class="header">
  <div class="avatar">
    <img v-if="p.avatar" :src="p.avatar" alt="用户头像" />
    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 20.5a1.5 1.5 0 0 1 1.5-1.5H20"/></svg>
  </div>
  <div class="brand">
    <div class="small">WeRead Library</div>
    <h1>{{ title }}</h1>
  </div>
  <div class="spacer"></div>
  <div class="stats">
    <div><div class="num">{{ total }}</div><div class="lab">书架条目</div></div>
    <div><div class="num">{{ done }}</div><div class="lab">已读完</div></div>
    <div><div class="num">{{ total-done }}</div><div class="lab">进行中</div></div>
  </div>
  <div class="gear" title="设置" @click="showSettings()">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  </div>
</header>
</template>
