(function () {
  'use strict'
  console.log('[GitHub Enhancer] back-to-top loaded')

  var ENABLED = true
  var btn = null

  function make() {
    if (btn) return
    btn = document.createElement('div')
    btn.id = 'ge-btt'
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>'
    btn.title = '返回顶部'
    btn.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }) }
    document.body.appendChild(btn)
  }

  function onScroll() {
    if (!btn) return
    btn.classList.toggle('ge-btt-show', window.scrollY > 300)
  }

  make()
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  try {
    chrome.storage.sync.get(['bt_enabled', 'bt_position'], function (r) {
      if (r.bt_enabled !== undefined) ENABLED = r.bt_enabled
      if (r.bt_position === 'left' && btn) {
        btn.style.right = 'auto'; btn.style.left = '24px'
      }
    })
  } catch (e) {}
})()
