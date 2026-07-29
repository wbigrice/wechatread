import { fmtDate } from '../utils/helpers.js'

export function useDemoData(){
  return function demoData(){
    const cats=[
      {categoryTitle:"文学",readingCount:117},{categoryTitle:"精品小说",readingCount:70},
      {categoryTitle:"经济理财",readingCount:50},{categoryTitle:"期刊杂志",readingCount:43},
      {categoryTitle:"未分类",readingCount:36},{categoryTitle:"历史",readingCount:16},
      {categoryTitle:"其他",readingCount:131}
    ]
    const titles=["卡拉马佐夫兄弟","花与万物间","庄子諵譁","今日未崩溃","用英文讲好中国故事","未来简史","小说稗卯","欧·亨利短篇小说","百年孤独","三体","活着","人类简史","万历十五年","小王子","围城","沉默的大多数","明朝那些事儿","艺术的故事","枪炮、病菌与钢铁","置身事内","苏东坡传","白夜行","挪威的森林","解忧杂货店","追风筝的人","平凡的世界","红楼梦","了不起的盖茨比","1984","动物农场","局外人","月亮与六便士","霍乱时期的爱情","乌合之众","乡土中国","美的历程","菊与刀","人类群星闪耀时","国史大纲"]
    const auths=["陀思妥耶夫斯基","沈书枝","南怀瑾","佚名","作者A","尤瓦尔·赫拉利","作者C","欧·亨利","马尔克斯","刘慈欣","余华","赫拉利","黄仁宇","圣埃克苏佩里","钱锺书","王小波","当年明月","贡布里希","戴蒙德","兰小欢","林语堂","东野圭吾","村上春树","东野圭吾","卡勒德","路遥","曹雪芹","菲茨杰拉德","奥威尔","奥威尔","加缪","毛姆","马尔克斯","勒庞","费孝通","李泽厚","本尼迪克特","茨威格","钱穆"]
    const books=[]
    for(let i=0;i<473;i++){
      const t=titles[i%titles.length], a=auths[i%auths.length], cat=cats[i%cats.length].categoryTitle
      const r=Math.random(), done=r<0.32?1:0, prog=done?100:Math.floor(r*100)
      books.push({bookId:String(i),title:t,author:a,category:cat,cover:"",finishReading:done,progress:prog,
        readUpdateTime:Math.floor(Date.now()/1000-i*86400*Math.ceil(Math.random()*3)),
        deepLink:"",isTop:i<3?1:0,secret:0})
    }
    const heat={}
    for(let y=2024;y<=2026;y++)for(let m=1;m<=12;m++)heat[`${y}-${String(m).padStart(2,"0")}`]=Math.floor(Math.random()*(y===2025?1400:500))
    const mb=[
      {title:"卡拉马佐夫兄弟",author:"陀思妥耶夫斯基",time:47820,lines:142,ideas:21,cover:""},
      {title:"花与万物间",author:"沈书枝",time:19920,lines:46,ideas:14,cover:""},
      {title:"庄子諵譁",author:"南怀瑾",time:7380,lines:15,ideas:0,cover:""},
      {title:"今日未崩溃",author:"佚名",time:4320,lines:0,ideas:0,cover:""},
      {title:"未来简史",author:"赫拉利",time:3120,lines:3,ideas:1,cover:""},
      {title:"小说稗卯",author:"作者C",time:1200,lines:20,ideas:0,cover:""},
      {title:"欧·亨利短篇小说",author:"欧·亨利",time:480,lines:0,ideas:0,cover:""},
      {title:"围城",author:"钱锺书",time:910,lines:5,ideas:2,cover:""}
    ]
    return {
      profile:{avatar:"",name:"微信读书用户",registTime:null},
      shelf:{books,albums:[],mp:null,bookCount:books.length},
      overall:{totalReadTime:3144420,readDays:1053,readStat:[
        {stat:"读过",counts:"473本"},{stat:"读完",counts:"150本"},{stat:"阅读",counts:"1053天"},{stat:"笔记",counts:"7251条"}],
        preferCategory:cats,readLongest:mb.map(b=>({book:{title:b.title,author:b.author,cover:b.cover},readTime:b.time}))},
      monthly:{totalReadTime:85620,readDays:21,dayAverageReadTime:4080,compare:0.18,
        readLongest:mb.map(b=>({book:{title:b.title,author:b.author,cover:b.cover},readTime:b.time,lines:b.lines,ideas:b.ideas}))},
      heat, monthBooks:mb, topBook:mb[0], doneBooks:mb.slice(0,2),
      generatedAt:fmtDate(Math.floor(Date.now()/1000)), isDemo:true
    }
  }
}
