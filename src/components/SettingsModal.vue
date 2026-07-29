<script setup>
import { ref, inject } from 'vue'
const apiKey=inject('apiKey')
const generate=inject('generate')
const visible=ref(false)
const keyInput=ref(apiKey.value)
const remember=ref(true)
function open(){keyInput.value=apiKey.value;visible.value=true}
function cancel(){visible.value=false}
async function save(){
  const k=keyInput.value.trim()
  if(remember.value) localStorage.setItem("weread_api_key",k);else localStorage.removeItem("weread_api_key")
  apiKey.value=k;visible.value=false
  await generate()
}
defineExpose({open})
</script>

<template>
<div class="mask" v-if="visible" @click.self="cancel">
  <div class="box">
    <h3>设置</h3>
    <label>API Key（wrk-xxxx，从 weread.qq.com/r/weread-skills 获取）</label>
    <input type="password" v-model="keyInput" placeholder="粘贴 WEREAD_API_KEY" />
    <div class="row"><label><input type="checkbox" v-model="remember" /> 记住 Key（保存在本机浏览器）</label></div>
    <div class="acts">
      <button class="btn plain" @click="cancel">取消</button>
      <button class="btn primary" @click="save">保存并生成</button>
    </div>
  </div>
</div>
</template>
