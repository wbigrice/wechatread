export function fmtDuration(sec){sec=Number(sec)||0;const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);if(h>0)return `${h}小时${m}分钟`;if(m>0)return `${m}分钟`;return `${sec}秒`}
export function fmtDate(ts){if(!ts)return "";const d=new Date(Number(ts)*1000);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
export function fmtYM(ts){const d=new Date(Number(ts)*1000);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
export function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}

export const catColors={"文学":"#4a8c6f","精品小说":"#e0734a","小说":"#e0734a","经济理财":"#7c5fa8","期刊杂志":"#e89050","未分类":"#4d89b0","历史":"#7da678","其他":"#b89760","科技":"#4d908b","哲学":"#8e6aad","艺术":"#c95a7a","心理":"#667dab","社科":"#71994e"}
export function catColor(c){return catColors[c]||"#b0a89a"}

const spinePalette=["#5a8c7a","#6b4c3d","#8b3a3a","#3d5a80","#6b705c","#9c6644","#7f5539","#b08968","#4a4e69","#9a8c98","#c9ada7","#606c38","#283618","#dda15e","#bc6c25","#386641","#a44a3f","#50514f","#3d5a80","#7d4f50"]
export function hashColor(str){let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))%spinePalette.length;return spinePalette[h]}
export function isDark(c){const n=parseInt(c.slice(1),16);return(0.299*((n>>16)&255)+0.587*((n>>8)&255)+0.114*(n&255))<140}

export const authors={"陀思妥耶夫斯基":1821,"沈书枝":1980,"南怀瑾":1918,"尤瓦尔·赫拉利":1976,"欧·亨利":1862,"马尔克斯":1927,"刘慈欣":1963,"余华":1960,"赫拉利":1976,"黄仁宇":1918,"圣埃克苏佩里":1900,"钱锺书":1910,"王小波":1952,"当年明月":1979,"贡布里希":1909,"戴蒙德":1937,"兰小欢":1980,"林语堂":1895,"东野圭吾":1958,"村上春树":1949,"卡勒德":1965,"路遥":1949,"曹雪芹":1715,"菲茨杰拉德":1896,"奥威尔":1903,"加缪":1913,"毛姆":1874,"勒庞":1841,"费孝通":1910,"李泽厚":1930,"本尼迪克特":1887,"茨威格":1881,"钱穆":1895}
export const ERA_KEYS=["古典","1800前","1800-1849","1850-1899","1900-1949","1950-1999","2000后"]
export function eraOf(y){if(!y)return"未知";if(y<1800)return"1800前";if(y<1850)return"1800-1849";if(y<1900)return"1850-1899";if(y<1950)return"1900-1949";if(y<2000)return"1950-1999";return"2000后"}
