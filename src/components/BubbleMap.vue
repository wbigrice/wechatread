<script setup>
import { ref, inject, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { catColor } from '../utils/helpers.js'

const data=inject('data'),canvasRef=ref(null)
let animId=null,W=680,H=440,t=0,orbs=[],hovered=null,mx=0,my=0,PAD=2

function build(){
  const cvs=canvasRef.value;if(!cvs||!data.value)return
  cancelAnimationFrame(animId);t=0

  let cells=[]
  const cats=data.value.overall?.preferCategory||[]
  if(cats.length) cells=cats.map(c=>({name:c.categoryTitle,val:c.readingCount||0}))
  else{const m={};(data.value.shelf?.books||[]).forEach(b=>{const c=b.category||"未分类";m[c]=(m[c]||0)+1});cells=Object.entries(m).map(([n,v])=>({name:n,val:v}))}
  cells=cells.filter(c=>c.val>0).sort((a,b)=>b.val-a.val)
  if(!cells.length)return

  const dpr=window.devicePixelRatio||1
  const rect=cvs.parentElement.getBoundingClientRect()
  W=rect.width;H=Math.max(440,Math.min(520,W*.72))
  cvs.style.width=W+"px";cvs.style.height=H+"px"
  cvs.width=W*dpr;cvs.height=H*dpr
  const ctx=cvs.getContext("2d");ctx.scale(dpr,dpr)
  const cx=W/2,cy=H*.46
  const maxV=cells[0].val,minV=cells[cells.length-1].val
  const maxR=Math.min(W,H)*.2,minR=Math.min(W,H)*.04

  // --- 半径 + 紧凑布局 ---
  const raw=cells.map(c=>({name:c.name,val:c.val,color:catColor(c.name),r:Math.max(minR,Math.sqrt(c.val/maxV)*maxR)}))
  const placed=[{...raw[0],x:cx,y:cy}] // 核心居中

  for(let i=1;i<raw.length;i++){
    const orb=raw[i]
    // 目标距离：紧贴已放置球体的边缘
    let targetDist=placed[0].r+orb.r+PAD
    // 对于更小的球，稍微推远一点让它们有空间
    if(i>4) targetDist+=Math.min(W,H)*.06*(i-4)/raw.length
    if(i>8) targetDist+=Math.min(W,H)*.08

    let bx=0,by=0,ok=false
    for(let a=0;a<360&&!ok;a++){
      const ang=(a*2.3999+Math.random()*.4)
      const tx=cx+Math.cos(ang)*targetDist,ty=cy+Math.sin(ang)*targetDist*.65
      let collide=false
      for(const p of placed){
        const dx=tx-p.x,dy=ty-p.y
        if(Math.sqrt(dx*dx+dy*dy)<orb.r+p.r+PAD){collide=true;break}
      }
      if(!collide&&tx-orb.r>4&&tx+orb.r<W-4&&ty-orb.r>4&&ty+orb.r<H-30-4){bx=tx;by=ty;ok=true}
    }
    if(!ok){
      // fallback: 逐步外推直到找到无碰撞位置
      for(let d=targetDist+4;d<Math.min(W,H)*.48;d+=3){
        for(let a=0;a<16;a++){
          const ang=a*Math.PI/8+Math.random()*.3
          const tx=cx+Math.cos(ang)*d,ty=cy+Math.sin(ang)*d*.65
          let collide=false
          for(const p of placed){
            if(Math.sqrt((tx-p.x)**2+(ty-p.y)**2)<orb.r+p.r+PAD){collide=true;break}
          }
          if(!collide&&tx-orb.r>4&&tx+orb.r<W-4&&ty-orb.r>4&&ty+orb.r<H-30-4){bx=tx;by=ty;ok=true;break}
        }
        if(ok)break
      }
    }
    if(!ok){bx=cx+(Math.random()-.5)*W*.5;by=cy+(Math.random()-.5)*H*.4}
    placed.push({...orb,x:bx,y:by})
  }

  // 轻度迭代推离 + 向心收缩
  for(let iter=0;iter<15;iter++){
    for(let i=0;i<placed.length;i++){
      for(let j=i+1;j<placed.length;j++){
        const a=placed[i],b=placed[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy),minD=a.r+b.r+PAD
        if(dist<minD&&dist>.01){const nx=dx/dist,ny=dy/dist,ov=minD-dist,tr=a.r+b.r;a.x-=nx*ov*(b.r/tr);a.y-=ny*ov*(b.r/tr);b.x+=nx*ov*(a.r/tr);b.y+=ny*ov*(a.r/tr)}
      }
    }
    // 向心引力：非核心球拉向中心
    for(let i=1;i<placed.length;i++){
      const o=placed[i],dx=cx-o.x,dy=cy-o.y,dist=Math.sqrt(dx*dx+dy*dy)
      if(dist>placed[0].r+o.r+PAD){
        const strength=.03 // 弱引力
        o.x+=dx*strength;o.y+=dy*strength
      }
    }
    // 核心锚定
    placed[0].x=cx;placed[0].y=cy
    // 边界
    placed.forEach(o=>{o.x=Math.max(o.r+4,Math.min(W-o.r-4,o.x));o.y=Math.max(o.r+4,Math.min(H-o.r-30,o.y))})
  }

  orbs=placed.map(o=>({...o,ox:o.x,oy:o.y,phase:Math.random()*Math.PI*2,speed:.7+Math.random()*.5}))

  // --- 绘制 ---
  function drawOrb(o,t){
    const fy=o.y+Math.sin(t*.012*o.speed+o.phase)*3
    const x=o.x,y=fy,r=o.r

    // 微弱椭圆落地阴影
    ctx.save()
    const sg=ctx.createRadialGradient(x,y+r*.88,r*.05,x,y+r*.94,r*.55)
    sg.addColorStop(0,'rgba(60,50,40,.05)');sg.addColorStop(1,'rgba(60,50,40,0)')
    ctx.beginPath();ctx.ellipse(x,y+r+1,r*.48,r*.06,0,0,Math.PI*2)
    ctx.fillStyle=sg;ctx.fill();ctx.restore()

    // === 扁平风格球体（保留微立体） ===
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2)
    const g=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r)
    g.addColorStop(0,o.color)
    g.addColorStop(.7,o.color)
    g.addColorStop(1,darken(o.color,.92))
    ctx.fillStyle=g
    ctx.shadowColor='rgba(0,0,0,.08)';ctx.shadowBlur=6;ctx.shadowOffsetY=2
    ctx.fill()
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0
    ctx.restore()

    // 文字 — 纤细优雅
    ctx.save()
    const fs=Math.max(10,r*.17)
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle'
    ctx.font=`400 ${fs}px "Nunito Sans","PingFang SC",sans-serif`
    ctx.shadowColor='rgba(0,0,0,.2)';ctx.shadowBlur=1;ctx.shadowOffsetY=1
    ctx.fillText(o.name,x,y-fs*.15)
    ctx.font=`400 ${Math.max(9,fs*.68)}px "Nunito Sans","PingFang SC",sans-serif`
    ctx.fillText(o.val+'本',x,y+fs*.5)
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0
    ctx.restore()
  }

  function darken(h,f){const n=parseInt(h.slice(1),16);return`rgb(${Math.floor(((n>>16)&255)*f)},${Math.floor(((n>>8)&255)*f)},${Math.floor((n&255)*f)})`}
  function lighten(h,f){const n=parseInt(h.slice(1),16);const r=Math.floor(((n>>16)&255)+(255-((n>>16)&255))*f),g=Math.floor(((n>>8)&255)+(255-((n>>8)&255))*f),b=Math.floor((n&255)+(255-(n&255))*f);return`rgb(${r},${g},${b})`}

  cvs.onmousemove=e=>{
    const r=cvs.getBoundingClientRect()
    mx=(e.clientX-r.left)*(W/r.width);my=(e.clientY-r.top)*(H/r.height)
    hovered=null
    for(let i=orbs.length-1;i>=0;i--){
      const o=orbs[i],fy=o.y+Math.sin(t*.012*o.speed+o.phase)*3
      if(Math.sqrt((mx-o.x)**2+(my-fy)**2)<o.r+4){hovered=o;break}
    }
    cvs.style.cursor=hovered?'pointer':'default'
  }

  function animate(){
    ctx.clearRect(0,0,W,H);t++
    const sorted=[...orbs].sort((a,b)=>b.r-a.r);sorted.forEach(o=>drawOrb(o,t))
    if(hovered){
      const o=hovered,fy=o.y+Math.sin(t*.012*o.speed+o.phase)*3
      ctx.save();ctx.beginPath();ctx.arc(o.x,fy,o.r+1.5,0,Math.PI*2)
      ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.5;ctx.stroke();ctx.restore()
      const txt=`${o.name} · ${o.val}本`
      ctx.save();ctx.font='12px "Nunito Sans","PingFang SC",sans-serif';const tw=ctx.measureText(txt).width
      const tx=o.x,ty=fy-o.r-14
      ctx.fillStyle='rgba(40,35,30,.8)';ctx.beginPath()
      ctx.roundRect(tx-tw/2-8,ty-12,tw+16,22,6);ctx.fill()
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(txt,tx,ty);ctx.restore()
    }
    animId=requestAnimationFrame(animate)
  }
  animate()
}

let rt
window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,300)})
onMounted(()=>nextTick(build))
watch(()=>data.value,()=>nextTick(build))
onBeforeUnmount(()=>{cancelAnimationFrame(animId);clearTimeout(rt)})
</script>

<template>
<div class="panel">
  <h2>阅读内容地图</h2>
  <div class="sub">悬浮球体聚类图 · 莫兰迪色系</div>
  <canvas ref="canvasRef" id="bubbleMap" style="display:block"></canvas>
</div>
</template>
