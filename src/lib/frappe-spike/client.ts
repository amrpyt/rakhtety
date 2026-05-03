export const DEFAULT_FRAPPE_CLIENT = 'Test Client One'

export function getFrappeConfig() {
  const baseUrl = process.env.FRAPPE_BASE_URL?.replace(/\/$/, '')
  const username = process.env.FRAPPE_USERNAME
  const password = process.env.FRAPPE_PASSWORD

  if (!baseUrl || !username || !password) {
    throw new Error('FRAPPE_BASE_URL, FRAPPE_USERNAME, and FRAPPE_PASSWORD are required')
  }

  return { baseUrl, username, password }
}

export function extractSessionCookie(setCookie: string | null): string {
  const sid = setCookie?.match(/sid=([^;]+)/)?.[1]
  if (!sid) {
    throw new Error('Frappe login did not return a session cookie')
  }
  return `sid=${sid}`
}

export async function loginToFrappe(): Promise<{ baseUrl: string; cookie: string }> {
  const { baseUrl, username, password } = getFrappeConfig()
  const loginResponse = await fetch(`${baseUrl}/api/method/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ usr: username, pwd: password }),
    cache: 'no-store',
  })

  if (!loginResponse.ok) {
    throw new Error('Frappe login failed')
  }

  return {
    baseUrl,
    cookie: extractSessionCookie(loginResponse.headers.get('set-cookie')),
  }
}

export async function callFrappeMethod<T>(method: string, params: Record<string, string>) {
  const { baseUrl, cookie } = await loginToFrappe()
  const response = await fetch(`${baseUrl}/api/method/${method}`, {
    method: 'POST',
    headers: {
      cookie,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
    cache: 'no-store',
  })
  const payload = (await response.json()) as T

  return { response, payload }
}
