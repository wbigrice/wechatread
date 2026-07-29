<script setup>
import { inject, computed } from 'vue'
import { fmtDuration } from '../utils/helpers.js'
const data=inject('data')
const hd=computed(()=>data.value?.heat||{})

const info=computed(()=>{
  const grid={};let maxV=1;const ys=new Set()
  Object.entries(hd.value).forEach(([ym,sec])=>{
    const [y,m]=ym.split("-");const v=Number(sec)||0
    if(v>maxV) maxV=v;ys.add(Number(y));grid[`${y}-${Number(m)}`]=v
  })
  return{years:[...ys].sort((a,b)=>a-b),grid,maxV}
})
const months=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
function hc(v){
  if(!v)return"#EBE7E0";const t=v/info.value.maxV
  if(t<.15)return"#D8E5DF";if(t<.35)return"#A8C8B9";if(t<.6)return"#6FA08A";return"#386155"
}
function il(h){const n=parseInt(h.slice(1),16);return((n>>16)&255)*.299+((n>>8)&255)*.587+(n&255)*.114>140}
</script>

<template>
<div class="panel">
  <h2>阅读时间线</h2>
  <div class="sub">按月份聚合的阅读活跃度（深绿=阅读越多）</div>
  <div v-if="!info.years.length" class="empty">暂无数据</div>
  <template v-else>
    <div class="hm-table">
      <div class="hm-hrow"><div class="hm-yh"></div><div v-for="m in months" :key="m" class="hm-mh">{{ m }}</div></div>
      <div v-for="y in info.years" :key="y" class="hm-row">
        <div class="hm-yl">{{ y }}</div>
        <div v-for="m in 12" :key="m" class="hm-cell" :style="{background:hc(info.grid[y+'-'+m]||0)}"
          :title="y+'-'+String(m).padStart(2,'0')+' · '+fmtDuration(info.grid[y+'-'+m]||0)">
          <span :class="{'hm-txt-dark':il(hc(info.grid[y+'-'+m]||0))}">{{ (info.grid[y+'-'+m]||0)>0?Math.round((info.grid[y+'-'+m]||0)/60)+'m':'' }}</span>
        </div>
      </div>
    </div>
    <div class="hm-legend"><span>少</span><i style="background:#EBE7E0"></i><i style="background:#D8E5DF"></i><i style="background:#A8C8B9"></i><i style="background:#6FA08A"></i><i style="background:#386155"></i><span>多</span></div>
  </template>
</div>
</template>
