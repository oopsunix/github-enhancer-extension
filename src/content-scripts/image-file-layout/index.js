(function () {
  'use strict'

  var IMG_EXT = /\.(png|jpg|jpeg|gif|tif|tiff|bmp|svg|webp|ico)$/i
  var MODE = 'list'
  var observer = null
  var previewContainer = null
  var currentRowsHash = null
  var updateTimer = null

  function $(s, c) { return (c || document).querySelector(s) }
  function $$(s, c) { return Array.from((c || document).querySelectorAll(s)) }

  function getRows() {
    return $$('.react-directory-row-name-cell-large-screen')
  }

  function getFileName(cell) {
    var link = $('a.Link--primary', cell)
    if (!link) return null
    return { name: (link.textContent || '').trim(), href: link.href }
  }

  function isDirectoryRow(cell) {
    return !!$('svg.octicon-file-directory-fill, svg.octicon-file-submodule', cell)
  }

  /** 生成当前文件列表行唯一哈希，用于检测目录切换 */
  function getRowsHash() {
    var rows = getRows()
    if (rows.length === 0) return null
    return rows.map(function (r) {
      var link = $('a.Link--primary', r)
      return link ? link.href : ''
    }).join('|')
  }

  /** 检测文件列表中是否有支持的图片文件 */
  function hasSupportedImages() {
    var cells = getRows()
    for (var i = 0; i < cells.length; i++) {
      var info = getFileName(cells[i])
      if (!info) continue
      if (isDirectoryRow(cells[i])) continue
      if (IMG_EXT.test(info.name)) return true
    }
    return false
  }

  function addButtons() {
    if ($('.ge-fl-btns')) return

    var moreBtn = $('button[aria-label="More options"], [data-testid="tree-overflow-menu-anchor"]')
    if (!moreBtn) return
    var target = moreBtn.closest('.d-flex') || moreBtn.parentElement
    if (!target) return

    var d = document.createElement('div')
    d.className = 'ge-fl-btns'
    d.innerHTML = '<button class="ge-fl-btn" data-m="tiled" title="平铺预览"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/><circle cx="5" cy="19" r="1"/></svg></button><button class="ge-fl-btn" data-m="fullw" title="全宽预览"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg></button>'
    if (moreBtn.nextElementSibling) {
      target.insertBefore(d, moreBtn.nextElementSibling)
    } else {
      target.appendChild(d)
    }
    d.onclick = function (e) {
      var b = e.target.closest('.ge-fl-btn')
      if (b) toggleView(b.dataset.m)
    }
  }

  function removeButtons() {
    var btns = $('.ge-fl-btns')
    if (btns) btns.remove()
  }

  function getTable() {
    return $('.Table-module__Box__HZKiQ')
  }

  function toggleView(m) {
    if (m === MODE) { resetView(); return }
    MODE = m
    buildPreviewContainer()
    if (!previewContainer) return

    var table = getTable()
    if (table) table.style.display = 'none'
    previewContainer.style.display = 'flex'
    previewContainer.className = 'ge-fl-pv-container ge-fl-' + m

    $$('.ge-fl-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.m === m) })
    try { chrome.storage.sync.set({ fl_mode: m }) } catch (e) {}
  }

  function resetView() {
    MODE = 'list'
    var table = getTable()
    if (table) table.style.display = ''
    if (previewContainer) {
      previewContainer.style.display = 'none'
    }
    $$('.ge-fl-btn').forEach(function (b) { b.classList.remove('on') })
    try { chrome.storage.sync.set({ fl_mode: 'list' }) } catch (e) {}
  }

  function buildPreviewContainer() {
    if (previewContainer) {
      previewContainer.parentElement.removeChild(previewContainer)
      previewContainer = null
    }
    var table = getTable()
    if (!table) return

    previewContainer = document.createElement('div')
    previewContainer.className = 'ge-fl-pv-container'
    previewContainer.style.display = 'none'

    var cells = getRows()
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i]
      var info = getFileName(cell)
      if (!info) continue
      if (isDirectoryRow(cell)) continue

      var isImg = IMG_EXT.test(info.name)
      var isSvg = info.name.toLowerCase().endsWith('.svg')

      var pv = document.createElement('div')
      pv.className = 'ge-fl-pv'

      if (isImg) {
        pv.innerHTML = '<a href="' + info.href + '" target="_blank" class="ge-fl-a"><span class="ge-fl-n">' + info.name + '</span><img src="' + info.href + '?raw=true" alt="' + info.name + '" loading="lazy"' + (isSvg ? ' class="ge-fl-svg"' : '') + '></a>'
      } else {
        var svg = $('svg', cell)
        if (svg) {
          var clone = svg.cloneNode(true)
          pv.innerHTML = '<span class="ge-fl-other">' + clone.outerHTML + '<span class="ge-fl-n">' + info.name + '</span></span>'
        }
      }

      previewContainer.appendChild(pv)
    }

    table.parentElement.insertBefore(previewContainer, table)
  }

  /** 根据当前文件列表状态，控制按钮显隐和预览模式 */
  function syncView() {
    currentRowsHash = getRowsHash()
    var hasImages = hasSupportedImages()

    if (!hasImages) {
      removeButtons()
      if (MODE !== 'list') resetView()
      return
    }

    addButtons()

    if (MODE !== 'list') {
      buildPreviewContainer()
      if (previewContainer) {
        previewContainer.style.display = 'flex'
        previewContainer.className = 'ge-fl-pv-container ge-fl-' + MODE
      }
      var table = getTable()
      if (table) table.style.display = 'none'
      $$('.ge-fl-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.m === MODE) })
    }
  }

  observer = new MutationObserver(function () {
    if (updateTimer) clearTimeout(updateTimer)
    updateTimer = setTimeout(function () {
      var hash = getRowsHash()
      if (hash && hash !== currentRowsHash) {
        syncView()
      }
    }, 150)
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  try {
    chrome.storage.sync.get(['fl_enabled', 'fl_mode'], function (r) {
      if (r.fl_mode !== undefined) MODE = r.fl_mode
      if (getRows().length > 0) syncView()
    })
  } catch (e) {
    if (getRows().length > 0) syncView()
  }
})()
