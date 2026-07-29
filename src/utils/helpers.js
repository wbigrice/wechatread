export function fmtDuration(sec){sec=Number(sec)||0;const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);if(h>0)return `${h}小时${m}分钟`;if(m>0)return `${m}分钟`;return `${sec}秒`}
export function fmtDate(ts){if(!ts)return "";const d=new Date(Number(ts)*1000);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
export function fmtYM(ts){const d=new Date(Number(ts)*1000);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
export function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}

export const catColors={"文学":"#4A7C6D","精品小说":"#C4815E","小说":"#C4815E","经济理财":"#7E6B9A","期刊杂志":"#C8956A","未分类":"#6D8CA8","历史":"#7E9A7A","其他":"#B09870","科技":"#5E8C8C","哲学":"#8E7B9E","艺术":"#B87080","心理":"#707EA0","社科":"#70905E"}
// 莫兰迪扩展色板 — 未匹配的分类按 hash 取色，保证任意数据都协调
const morandiPalette=["#4A7C6D","#C4815E","#7E6B9A","#C8956A","#6D8CA8","#7E9A7A","#B09870","#5E8C8C","#8E7B9E","#B87080","#707EA0","#70905E","#9E8576","#6B8E7A","#C4927A","#8B7BA5","#A8956E","#6889A0","#859A78","#9B7688"]
export function catColor(c){if(catColors[c])return catColors[c];let h=0;for(let i=0;i<c.length;i++)h=(h*31+c.charCodeAt(i))%morandiPalette.length;return morandiPalette[h]}

const spinePalette=["#4A7C6D","#6B5A4A","#8B5A5A","#4A5A7A","#6B7060","#9C6A4E","#7F5A4A","#B08A6E","#5A5A7A","#9A8A9A","#C9ADA7","#607040","#3A4A2A","#C49A6E","#B06A4A","#3A6A50","#9A5A5A","#5A5A5A","#4A5A80","#7A5A60"]
export function hashColor(str){let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))%spinePalette.length;return spinePalette[h]}
export function isDark(c){const n=parseInt(c.slice(1),16);return(0.299*((n>>16)&255)+0.587*((n>>8)&255)+0.114*(n&255))<140}

export const authors={"陀思妥耶夫斯基":1821,"沈书枝":1980,"南怀瑾":1918,"尤瓦尔·赫拉利":1976,"欧·亨利":1862,"马尔克斯":1927,"刘慈欣":1963,"余华":1960,"赫拉利":1976,"黄仁宇":1918,"圣埃克苏佩里":1900,"钱锺书":1910,"王小波":1952,"当年明月":1979,"贡布里希":1909,"戴蒙德":1937,"兰小欢":1980,"林语堂":1895,"东野圭吾":1958,"村上春树":1949,"卡勒德":1965,"路遥":1949,"曹雪芹":1715,"菲茨杰拉德":1896,"奥威尔":1903,"加缪":1913,"毛姆":1874,"勒庞":1841,"费孝通":1910,"李泽厚":1930,"本尼迪克特":1887,"茨威格":1881,"钱穆":1895}
export const ERA_KEYS=["古典","1800前","1800-1849","1850-1899","1900-1949","1950-1999","2000后"]
export function eraOf(y){if(!y)return"未知";if(y<1800)return"1800前";if(y<1850)return"1800-1849";if(y<1900)return"1850-1899";if(y<1950)return"1900-1949";if(y<2000)return"1950-1999";return"2000后"}
