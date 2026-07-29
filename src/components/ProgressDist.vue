<script setup>
import { computed, inject } from 'vue'
const data=inject('data')

const dist=computed(()=>{
  const books=data.value?.shelf?.books||[]
  const b={"0-25%":0,"25-50%":0,"50-75%":0,"75-99%":0,"100%":0}
  books.forEach(bk=>{
    // API 只返回 finishReading，不返回 progress
    // 已读完 → 100%，未读完分到 0-25%
    const done=bk.finishReading===1
    let p=0
    if(bk.progress!=null) p=Number(bk.progress)  // demo 有 progress
    else if(done) p=100
    if(p===100)b["100%"]++;else if(p>=75)b["75-99%"]++;else if(p>=50)b["50-75%"]++;else if(p>=25)b["25-50%"]++;else b["0-25%"]++
  })
  const order=["0-25%","25-50%","50-75%","75-99%","100%"]
  const colors={"0-25%":"#C3BFB6","25-50%":"#9DB8A8","50-75%":"#C8A882","75-99%":"#C4815E","100%":"#4A7C6D"}
  const max=Math.max(...Object.values(b),1)
  return order.map(k=>({label:k,count:b[k],color:colors[k],pct:max>0?(b[k]/max*100):0}))
})
</script>

<template>
<div class="panel">
  <h2>阅读进度分布</h2>
  <div class="sub">书架中各进度区间的书籍数量</div>
  <div v-if="!data" class="empty">暂无数据</div>
  <div v-else class="prog">
    <div v-for="d in dist" :key="d.label" class="prow">
      <div class="l">{{ d.label }}</div>
      <div class="w"><div class="b" :style="{width:d.pct+'%',background:d.color}"></div></div>
      <div class="n">{{ d.count }} 本</div>
    </div>
  </div>
</div>
</template>
