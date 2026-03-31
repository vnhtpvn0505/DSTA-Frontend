const DEV_ACCESS_TOKEN_KEY = 'dev_access_token'

export const isLocalDebugHost = () => {
  if (typeof window === 'undefined') {
    return false
  }

  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

export const getDevAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(DEV_ACCESS_TOKEN_KEY)
}

export const setDevAccessToken = (token: string) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(DEV_ACCESS_TOKEN_KEY, token)
}

export const clearDevAccessToken = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(DEV_ACCESS_TOKEN_KEY)
}
