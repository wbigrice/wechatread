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
    const [shelf,overall,monthly,userInfo]=await Promise.all([callWeread("/shelf/sync"),callWeread("/readdata/detail",{mode:"overall"}),callWeread("/readdata/detail",{mode:"monthly"}),callWeread("/user/info").catch(()=>({}))])
    const heat={}
    Object.entries(monthly.readTimes||{}).forEach(([ts,sec])=>{const d2=new Date(Number(ts)*1000);heat[`${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,"0")}`]=(heat[`${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,"0")}`]||0)+Number(sec)})
    const rl=monthly.readLongest||[]
    const mb=rl.slice(0,8).map(x=>{const b=x.book||x.albumInfo||{};return{title:b.title||b.name||"",author:b.author||b.authorName||"",time:x.readTime||0,lines:0,ideas:0,cover:b.cover||""}})
    const topEl=rl[0]&&(rl[0].book||rl[0].albumInfo)||{}
    data.value={profile:{avatar:userInfo.avatar||userInfo.avatarUrl||"",name:userInfo.name||userInfo.nickname||userInfo.username||"",registTime:overall.registTime||null},shelf,overall,monthly,heat,monthBooks:mb,topBook:{title:topEl.title||topEl.name||"",author:topEl.author||topEl.authorName||"",time:rl[0]?rl[0].readTime:0,lines:0,ideas:0,cover:topEl.cover||""},doneBooks:(shelf.books||[]).filter(b=>b.finishReading===1).slice(0,5).map(b=>({title:b.title,totalTime:0,lines:0,ideas:0,cover:b.cover||""})),generatedAt:new Date().toISOString().slice(0,10),isDemo:false}
    isDemo.value=false
  }catch(e){errMsg.value="拉取失败："+e.message}
}
provide('generate',generate)
data.value=demoData()
</script>

<template>
<div class="wrap">
  <PageHeader />
  <div v-if="errMsg" class="err">{{ errMsg }}<span style="float:right;cursor:pointer;font-weight:bold;font-size:16px" @click="errMsg=''">×</span></div>
  <nav class="tabs">
    <button :class="{active:activeTab==='wall'}" @click="activeTab='wall'">书架墙</button>
    <button :class="{active:activeTab==='stats'}" @click="activeTab='stats'">阅读统计</button>
  </nav>
  <ShelfWall v-show="activeTab==='wall'" />
  <ReadingStats v-show="activeTab==='stats'" />
  <div class="footer">数据来自微信读书 · 通过 weread-skills 网关获取</div>
</div>
<SettingsModal ref="settingsModalRef" />
<BookDetailModal ref="bookDetailRef" />
</template>
