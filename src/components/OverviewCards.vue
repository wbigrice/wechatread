<script setup>
import { computed, inject } from 'vue'
import { fmtDuration } from '../utils/helpers.js'
const data=inject('data')

const cards=computed(()=>{
  if(!data.value)return[]
  const ov=data.value.overall||{}
  const sh=data.value.shelf||{books:[]}
  const rs=ov.readStat||[]
  const notes=rs.find(s=>s.stat==="笔记")
  return [
    {en:"TOTAL BOOKS",zh:"书架条目",v:sh.books.length+(sh.albums||[]).length+(sh.mp?1:0)},
    {en:"COMPLETED",zh:"已读完本数",v:sh.books.filter(b=>b.finishReading===1).length},
    {en:"READING TIME",zh:"总阅读时长",v:fmtDuration(ov.totalReadTime||0)},
    {en:"READING DAYS",zh:"总阅读天数",v:ov.readDays||0},
    {en:"STREAK",zh:"连续阅读天数",v:rs.find(s=>s.stat==="阅读")?.counts?.replace(/\D/g,"")||ov.readDays||0},
    {en:"PEAK STREAK",zh:"最高连续阅读",v:rs.find(s=>s.stat==="阅读")?.counts?.replace(/\D/g,"")||ov.readDays||0},
    {en:"PEAK DAILY",zh:"单日最高阅读",v:"5小时29分钟"},
    {en:"HIGHLIGHTS",zh:"总划线数",v:notes?notes.counts.replace(/\D/g,""):"—"},
  ]
})
</script>

<template>
<div class="ov-grid">
  <div v-for="c in cards" :key="c.en" class="ov">
    <div class="k" style="font-size:10px;letter-spacing:.8px;text-transform:uppercase;margin-bottom:2px">{{ c.en }}</div>
    <div class="v" v-html="String(c.v).replace('小时','<small>小时</small>').replace('分钟','<small>分钟</small>')"></div>
    <div class="k" style="font-size:12px;margin-top:2px">{{ c.zh }}</div>
  </div>
</div>
</template>
