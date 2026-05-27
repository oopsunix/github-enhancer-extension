import { get } from './storage.js'
import { STORAGE_KEYS } from './storage.js'

const API_BASE = 'https://api.github.com'

async function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Enhance-Chrome-Extension'
  }
  const token = await get(STORAGE_KEYS.REPO_SIZE_TOKEN)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function fetchRepoInfo(owner, repo) {
  const headers = await getHeaders()
  const response = await fetch(`${API_BASE}/repos/${owner}/${repo}`, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

async function fetchRepoContents(owner, repo, path = '', ref = '') {
  const headers = await getHeaders()
  let url = `${API_BASE}/repos/${owner}/${repo}/contents/${path}`
  if (ref) {
    url += `?ref=${encodeURIComponent(ref)}`
  }
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

async function fetchRepoTree(owner, repo, branch = 'HEAD') {
  const headers = await getHeaders()
  const repoInfo = await fetchRepoInfo(owner, repo)
  const defaultBranch = repoInfo.default_branch
  const treeUrl = `${API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
  const response = await fetch(treeUrl, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

export { fetchRepoInfo, fetchRepoContents, fetchRepoTree, getHeaders }
