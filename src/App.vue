<script setup>
import { ref, reactive, provide } from 'vue'
import { useApi } from './composables/useApi.js'
import { useDemoData } from './composables/useDemoData.js'
import PageHeader from './components/PageHeader.vue'
import SettingsModal from './components/SettingsModal.vue'
import BookDetailModal from './components/BookDetailModal.vue'
import ShelfWall from './components/ShelfWall.vue'
import ReadingStats from './components/ReadingStats.vue'

const apiKey=ref(localStorage.getItem("weread_api_key")||"")
const errMsg=ref("")
const activeTab=ref("wall")
const data=ref(null)
const isDemo=ref(true)
const demoData=useDemoData()
const {callWeread}=useApi(apiKey)
const shelfState=reactive({filterStatus:"all",filterCat:"all",search:"",sort:"default",catExpanded:false})
const settingsModalRef=ref(null)
const bookDetailRef=ref(null)
function showSettings(){settingsModalRef.value?.open()}
function showBookDetail(book){bookDetailRef.value?.open(book)}
provide('data',data);provide('apiKey',apiKey);provide('isDemo',isDemo);provide('shelfState',shelfState);provide('callWeread',callWeread);provide('showSettings',showSettings);provide('showBookDetail',showBookDetail)
function showErr(m){errMsg.value=m}
provide('showErr',showErr)

async function generate(){
  if(!apiKey.value){data.value=demoData();isDemo.value=true;return}
  try{
    const now=new Date(),thisYear=now.getFullYear()
    const [shelf,overall,monthly,userInfo,y1,y2,y3]=await Promise.all([
      callWeread("/shelf/sync"),
      callWeread("/readdata/detail",{mode:"overall"}),
      callWeread("/readdata/detail",{mode:"monthly"}),
      callWeread("/user/info").catch(()=>({})),
      callWeread("/readdata/detail",{mode:"annually",baseTime:Math.floor(new Date(thisYear,0,1).getTime()/1000)}).catch(()=>({readTimes:{}})),
      callWeread("/readdata/detail",{mode:"annually",baseTime:Math.floor(new Date(thisYear-1,0,1).getTime()/1000)}).catch(()=>({readTimes:{}})),
      callWeread("/readdata/detail",{mode:"annually",baseTime:Math.floor(new Date(thisYear-2,0,1).getTime()/1000)}).catch(()=>({readTimes:{}}))
    ])
    const heat={}
    ;[y1,y2,y3].forEach(y=>{Object.entries(y.readTimes||{}).forEach(([ts,sec])=>{const d=new Date(Number(ts)*1000);heat[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`]=(heat[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`]||0)+Number(sec)})})
    const rl=monthly.readLongest||[]
    const mb=rl.slice(0,8).map(x=>{const b=x.book||x.albumInfo||{};return{title:b.title||b.name||"",author:b.author||b.authorName||"",time:x.readTime||0,lines:0,ideas:0,cover:b.cover||""}})
    const topEl=rl[0]&&(rl[0].book||rl[0].albumInfo)||{}
    // doneBooks: 优先匹配本月readLongest里的时长
    const doneTitles=new Set()
    const doneList=(shelf.books||[]).filter(b=>b.finishReading===1).slice(0,5).map(b=>{
      const rl2=rl.find(x=>{const t=(x.book||x.albumInfo||{}).title;if(!t)return false;if(doneTitles.has(t))return false;doneTitles.add(t);return t===b.title})
      return{title:b.title,author:b.author,time:rl2?rl2.readTime:0,cover:b.cover||""}
    })
    data.value={profile:{avatar:userInfo.avatar||userInfo.avatarUrl||"",name:userInfo.name||userInfo.nickname||userInfo.username||"",registTime:overall.registTime||null},shelf,overall,monthly,heat,monthBooks:mb,topBook:{title:topEl.title||topEl.name||"",author:topEl.author||topEl.authorName||"",time:rl[0]?rl[0].readTime:0,lines:0,ideas:0,cover:topEl.cover||""},doneBooks:doneList,generatedAt:new Date().toISOString().slice(0,10),isDemo:false}
    isDemo.value=false
  }catch(e){errMsg.value="拉取失败："+e.message}
}
provide('generate',generate)
// 初始化：有API Key就自动拉真实数据，否则展示demo
if(apiKey.value){generate()}else{data.value=demoData();isDemo.value=true}
</script>

<template>
<div class="wrap">
  <PageHeader />
  <div v-if="errMsg" class="err">{{ errMsg }}<span style="float:right;cursor:pointer;font-weight:bold;font-size:16px" @click="errMsg=''">×</span></div>
  <nav class="tabs">
    <button :class="{active:activeTab==='wall'}" @click="activeTab='wall'">书架墙</button>
    <button :class="{active:activeTab==='stats'}" @click="activeTab='stats'">阅读统计</button>
  </nav>
  <ShelfWall v-if="activeTab==='wall'" />
  <ReadingStats v-if="activeTab==='stats'" />
  <div class="footer">数据来自微信读书 · 通过 weread-skills 网关获取</div>
</div>
<SettingsModal ref="settingsModalRef" />
<BookDetailModal ref="bookDetailRef" />
</template>
