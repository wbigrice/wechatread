<script setup>
import { ref, inject, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { catColor } from '../utils/helpers.js'

const data = inject('data')

const canvasRef = ref(null)
let animId = null
let bubbles = []
let mouse = { x: -1000, y: -1000 }
let canvasWidth = 0
let canvasHeight = 0

function packSpiral(items, w, h) {
  const cx = w / 2
  const cy = h / 2
  const results = []
  const minR = 28
  const maxR = 70

  items.forEach((item, i) => {
    const total = items.reduce((s, x) => s + (x.readingCount || 0), 0) || 1
    const frac = (item.readingCount || 0) / total
    const r = minR + frac * (maxR - minR)
    const angle = i * 2.4
    const dist = 20 + i * 12
    let x = cx + Math.cos(angle) * dist
    let y = cy + Math.sin(angle) * dist

    x = Math.max(r, Math.min(w - r, x))
    y = Math.max(r, Math.min(h - r, y))

    results.push({
      x, y, r,
      vx: 0, vy: 0,
      homeX: x, homeY: y,
      name: item.categoryTitle || '',
      count: item.readingCount || 0,
      color: catColor(item.categoryTitle)
    })
  })

  return results
}

function createGradient(ctx, bubble) {
  const { x, y, r, color } = bubble
  const grad = ctx.createRadialGradient(
    x - r * 0.2, y - r * 0.2, r * 0.05,
    x, y, r
  )
  grad.addColorStop(0, lightenColor(color, 60))
  grad.addColorStop(0.5, color)
  grad.addColorStop(1, darkenColor(color, 30))
  return grad
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((num >> 16) & 255) + amount)
  const g = Math.min(255, ((num >> 8) & 255) + amount)
  const b = Math.min(255, (num & 255) + amount)
  return `rgb(${r},${g},${b})`
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((num >> 16) & 255) - amount)
  const g = Math.max(0, ((num >> 8) & 255) - amount)
  const b = Math.max(0, (num & 255) - amount)
  return `rgb(${r},${g},${b})`
}

function updatePhysics() {
  const friction = 0.92
  const homeForce = 0.003
  const mouseRepel = 80
  const mouseForce = 0.15
  const damping = 0.5

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i]

    // random perturbation
    b.vx += (Math.random() - 0.5) * 0.6
    b.vy += (Math.random() - 0.5) * 0.6

    // home position return force
    b.vx += (b.homeX - b.x) * homeForce
    b.vy += (b.homeY - b.y) * homeForce

    // mouse repulsion
    const dx = b.x - mouse.x
    const dy = b.y - mouse.y
    const distToMouse = Math.sqrt(dx * dx + dy * dy)
    if (distToMouse < mouseRepel + b.r && distToMouse > 0.01) {
      const force = (mouseRepel + b.r - distToMouse) / (mouseRepel + b.r) * mouseForce
      b.vx += (dx / distToMouse) * force * 8
      b.vy += (dy / distToMouse) * force * 8
    }

    // elastic collisions with other bubbles
    for (let j = i + 1; j < bubbles.length; j++) {
      const other = bubbles[j]
      const dx2 = b.x - other.x
      const dy2 = b.y - other.y
      const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      const minDist = b.r + other.r + 4
      if (dist < minDist && dist > 0.01) {
        const overlap = minDist - dist
        const nx = dx2 / dist
        const ny = dy2 / dist
        const halfOverlap = overlap / 2
        b.x += nx * halfOverlap
        b.y += ny * halfOverlap
        other.x -= nx * halfOverlap
        other.y -= ny * halfOverlap

        const relVx = b.vx - other.vx
        const relVy = b.vy - other.vy
        const relVelAlongNormal = relVx * nx + relVy * ny
        if (relVelAlongNormal > 0) {
          const impulse = relVelAlongNormal * damping
          b.vx -= nx * impulse
          b.vy -= ny * impulse
          other.vx += nx * impulse
          other.vy += ny * impulse
        }
      }
    }

    // boundary bounce
    if (b.x - b.r < 0) { b.x = b.r; b.vx *= -0.5 }
    if (b.x + b.r > canvasWidth) { b.x = canvasWidth - b.r; b.vx *= -0.5 }
    if (b.y - b.r < 0) { b.y = b.r; b.vy *= -0.5 }
    if (b.y + b.r > canvasHeight) { b.y = canvasHeight - b.r; b.vy *= -0.5 }

    // apply friction
    b.vx *= friction
    b.vy *= friction
    b.x += b.vx
    b.y += b.vy
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // draw bubbles
  for (const b of bubbles) {
    ctx.save()

    // shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = createGradient(ctx, b)
    ctx.fill()

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // label
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.max(11, b.r * 0.38)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const name = b.name.length > 4 ? b.name.slice(0, 4) : b.name
    ctx.fillText(name, b.x, b.y - b.r * 0.12)

    ctx.font = `${Math.max(10, b.r * 0.28)}px sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(`${b.count}本`, b.x, b.y + b.r * 0.28)

    ctx.restore()
  }
}

function loop() {
  updatePhysics()
  draw()
  animId = requestAnimationFrame(loop)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return

  const w = parent.clientWidth
  const h = Math.max(340, Math.min(500, w * 0.62))

  const dpr = window.devicePixelRatio || 1
  canvasWidth = w
  canvasHeight = h
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  if (data.value?.overall?.preferCategory) {
    bubbles = packSpiral(data.value.overall.preferCategory, w, h)
  }
}

function onMouseMove(e) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function onMouseLeave() {
  mouse.x = -1000
  mouse.y = -1000
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.touches[0].clientX - rect.left
    mouse.y = e.touches[0].clientY - rect.top
  }
}

function onTouchEnd() {
  mouse.x = -1000
  mouse.y = -1000
}

onMounted(async () => {
  await nextTick()
  resizeCanvas()
  animId = requestAnimationFrame(loop)
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="section-panel">
    <h3 class="section-title">分类气泡图</h3>
    <div v-if="!data.value?.overall?.preferCategory?.length" class="empty-hint">暂无数据</div>
    <div v-else class="bubble-container">
      <canvas
        ref="canvasRef"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      ></canvas>
    </div>
  </div>
</template>

<style scoped>
.section-panel {
  background: #fff;
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}
.section-title {
  margin: 0 0 14px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.empty-hint {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
}
.bubble-container {
  width: 100%;
  position: relative;
}
.bubble-container canvas {
  display: block;
  cursor: pointer;
}
</style>
