<script setup>
import { computed, inject } from 'vue'
import { authors, eraOf, esc } from '../utils/helpers.js'

const data=inject('data')

const eras=computed(()=>{
  const books=data.value?.shelf?.books||[]
  const map={}
  books.forEach(b=>{
    const y=b.authorYear!=null?b.authorYear:(b.author&&authors[b.author]!=null?authors[b.author]:null)
    if(y==null)return
    const era=eraOf(y)
    map[era]=map[era]||{}
    const nm=b.author||"佚名"
    map[era][nm]=(map[era][nm]||0)+1
  })
  const order=["1800前","1800-1849","1850-1899","1900-1949","1950-1999","2000后"].filter(e=>map[e])
  return order.map(era=>{
    const arr=Object.entries(map[era]).sort((a,b)=>b[1]-a[1])
    return {era,label:era.replace("1800前","古典"),authors:arr}
  })
})

const axisLabels=["古典","19世纪","20世纪上半","20世纪下半","当代"]
</script>

<template>
<div class="panel">
  <h2>同年代作者时间线</h2>
  <div class="sub">根据书架中已读 / 在读书籍的作者活跃年代聚类</div>
  <div v-if="!eras.length" class="empty">暂无作者数据</div>
  <div v-else class="tl">
    <div class="axis">
      <span v-for="l in axisLabels" :key="l">{{ l }}</span>
    </div>
    <div v-for="e in eras" :key="e.era" class="tl-era" style="animation:fadeInUp .5s ease both">
      <div class="eh">{{ e.label }}</div>
      <div class="pills2">
        <span v-for="[name,cnt] in e.authors" :key="name" class="chip">
          <b>{{ esc(name) }}</b><small>{{ cnt }}本</small>
        </span>
      </div>
    </div>
  </div>
</div>
</template>

<style>
@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.tl-era:nth-child(2){animation-delay:.1s}.tl-era:nth-child(3){animation-delay:.2s}.tl-era:nth-child(4){animation-delay:.3s}.tl-era:nth-child(5){animation-delay:.4s}.tl-era:nth-child(6){animation-delay:.5s}.tl-era:nth-child(7){animation-delay:.6s}
</style>
