function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return bytes + ' B'
}

function formatTime(datetimeStr, pattern) {
  const date = new Date(datetimeStr)
  if (isNaN(date.getTime())) return datetimeStr

  const pad = (n) => String(n).padStart(2, '0')

  const map = {
    'YYYY': date.getFullYear(),
    'YY': String(date.getFullYear()).slice(-2),
    'MM': pad(date.getMonth() + 1),
    'DD': pad(date.getDate()),
    'HH': pad(date.getHours()),
    'mm': pad(date.getMinutes()),
    'ss': pad(date.getSeconds())
  }

  return pattern.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, (match) => map[match])
}

function $(selector, el) {
  return (el || document).querySelector(selector)
}

function $$(selector, el) {
  return Array.from((el || document).querySelectorAll(selector))
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve) => {
    const el = $(selector)
    if (el) return resolve(el)
    const observer = new MutationObserver(() => {
      const el = $(selector)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect()
        resolve(null)
      }, timeout)
    }
  })
}

function observeDom(parent, callback, options = { childList: true, subtree: true }) {
  const observer = new MutationObserver(callback)
  observer.observe(parent, options)
  return observer
}

function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function getRepoInfo() {
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  if (pathParts.length >= 2) {
    return { owner: pathParts[0], repo: pathParts[1] }
  }
  return null
}

function isRepoPage() {
  return /^\/[^/]+\/[^/]+/.test(window.location.pathname)
}

function isRepoRoot() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  return parts.length === 2
}

export { formatSize, formatTime, $, $$, waitForElement, observeDom, debounce, getRepoInfo, isRepoPage, isRepoRoot }
