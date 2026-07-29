// EdgeOne Pages Function — 代理 /api 到微信读书网关
const GATEWAY = 'https://i.weread.qq.com/api/agent/gateway'

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      }
    })
  }

  try {
    const body = await request.text()
    const headers = { 'Content-Type': 'application/json' }
    const auth = request.headers.get('Authorization')
    if (auth) headers.Authorization = auth

    const up = await fetch(GATEWAY, { method: 'POST', headers, body })
    const text = await up.text()

    return new Response(text, {
      status: up.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (e) {
    return new Response(JSON.stringify({ errcode: -1, errmsg: e.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
