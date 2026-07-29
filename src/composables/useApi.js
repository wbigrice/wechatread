const SKILL_VERSION="1.0.4"
const GATEWAY="/api"

export function useApi(apiKey){
  async function callWeread(apiName, params={}){
    const body={api_name:apiName, skill_version:SKILL_VERSION, ...params}
    const headers={"Content-Type":"application/json"}
    if(apiKey.value) headers["Authorization"]="Bearer "+apiKey.value
    const res=await fetch(GATEWAY,{method:"POST",headers,body:JSON.stringify(body)})
    const text=await res.text()
    let data
    try{data=JSON.parse(text)}catch(e){throw new Error("服务响应异常："+text.slice(0,200))}
    if(data&&data.upgrade_info) throw new Error("Skill 需升级："+(data.upgrade_info.message||""))
    if(data&&data.errcode&&data.errcode!==0) throw new Error(data.errmsg||"接口错误")
    return data
  }
  async function fetchBookInfo(bookId){
    try{return await callWeread("/book/info",{bookId})}catch(e){return null}
  }
  return {callWeread, fetchBookInfo}
}
