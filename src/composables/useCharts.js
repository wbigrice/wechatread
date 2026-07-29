import * as echarts from 'echarts'
import { ref, onBeforeUnmount } from 'vue'

const charts={}
export function _getChart(id){if(!charts[id]){const d=document.getElementById(id);if(!d)return null;charts[id]=echarts.init(d)}return charts[id]}
export function _disposeChart(id){if(charts[id]){charts[id].dispose();delete charts[id]}}
window.addEventListener("resize",()=>{Object.values(charts).forEach(c=>{try{c.resize()}catch(e){}})})

export function useCharts(){
  onBeforeUnmount(()=>{Object.keys(charts).forEach(k=>_disposeChart(k))})
  return {_getChart, _disposeChart}
}
