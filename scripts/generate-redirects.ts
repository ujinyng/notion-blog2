import type { ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getPageProperty, uuidToId } from 'notion-utils'

function normalizeTitle(title: string | null): string {
  return (title || '')
    .replaceAll(' ', '-')
    .replaceAll(/[^\dA-Za-z\u4E00-\u9FA5-]/g, '')
    .replaceAll('--', '-')
    .replace(/-$/, '')
    .replace(/^-/, '')
    .replace(/&/, '-')
    .replace(/\(\[/, '-')
    .replace(/^\(^\[/, '')
    .replace(/\)]/, '-')
    .replace(/\)$]$/, '')
    .replace(/\?/, '')
    .replace(/[|ㄱ-ㅣ가-힣]/, '')
    .trim()
    .toLowerCase()
}

export function generateRedirects(recordMap: ExtendedRecordMap) {
  const redirects = new Set()
  const processedIds = new Set()

  function processBlock(blockId: string) {
    if (processedIds.has(blockId)) return
    processedIds.add(blockId)

    const block = recordMap.block[blockId]?.value
    if (!block || block.type !== 'page') return

    const id = uuidToId(blockId)
    const rawTitle = getBlockTitle(block, recordMap)
    const title = normalizeTitle(rawTitle)
    const enTitle = normalizeTitle(getPageProperty('enTitle', block, recordMap))

    // old url patterns
    const oldUrls = []

    // 1. only title
    if (title) {
      oldUrls.push(`/${title}`)
    }

    // 2. only id
    oldUrls.push(`/${id}`)

    // 3. only enTitle
    if (enTitle && enTitle.toString() !== '') {
      oldUrls.push(`/${enTitle}`)
    }

    // new url generation
    let newUrl
    if (enTitle && enTitle.toString() !== '') {
      newUrl = `/${enTitle}-${id}`
    } else if (title) {
      newUrl = `/${title}-${id}`
    } else {
      newUrl = `/${id}`
    }

    // redirect rule generation
    for (const oldUrl of oldUrls) {
      if (oldUrl !== newUrl) {
        redirects.add(
          JSON.stringify({
            source: oldUrl,
            destination: newUrl,
            permanent: true
          })
        )
      }
    }

    // process child blocks
    const content = block.content || []
    for (const childId of content) {
      processBlock(childId)
    }
  }

  // process all blocks
  for (const blockId of Object.keys(recordMap.block)) {
    processBlock(blockId)
  }

  return Array.from(redirects).map((redirect) => JSON.parse(redirect as string))
}

export function generateVercelConfig(redirects: any[]) {
  return {
    redirects
  }
}

// example usage:
/*
import { getDatabase } from '../lib/notion'

async function main() {
  const recordMap = await getDatabase()
  const redirects = generateRedirects(recordMap)
  console.log(JSON.stringify(generateVercelConfig(redirects), null, 2))
}

main()
*/
