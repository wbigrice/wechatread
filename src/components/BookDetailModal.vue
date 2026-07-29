<script setup>
import { ref, inject, computed } from 'vue'
import { fmtDate, esc } from '../utils/helpers.js'

const data = inject('data')
const isDemo = inject('isDemo')
const callWeread = inject('callWeread')
const showErr = inject('showErr')

const visible = ref(false)
const book = ref(null)
const bookInfo = ref(null)
const loading = ref(false)

const DEMO_INTROS = {
  '卡拉马佐夫兄弟': '《卡拉马佐夫兄弟》是陀思妥耶夫斯基创作的最后一部长篇小说，通常也被认为是他一生文学创作的巅峰之作。小说通过一桩弑父案，深刻探讨了信仰、理性、自由意志与道德责任等永恒主题，被誉为世界文学史上最伟大的小说之一。',
  '三体': '《三体》是刘慈欣创作的系列长篇科幻小说，由《三体》《三体II：黑暗森林》《三体III：死神永生》组成。作品讲述了地球人类文明和三体文明的信息交流、生死搏杀及两个文明在宇宙中的兴衰历程，获得第73届雨果奖最佳长篇小说奖。',
  '活着': '《活着》是余华的代表作之一。小说讲述了在大时代背景下，随着内战、三反五反、大跃进、文化大革命等社会变革，徐福贵的人生和家庭不断经受着苦难，到最后所有亲人都先后离他而去，仅剩下年老的他和一头老牛相依为命。',
  '百年孤独': '《百年孤独》是哥伦比亚作家加西亚·马尔克斯的代表作，也是拉丁美洲魔幻现实主义文学的代表作。作品描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰，反映了拉丁美洲一个世纪以来风云变幻的历史。',
  '人类简史': '《人类简史：从动物到上帝》是以色列历史学家尤瓦尔·赫拉利的代表作。全书从十万年前有生命迹象开始讲到21世纪资本、科技交织的人类发展史，将人类历史从石器时代到21世纪的演化做了全方位的梳理。',
  '小王子': '《小王子》是法国作家安托万·德·圣埃克苏佩里创作的著名儿童文学短篇小说。本书以一位飞行员作为故事叙述者，讲述了小王子从自己星球出发前往地球的过程中，所经历的各种历险。',
  '围城': '《围城》是钱锺书所著的长篇小说，是中国现代文学史上一部风格独特的讽刺小说。被誉为"新儒林外史"。小说通过主人公方鸿渐的人生经历，表现了抗战环境下中国知识分子的众生相。',
  '平凡的世界': '《平凡的世界》是路遥创作的一部全景式地表现中国当代城乡社会生活的百万字长篇小说。全书以孙少安和孙少平两兄弟为中心，刻画了社会各阶层众多普通人的形象，展示了普通人在大时代历史进程中所走过的艰难曲折的道路。',
  '红楼梦': '《红楼梦》是清代作家曹雪芹创作的章回体长篇小说，中国古典四大名著之首。小说以贾、史、王、薛四大家族的兴衰为背景，以贾宝玉、林黛玉和薛宝钗的爱情悲剧为主线，被誉为中国封建社会的百科全书。',
  '1984': '《1984》是英国作家乔治·奥威尔创作的政治讽喻小说。小说刻画了一个令人感到窒息和恐怖的、以追逐权力为最终目标的假想的极权主义社会，揭示了极权统治下个人命运的悲剧。',
  '明朝那些事儿': '《明朝那些事儿》是当年明月创作的一部关于明朝历史的通俗读物。全书以史料为基础，以年代和具体人物为主线，对明朝十七帝和其他王公权贵及小人物的命运进行了全景展示。',
  '白夜行': '《白夜行》是日本作家东野圭吾的代表作。小说将无望却坚守的凄凉爱情和执著而缜密的冷静推理完美结合，被众多读者视为东野圭吾作品中的无冕之王。',
  '未来简史': '《未来简史》是尤瓦尔·赫拉利继《人类简史》之后的又一力作。书中探讨了人类在解决了饥荒、瘟疫和战争之后，将面临的新议题：永生、幸福和成为神。',
  '枪炮、病菌与钢铁': '《枪炮、病菌与钢铁》是美国学者贾雷德·戴蒙德创作的社会学著作。本书探讨了为什么不同大陆上的人类社会发展速度存在差异，提出了地理环境决定论的观点。',
  '了不起的盖茨比': '《了不起的盖茨比》是美国作家弗朗西斯·斯科特·菲茨杰拉德创作的中篇小说。小说以20世纪20年代的纽约市及长岛为背景，被视为美国文学"爵士时代"的象征。',
  '局外人': '《局外人》是法国作家阿尔贝·加缪的代表作，也是存在主义文学的代表作品。小说塑造了一个惊世骇俗的"荒谬的人"——对一切都漠然置之的默尔索，深刻揭示了世界的荒诞性。'
}

const displayIntro = computed(() => {
  if (bookInfo.value && bookInfo.value.intro) return bookInfo.value.intro
  if (book.value && DEMO_INTROS[book.value.title]) return DEMO_INTROS[book.value.title]
  return ''
})

const displayCover = computed(() => {
  if (bookInfo.value && bookInfo.value.cover) return bookInfo.value.cover
  if (book.value && book.value.cover) return book.value.cover
  return ''
})

const displayTitle = computed(() => {
  if (bookInfo.value && bookInfo.value.title) return bookInfo.value.title
  return book.value ? book.value.title : ''
})

const displayAuthor = computed(() => {
  if (bookInfo.value && bookInfo.value.author) return bookInfo.value.author
  return book.value ? (book.value.author || '') : ''
})

const bookUrl = computed(() => {
  if (!book.value) return '#'
  if (bookInfo.value && bookInfo.value.deepLink) return bookInfo.value.deepLink
  if (book.value.deepLink) return book.value.deepLink
  if (book.value.bookId) return `https://weread.qq.com/web/reader/${book.value.bookId}`
  return '#'
})

const progressText = computed(() => {
  if (!book.value) return ''
  if (book.value.finishReading === 1) return '已读完'
  const p = book.value.progress || 0
  if (p === 0) return '未开始'
  return `阅读中 ${p}%`
})

const lastReadText = computed(() => {
  if (!book.value || !book.value.readUpdateTime) return ''
  return '最近阅读：' + fmtDate(book.value.readUpdateTime)
})

async function open(b) {
  book.value = b
  bookInfo.value = null
  loading.value = true
  visible.value = true

  if (!b || !b.bookId) {
    loading.value = false
    return
  }

  try {
    const info = await callWeread('/book/info', { bookId: b.bookId })
    if (info) {
      bookInfo.value = {
        title: info.title || '',
        author: info.author || '',
        cover: info.cover || '',
        intro: info.intro || info.description || info.summary || '',
        deepLink: info.deepLink || ''
      }
    }
  } catch (e) {
    // Silently fall back to demo data; no error toast for individual book fetch
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  book.value = null
  bookInfo.value = null
}

defineExpose({ open })
</script>

<template>
  <div v-if="visible" class="mask" @click.self="close">
    <div class="box detail-box">
      <h3 style="margin-top:0;margin-bottom:16px;font-size:17px">{{ esc(displayTitle) }}</h3>

      <div class="detail-layout">
        <div class="detail-cover-wrap">
          <img
            v-if="displayCover"
            :src="displayCover"
            :alt="displayTitle"
            class="detail-cover-img"
          />
          <div v-else class="detail-cover-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1" stroke-linecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 20.5a1.5 1.5 0 0 1 1.5-1.5H20"/></svg>
          </div>
        </div>

        <div class="detail-info">
          <div class="detail-title">{{ esc(displayTitle) }}</div>
          <div v-if="displayAuthor" class="detail-author">{{ esc(displayAuthor) }}</div>

          <div class="detail-badges">
            <span v-if="book && book.category" class="detail-badge detail-badge-cat">{{ esc(book.category) }}</span>
            <span v-if="progressText" class="detail-badge detail-badge-progress">{{ progressText }}</span>
          </div>

          <div v-if="lastReadText" class="detail-last-read">{{ lastReadText }}</div>
        </div>
      </div>

      <div v-if="displayIntro || loading" class="detail-intro">
        <div v-if="loading" class="detail-intro-loading">加载中...</div>
        <template v-else>
          <div class="detail-intro-label">内容简介</div>
          <div class="detail-intro-text">{{ esc(displayIntro) }}</div>
        </template>
      </div>

      <div class="detail-actions">
        <button class="btn plain" @click="close">关闭</button>
        <a
          v-if="bookUrl !== '#'"
          :href="bookUrl"
          target="_blank"
          rel="noopener"
          class="btn primary"
          style="text-decoration:none;display:inline-block"
        >在微信读书打开</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-box {
  width: 440px;
  max-width: 92vw;
}

.detail-layout {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-cover-wrap {
  flex-shrink: 0;
  width: 100px;
  height: 140px;
  border-radius: 6px;
  overflow: hidden;
  background: #f0ede8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e4dc;
}

.detail-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink, #2b2b2b);
  line-height: 1.3;
  word-break: break-all;
}

.detail-author {
  font-size: 13px;
  color: var(--muted, #9b958c);
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detail-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.detail-badge-cat {
  background: #f0ede8;
  color: var(--green, #5a8c7a);
  border: 1px solid #e0dcd4;
}

.detail-badge-progress {
  background: var(--green, #5a8c7a);
  color: #fff;
}

.detail-last-read {
  font-size: 12px;
  color: var(--muted, #9b958c);
}

.detail-intro {
  margin-top: 4px;
  margin-bottom: 16px;
  background: #faf8f4;
  border-radius: 8px;
  padding: 12px;
  max-height: 120px;
  overflow-y: auto;
}

.detail-intro-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted, #9b958c);
  margin-bottom: 6px;
}

.detail-intro-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink, #2b2b2b);
  word-break: break-all;
}

.detail-intro-loading {
  font-size: 13px;
  color: var(--muted, #9b958c);
  text-align: center;
  padding: 20px 0;
}

.detail-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.detail-actions .btn {
  font-size: 13px;
  padding: 8px 18px;
}
</style>
