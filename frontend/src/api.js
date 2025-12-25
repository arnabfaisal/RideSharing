export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

async function request(path, { method = 'GET', body, auth = false } = {}){
  const url = API_BASE + path
  const headers = { 'Content-Type': 'application/json' }
  if (auth){
    const token = localStorage.getItem('rs_token')
    if (!token) throw new Error('Not authenticated')
    headers['Authorization'] = 'Bearer ' + token
  }
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let json
  try{ json = await res.json() }catch(e){ throw new Error('Invalid JSON response') }
  if (!res.ok) throw new Error(json && json.message ? json.message : `HTTP ${res.status}`)
  return json
}

export const get = (path, auth) => request(path, { method: 'GET', auth })
export const post = (path, body, auth) => request(path, { method: 'POST', body, auth })
export const put = (path, body, auth) => request(path, { method: 'PUT', body, auth })
export const del = (path, auth) => request(path, { method: 'DELETE', auth })
