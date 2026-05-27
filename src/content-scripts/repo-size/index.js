(function () {
  'use strict'

  var ENABLED = true
  var treeCache = null
  var fileObserver = null
  var statsObserver = null
  var observer = null
  var apiToken = ''
  var CACHE_TTL = 30 * 60 * 1000

  function cacheKey(owner, repo, branch) {
    return 'rs_tree_' + owner + '/' + repo + '/' + (branch || 'HEAD')
  }

  async function loadCachedTree(owner, repo, branch) {
    try {
      var key = cacheKey(owner, repo, branch)
      var result = await chrome.storage.local.get(key)
      var entry = result[key]
      if (entry && entry.timestamp && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data
      }
      if (entry) chrome.storage.local.remove(key)
    } catch (e) {}
    return null
  }

  function saveCachedTree(owner, repo, branch, data) {
    try {
      var key = cacheKey(owner, repo, branch)
      chrome.storage.local.set({ [key]: { data: data, timestamp: Date.now() } })
    } catch (e) {}
  }

  function fmt(b) {
    if (b === 0) return '0 B'
    if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB'
    if (b >= 1048576) return (b / 1048576).toFixed(2) + ' MB'
    if (b >= 1024) return (b / 1024).toFixed(2) + ' KB'
    return b + ' B'
  }

  function repoInfo() {
    var p = window.location.pathname.split('/').filter(Boolean)
    if (p.length >= 2) return { owner: p[0], repo: p[1] }
    return null
  }

  function isRepoRoot() {
    var p = window.location.pathname.split('/').filter(Boolean)
    return p.length === 2
  }

  function curBranch() {
    var refEl = document.querySelector('.AppHeader-context-full [data-testid="breadcrumbs"] a:last-child')
    if (refEl) {
      var m = refEl.href.match(/ref=(.+)/)
      if (m) return decodeURIComponent(m[1])
    }
    var btn = document.querySelector('button[aria-label*="Branch" i]')
    if (btn) {
      var spans = btn.querySelectorAll('span, div')
      for (var i = 0; i < spans.length; i++) {
        var txt = (spans[i].textContent || '').trim()
        if (txt && txt.length < 100 && !txt.includes(' ') && !txt.includes('\n')) return txt
      }
    }
    return ''
  }

  function getHeaders() {
    var h = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'GE-Chrome' }
    if (apiToken) h['Authorization'] = 'Bearer ' + apiToken
    return h
  }

  async function getTotalSize(owner, repo) {
    try {
      var r = await fetch('https://api.github.com/repos/' + owner + '/' + repo, {
        headers: getHeaders()
      })
      if (!r.ok) return '?'
      var d = await r.json()
      return fmt(d.size * 1024)
    } catch (e) { return '?' }
  }

  async function getTree(owner, repo, branch) {
    var cached = await loadCachedTree(owner, repo, branch)
    if (cached) return cached
    try {
      var b = branch || 'HEAD'
      var r = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/git/trees/' + encodeURIComponent(b) + '?recursive=1', {
        headers: getHeaders()
      })
      if (!r.ok) return null
      var d = await r.json()
      var m = {}
      if (d.tree) for (var i = 0; i < d.tree.length; i++) {
        if (d.tree[i].type === 'blob' && d.tree[i].size !== undefined) m[d.tree[i].path] = d.tree[i].size
      }
      if (d.truncated) {
        await fillTruncatedSubtrees(m, d.tree, owner, repo)
      }
      saveCachedTree(owner, repo, branch, m)
      return m
    } catch (e) { return null }
  }

  async function fillTruncatedSubtrees(map, tree, owner, repo) {
    var subtreeShas = []
    for (var i = 0; i < tree.length; i++) {
      if (tree[i].type === 'tree') subtreeShas.push(tree[i])
    }
    var batchSize = 5
    for (var s = 0; s < subtreeShas.length; s += batchSize) {
      var batch = subtreeShas.slice(s, s + batchSize)
      var results = await Promise.all(batch.map(function (t) {
        return fetch('https://api.github.com/repos/' + owner + '/' + repo + '/git/trees/' + t.sha + '?recursive=1', {
          headers: getHeaders()
        }).then(function (r) { return r.ok ? r.json() : null })
      }))
      for (var j = 0; j < results.length; j++) {
        var sub = results[j]
        if (!sub || !sub.tree) continue
        for (var k = 0; k < sub.tree.length; k++) {
          if (sub.tree[k].type === 'blob' && sub.tree[k].size !== undefined) {
            map[batch[j].path + '/' + sub.tree[k].path] = sub.tree[k].size
          }
        }
      }
    }
  }

  function getFolderSizeFromTree(prefix) {
    if (!treeCache) return -1
    var total = 0
    var dirPrefix = prefix.endsWith('/') ? prefix : prefix + '/'
    for (var path in treeCache) {
      if (path === prefix || path.startsWith(dirPrefix)) {
        total += treeCache[path]
      }
    }
    return total
  }

  function addFileSizes() {
    if (!ENABLED) return
    var info = repoInfo()
    if (!info) return

    var p = window.location.pathname.split('/').filter(Boolean)
    var idx = p.indexOf('tree')
    var curDir = (idx !== -1 && idx + 1 < p.length) ? p.slice(idx + 1).join('/') : ''

    var cells = document.querySelectorAll('.react-directory-row-name-cell-large-screen')
    if (!cells.length) return false

    var hasWork = false
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].querySelector('.ge-rs-is')) continue
      hasWork = true
      break
    }
    if (!hasWork) return true

    var branch = curBranch()

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i]
      if (cell.querySelector('.ge-rs-is')) continue
      var link = cell.querySelector('a.Link--primary')
      if (!link) continue

      var name = (link.textContent || '').trim()
      if (name === '..') continue

      var isDir = !!cell.querySelector('svg.octicon-file-directory-fill')

      var sp = document.createElement('span')
      sp.className = 'ge-rs-is'
      sp.textContent = '...'
      link.after(sp)

      var fp = curDir ? curDir + '/' + name : name
      resolveSize(fp, sp, info, branch, isDir)
    }
    return true
  }

  async function resolveSize(fp, sp, info, branch, isDir) {
    if (!treeCache) {
      treeCache = await getTree(info.owner, info.repo, branch)
      if (!treeCache) treeCache = {}
    }

    var size = -1
    if (treeCache) {
      if (isDir) {
        size = getFolderSizeFromTree(fp)
      } else {
        size = treeCache[fp]
        if (size === undefined) size = -1
      }
    }

    sp.textContent = size >= 0 ? fmt(size) : '-'
  }

  function findForksBlock() {
    var forks = document.querySelector('a.Link--muted svg.octicon-repo-forked')
    if (forks) return forks.closest('.mt-2')
    return null
  }

  function addTotalSize() {
    if (!ENABLED) return
    var info = repoInfo()
    if (!info) return
    if (document.querySelector('.ge-rs-total')) return true

    var forksBlock = findForksBlock()
    if (!forksBlock) return false

    var h3 = document.createElement('h3')
    h3.className = 'sr-only'
    h3.textContent = 'Repository size'
    h3.setAttribute('data-ge-rs', '')

    var div = document.createElement('div')
    div.className = 'ge-rs-total mt-2'
    div.setAttribute('data-ge-rs', '')
    div.innerHTML =
      '<a class="Link Link--muted" aria-label="Repository size">' +
        '<svg aria-hidden="true" class="octicon mr-2 tmp-mr-2" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">' +
          '<path d="M4.5 11a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M3 10.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>' +
          '<path d="M16 11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V9.51c0-.418.105-.83.305-1.197l2.472-4.531A1.5 1.5 0 0 1 4.094 3h7.812a1.5 1.5 0 0 1 1.317.782l2.472 4.53c.2.368.305.78.305 1.198zM3.655 4.26 1.592 8.043Q1.79 8 2 8h12q.21 0 .408.042L12.345 4.26a.5.5 0 0 0-.439-.26H4.094a.5.5 0 0 0-.44.26zM1 10v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1"/>' +
        '</svg>' +
        '<strong class="ge-rs-total-val">...</strong> ' +
        'size' +
      '</a>'

    var parent = forksBlock.parentNode
    parent.insertBefore(div, forksBlock.nextSibling)
    parent.insertBefore(h3, div)

    getTotalSize(info.owner, info.repo).then(function (s) {
      var valEl = div.querySelector('.ge-rs-total-val')
      if (valEl) valEl.textContent = s
    })
    return true
  }

  function scheduleTotalSize() {
    if (!ENABLED) return
    if (addTotalSize()) return
    var timer = setTimeout(function () {
      addTotalSize()
    }, 800)
    var quickCheck = function () {
      if (findForksBlock()) {
        clearTimeout(timer)
        addTotalSize()
      } else {
        requestAnimationFrame(quickCheck)
      }
    }
    requestAnimationFrame(quickCheck)
  }

  function removeFileSizes() {
    var els = document.querySelectorAll('.ge-rs-is, [data-ge-rs]')
    for (var i = 0; i < els.length; i++) els[i].remove()
  }

  function init() {
    chrome.storage.sync.get(['rs_enabled', 'rs_token'], function (r) {
      if (r.rs_enabled !== undefined) ENABLED = r.rs_enabled
      if (r.rs_token) apiToken = r.rs_token
      if (ENABLED) {
        scheduleTotalSize()
        addFileSizes()
        startObservers()
      }
    })
  }

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'sync') return
    if (changes.rs_token) {
      apiToken = changes.rs_token.newValue || ''
    }
    if (changes.rs_enabled !== undefined) {
      ENABLED = changes.rs_enabled.newValue
      if (ENABLED) {
        treeCache = null
        startObservers()
        scheduleTotalSize()
        addFileSizes()
      } else {
        stopObservers()
        removeFileSizes()
      }
    }
  })

  function scheduleFileSizes() {
    if (!ENABLED) return
    if (addFileSizes()) return
    var timer = setTimeout(function () {
      addFileSizes()
    }, 600)
    var quickCheck = function () {
      if (document.querySelector('.react-directory-row-name-cell-large-screen')) {
        clearTimeout(timer)
        addFileSizes()
      } else {
        requestAnimationFrame(quickCheck)
      }
    }
    requestAnimationFrame(quickCheck)
  }

  function startObservers() {
    stopObservers()
    fileObserver = new MutationObserver(function () {
      if (!ENABLED) return
      var cells = document.querySelectorAll('.react-directory-row-name-cell-large-screen')
      if (!cells.length) return
      for (var i = 0; i < cells.length; i++) {
        if (!cells[i].querySelector('.ge-rs-is')) {
          addFileSizes()
          break
        }
      }
    })
    fileObserver.observe(document.documentElement, { childList: true, subtree: true })
    statsObserver = new MutationObserver(function () {
      if (!ENABLED) return
      if (document.querySelector('.ge-rs-total')) return
      if (findForksBlock()) addTotalSize()
    })
    statsObserver.observe(document.documentElement, { childList: true, subtree: true })
  }

  function stopObservers() {
    if (fileObserver) { fileObserver.disconnect(); fileObserver = null }
    if (statsObserver) { statsObserver.disconnect(); statsObserver = null }
  }

  function onNav() {
    if (!ENABLED) return
    scheduleTotalSize()
    scheduleFileSizes()
  }

  var lastPath = ''
  observer = new MutationObserver(function () {
    var p = window.location.pathname
    if (p !== lastPath) {
      lastPath = p
      onNav()
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  document.addEventListener('turbo:render', onNav)
  window.addEventListener('popstate', onNav)

  init()
})()
