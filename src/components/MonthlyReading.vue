<script setup>
import { ref, inject, computed } from 'vue'
import { fmtDuration, esc } from '../utils/helpers.js'

const data=inject('data')
const callWeread=inject('callWeread')
const apiKey=inject('apiKey')
const monthLabel=ref(`${new Date().getFullYear()}年${new Date().getMonth()+1}月`)
const monthBaseTime=ref(0)
const popVisible=ref(false)
const popYear=ref(new Date().getFullYear())
const popRight=ref("0px")
const popTop=ref("0px")

const monthData=computed(()=>data.value?.monthly||{})
const mb=computed(()=>data.value?.monthBooks||[])
const done=computed(()=>data.value?.doneBooks||[])
const top=computed(()=>data.value?.topBook||{})
const summary=computed(()=>{
  const m=monthData.value;const tp=top.value
  return `${monthLabel.value.replace("本月","这个月")}看过 ${mb.value.length} 本，读完 ${done.value.length} 本，累计阅读 ${fmtDuration(m.totalReadTime||0)}，阅读 ${m.readDays||0} 天。`+
    (tp.title?`本月最爱的书是 ${tp.author?esc(tp.author)+"的":""}《${esc(tp.title)}》。`:"")
})

function togglePop(){
  if(popVisible.value){popVisible.value=false;return}
  popYear.value=monthBaseTime.value?new Date(monthBaseTime.value*1000).getFullYear():new Date().getFullYear()
  // 弹窗右侧对齐模块右边缘，下方贴label
  const label=document.getElementById("monthLabelEl")
  const panel=label?.closest('.panel')
  if(label&&panel){
    const r=label.getBoundingClientRect()
    const pr=panel.getBoundingClientRect()
    popTop.value=(r.bottom+6)+"px"
    popRight.value=(window.innerWidth-pr.right)+"px"
  }
  popVisible.value=true
}
function closePop(){popVisible.value=false}
function onScroll(){if(popVisible.value)closePop()}
window.addEventListener("scroll",onScroll)
function shiftYear(d){popYear.value+=d}
function monthGrid(){
  const now=new Date()
  const selM=monthBaseTime.value?new Date(monthBaseTime.value*1000).getMonth()+1:now.getMonth()+1
  const y=popYear.value
  return Array.from({length:12},(_,i)=>({m:i+1,label:(i+1)+"月",sel:y===new Date(monthBaseTime.value?monthBaseTime.value*1000:Date.now()).getFullYear()&&(i+1)===selM}))
}
async function selectMonth(y,m){
  const d=new Date(y,m-1,1)
  monthBaseTime.value=Math.floor(d.getTime()/1000)
  monthLabel.value=`${y}年${m}月`
  closePop()
  if(!apiKey.value)return
  try{
    const monthly=await callWeread("/readdata/detail",{mode:"monthly",baseTime:monthBaseTime.value})
    if(data.value){
      const rl=monthly.readLongest||[]
      data.value.monthly=monthly
      data.value.monthBooks=rl.slice(0,8).map(x=>{const b=x.book||x.albumInfo||{};return{title:b.title||b.name||"",author:b.author||b.authorName||"",time:x.readTime||0,lines:x.lines||0,ideas:x.ideas||0,cover:b.cover||""}})
      data.value.doneBooks=data.value.monthBooks.filter(b=>(b.time||0)>3600).slice(0,5)
      const topEl=rl[0]&&(rl[0].book||rl[0].albumInfo)||{}
      data.value.topBook={title:topEl.title||topEl.name||"",author:topEl.author||topEl.authorName||"",time:rl[0]?rl[0].readTime:0,lines:0,ideas:0,cover:topEl.cover||""}
    }
  }catch(e){}
}
</script>

<template>
<div class="panel" style="overflow:visible">
  <div class="panel-head">
    <h2>月度阅读</h2>
    <div class="month-picker">
      <span id="monthLabelEl" class="month-label" @click.stop="togglePop">{{ monthLabel }}</span>
      <div class="month-popup" :class="{show:popVisible}" :style="{right:popRight,top:popTop}">
        <div class="mp-year">
          <button @click.stop="shiftYear(-1)">◀</button><span>{{ popYear }}</span><button @click.stop="shiftYear(1)">▶</button>
        </div>
        <div class="mp-grid">
          <button v-for="g in monthGrid()" :key="g.m" :class="{sel:g.sel}" @click.stop="selectMonth(popYear,g.m)">{{ g.label }}</button>
        </div>
      </div>
    </div>
  </div>
  <div class="sub" style="margin-bottom:12px">本月阅读统计</div>
  <div class="mdash">
    <div class="ov"><div class="k">本月看过</div><div class="v">{{ mb.length }}</div></div>
    <div class="ov"><div class="k">本月读完</div><div class="v">{{ done.length }}</div></div>
    <div class="ov"><div class="k">总阅读时长</div><div class="v" v-html="fmtDuration(monthData.totalReadTime||0).replace('小时','<small>小时</small>').replace('分钟','<small>分钟</small>')"></div></div>
    <div class="ov"><div class="k">总阅读天数</div><div class="v">{{ monthData.readDays||0 }}</div></div>
  </div>
  <div class="month-grid">
    <div>
      <h3 style="font-size:15px;margin:0 0 10px">本月看过</h3>
      <div class="book-list">
        <div v-for="b in mb" :key="b.title" class="bi">
          <img :src="b.cover||''" @error="$event.target.style.background='#ddd'" />
          <div class="info"><div class="nm">{{ esc(b.title) }}</div>
            <div class="mt"><span v-if="b.author">{{ esc(b.author) }}<br/></span>阅读 {{ fmtDuration(b.time||0) }} · 划线 {{ b.lines||0 }} · 想法 {{ b.ideas||0 }}</div></div>
        </div>
      </div>
    </div>
    <div>
      <div class="side"><h4>本月高频</h4>
        <template v-if="top.title">
          <div style="display:flex;gap:12px;align-items:center">
            <img :src="top.cover||''" style="width:54px;height:76px;border-radius:6px;object-fit:cover;background:#ddd" @error="$event.target.style.background='#ddd'" />
            <div><div style="font-size:15px;font-weight:700">{{ esc(top.title) }}</div>
              <div class="big" style="margin-top:5px">{{ fmtDuration(top.time||0) }}</div>
              <div class="mu">本月阅读时长</div>
              <div class="mu" style="margin-top:4px">划线 {{ top.lines||0 }} · 想法 {{ top.ideas||0 }}</div></div>
          </div>
        </template>
        <span v-else class="mu">—</span>
      </div>
      <div class="side"><h4>本月读完</h4>
        <template v-if="done.length">
          <div v-for="d in done" :key="d.title" class="bi" style="margin-bottom:8px">
            <img :src="d.cover||''" @error="$event.target.style.background='#ddd'" />
            <div class="info"><div class="nm">{{ esc(d.title) }}</div><div class="mt">{{ (d.time||d.totalTime) ? '总时长 '+fmtDuration(d.time||d.totalTime) : '本月未在读' }}</div></div>
          </div>
        </template>
        <span v-else class="mu">本月暂无读完</span>
      </div>
      <div class="summary"><h4>月度小结</h4><p>{{ summary }}</p></div>
    </div>
  </div>
</div>
</template>
