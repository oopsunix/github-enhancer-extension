(function () {
  'use strict'

  var ENABLED = globalThis.GE_DEFAULTS.tf_enabled
  var PATTERN = globalThis.GE_DEFAULTS.tf_pattern
  var observer = null
  var rafId = null

  function pad(n) { return String(n).padStart(2, '0') }

  function formatTime(datetimeStr, fmt) {
    try {
      var d = new Date(datetimeStr)
      if (isNaN(d.getTime())) return datetimeStr
      var map = {
        YYYY: d.getFullYear(),
        YY: String(d.getFullYear()).slice(-2),
        MM: pad(d.getMonth() + 1),
        DD: pad(d.getDate()),
        HH: pad(d.getHours()),
        mm: pad(d.getMinutes()),
        ss: pad(d.getSeconds())
      }
      return fmt.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, function (m) { return map[m] })
    } catch (e) { return datetimeStr }
  }

  function process(el) {
    var dt = el.getAttribute('datetime')
    var fmt = el.getAttribute('format')
    if (!dt) return
    if (fmt === 'duration' || fmt === 'elapsed') return
    var formatted = formatTime(dt, PATTERN)
    var tooltip = formatTime(dt, 'YYYY-MM-DD HH:mm:ss')
    el.setAttribute('title', tooltip)
    el.removeAttribute('prefix')
    el.setAttribute('format', 'manual')
    if (el.shadowRoot) {
      if (el.shadowRoot.textContent !== formatted) {
        el.shadowRoot.textContent = formatted
      }
    } else {
      if (el.textContent !== formatted) {
        el.textContent = formatted
      }
    }
  }

  function formatAll() {
    var els = document.querySelectorAll('relative-time')
    for (var i = 0; i < els.length; i++) {
      process(els[i])
    }
  }

  function scheduleFormat() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(function () {
      rafId = null
      formatAll()
    })
  }

  function startObserver() {
    if (observer) observer.disconnect()
    observer = new MutationObserver(function () {
      scheduleFormat()
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['datetime']
    })
  }

  function onPageChange() {
    scheduleFormat()
  }

  function init() {
    chrome.storage.sync.get(['tf_enabled', 'tf_pattern'], function (r) {
      if (r.tf_enabled !== undefined) ENABLED = r.tf_enabled
      if (r.tf_pattern !== undefined) PATTERN = r.tf_pattern
      if (ENABLED) start()
    })

    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'sync') return
      if (changes.tf_pattern) {
        PATTERN = changes.tf_pattern.newValue
        if (ENABLED) scheduleFormat()
      }
      if (changes.tf_enabled) {
        ENABLED = changes.tf_enabled.newValue
        if (ENABLED) start()
        else stop()
      }
    })
  }

  var started = false

  function start() {
    if (started) return
    started = true
    formatAll()
    startObserver()
    document.addEventListener('turbo:render', onPageChange)
    document.addEventListener('turbo:load', onPageChange)
    window.addEventListener('popstate', onPageChange)
    document.addEventListener('visibilitychange', onVisible)
  }

  function stop() {
    if (!started) return
    started = false
    if (observer) { observer.disconnect(); observer = null }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    document.removeEventListener('turbo:render', onPageChange)
    document.removeEventListener('turbo:load', onPageChange)
    window.removeEventListener('popstate', onPageChange)
    document.removeEventListener('visibilitychange', onVisible)
  }

  function onVisible() {
    if (!document.hidden) scheduleFormat()
  }

  init()
})()
