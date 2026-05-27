(function () {
  'use strict'

  var ENABLED = true

  var mask, container, imgEl, closeBtn, downloadBtn, prevBtn, nextBtn
  var scale = 1, tx = 0, ty = 0, dragging = false
  var rafId = null, clickTimer = null, images = [], currentIdx = 0

  function createDOM() {
    document.head.insertAdjacentHTML('beforeend', '<style id="ge-ip-styles"></style>')

    document.body.insertAdjacentHTML('beforeend', [
      '<div id="ge-ip-mask">',
        '<div id="ge-ip-container">',
          '<img id="ge-ip-img" alt="预览图片">',
        '</div>',
        '<div id="ge-ip-controls">',
          '<div id="ge-ip-download" title="下载图片"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></div>',
          '<div id="ge-ip-close" title="关闭 (Esc)"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>',
        '</div>',
        '<div id="ge-ip-prev" title="上一张 (←)"><svg viewBox="0 0 24 24"><line x1="15" y1="18" x2="9" y2="12"/><line x1="15" y1="6" x2="9" y2="12"/></svg></div>',
        '<div id="ge-ip-next" title="下一张 (→)"><svg viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="12"/><line x1="9" y1="6" x2="15" y2="12"/></svg></div>',
      '</div>'
    ].join(''))

    mask = document.getElementById('ge-ip-mask')
    container = document.getElementById('ge-ip-container')
    imgEl = document.getElementById('ge-ip-img')
    closeBtn = document.getElementById('ge-ip-close')
    downloadBtn = document.getElementById('ge-ip-download')
    prevBtn = document.getElementById('ge-ip-prev')
    nextBtn = document.getElementById('ge-ip-next')
  }

  function reset() {
    scale = 1; tx = ty = 0
    container.style.transform = 'translate(0px,0px) scale(1)'
    imgEl.classList.remove('loaded')
  }

  function close() {
    document.body.classList.remove('ge-ip-active')
    document.body.style.overflow = ''
    setTimeout(reset, 300)
  }

  function download() {
    var url = imgEl.src
    var name = url.split('/').pop().split('?')[0] || 'github-image.png'
    fetch(url).then(function (r) { return r.blob() }).then(function (blob) {
      var a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = name
      a.click()
      URL.revokeObjectURL(a.href)
    }).catch(function () {
      window.open(url, '_blank')
    })
  }

  function updateNav() {
    prevBtn.classList.toggle('disabled', currentIdx === 0)
    nextBtn.classList.toggle('disabled', currentIdx === images.length - 1)
  }

  function load(idx) {
    if (idx < 0 || idx >= images.length) return
    currentIdx = idx
    var el = images[idx]
    imgEl.src = el.dataset.src || el.src
    reset()
    imgEl.onload = function () { imgEl.classList.add('loaded') }
    updateNav()
  }

  function open(clickedEl) {
    images = Array.from(document.querySelectorAll('.markdown-body img, .comment-body img, .blob-wrapper img, .readme img'))
      .filter(function (el) { return el.src && !el.src.endsWith('.svg') })

    currentIdx = images.indexOf(clickedEl)
    if (currentIdx === -1) currentIdx = 0

    load(currentIdx)
    document.body.classList.add('ge-ip-active')
    document.body.style.overflow = 'hidden'
  }

  function bindEvents() {
    mask.onclick = function (e) { if (e.target === mask) close() }
    closeBtn.onclick = close
    downloadBtn.onclick = download
    prevBtn.onclick = function () { load(currentIdx - 1) }
    nextBtn.onclick = function () { load(currentIdx + 1) }

    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('ge-ip-active')) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') load(currentIdx - 1)
      if (e.key === 'ArrowRight') load(currentIdx + 1)
    })

    container.addEventListener('wheel', function (e) {
      e.preventDefault()
      var rect = container.getBoundingClientRect()
      var ox = e.clientX - rect.left - rect.width / 2
      var oy = e.clientY - rect.top - rect.height / 2
      var delta = e.deltaY < 0 ? 1.15 : 0.85
      var newScale = Math.max(0.3, Math.min(8, scale * delta))
      tx = e.clientX - rect.left - rect.width / 2 - (ox / scale) * newScale
      ty = e.clientY - rect.top - rect.height / 2 - (oy / scale) * newScale
      scale = newScale
      container.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')'
    }, { passive: false })

    container.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return
      e.preventDefault()
      dragging = true
      var startX = e.clientX - tx
      var startY = e.clientY - ty
      container.style.cursor = 'grabbing'

      function move(e) {
        tx = e.clientX - startX
        ty = e.clientY - startY
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(function () {
          container.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')'
        })
      }

      function up() {
        dragging = false
        container.style.cursor = 'move'
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })

    container.ondblclick = reset
  }

  function bindImages() {
    document.querySelectorAll('.markdown-body img, .comment-body img, .blob-wrapper img, .readme img').forEach(function (el) {
      if (el.dataset.ipBound || el.src.endsWith('.svg') || el.closest('[data-lightbox]')) return
      el.dataset.ipBound = '1'
      el.dataset.src = el.currentSrc || el.src
      el.onclick = function (e) {
        e.preventDefault()
        e.stopPropagation()
        if (clickTimer) {
          clearTimeout(clickTimer)
          clickTimer = null
          var link = el.closest('a')
          window.location.href = link ? link.href : el.src
          return
        }
        clickTimer = setTimeout(function () {
          clickTimer = null
          open(el)
        }, 300)
      }
    })
  }

  function init() {
    createDOM()
    bindEvents()
    bindImages()

    new MutationObserver(bindImages).observe(document.body, { childList: true, subtree: true })

    chrome.storage.sync.get('ip_enabled', function (r) {
      if (r.ip_enabled !== undefined) ENABLED = r.ip_enabled
    })

    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'sync') return
      if (changes.ip_enabled !== undefined) {
        ENABLED = changes.ip_enabled.newValue
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
