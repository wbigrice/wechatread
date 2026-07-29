<script setup>
import { inject, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { catColor } from '../utils/helpers.js'
import { _getChart, _disposeChart } from '../composables/useCharts.js'

const data=inject('data')
let chart=null

function build(){
  if(!data.value)return
  const cats=data.value.overall?.preferCategory||[]
  let cells=cats.map(c=>({name:c.categoryTitle,count:c.readingCount||0}))
  if(!cells.length){
    const m={};(data.value.shelf?.books||[]).forEach(b=>{const c=b.category||"未分类";m[c]=(m[c]||0)+1})
    cells=Object.entries(m).map(([n,c])=>({name:n,count:c}))
  }
  if(!cells.length)return
  cells.sort((a,b)=>b.count-a.count)
  // 图例（用全局CSS类）
  const legend=document.getElementById("treemapLegend")
  if(legend) legend.innerHTML=cells.map(c=>`<div class="legend-item"><div class="legend-dot" style="background:${catColor(c.name)}"></div>${c.name}</div>`).join("")

  chart=_getChart("treemap");if(!chart)return
  chart.resize()
  chart.setOption({
    tooltip:{trigger:"item",formatter:p=>`${p.name}<br/>${p.value} 本`},
    series:[{type:"treemap",roam:false,nodeClick:false,breadcrumb:{show:false},top:0,left:0,right:0,bottom:0,
      label:{show:true,position:"inside",fontSize:14,fontWeight:"bold",color:"#fff",
        formatter:p=>`{name|${p.name}}\n{count|${p.value}本}`,
        rich:{name:{fontSize:14,fontWeight:"bold",lineHeight:22},count:{fontSize:12,fontWeight:"normal",opacity:.9,lineHeight:18}}},
      data:cells.map(c=>({name:c.name,value:c.count,itemStyle:{color:catColor(c.name),borderColor:"#fff",borderWidth:3,borderRadius:6}}))}]
  },true)
}

onMounted(()=>nextTick(build))
watch(()=>data.value,()=>nextTick(build))
onBeforeUnmount(()=>{_disposeChart("treemap")})
</script>

<template>
<div class="panel">
  <h2>分类分布</h2>
  <div class="sub">按书架条目数量统计</div>
  <div class="chart-box" id="treemap"></div>
  <div class="treemap-legend" id="treemapLegend"></div>
</div>
</template>
