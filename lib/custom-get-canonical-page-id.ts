import { type ExtendedRecordMap } from 'notion-types'
import { getBlockTitle,getPageProperty, uuidToId  } from 'notion-utils'


/**
 * Gets the canonical, display-friendly version of a page's ID for use in URLs.
 */
export const getCanonicalPageId  = (
  pageId: string,
  recordMap: ExtendedRecordMap
): string | null => {
  if (!pageId || !recordMap) return null

  const id = uuidToId(pageId)
  const block = recordMap.block[pageId]?.value

  if (block) {
    const enTitle = normalizeTitle(getPageProperty("enTitle", block, recordMap))
    const rawTitle = getBlockTitle(block, recordMap)
    const title = normalizeTitle(rawTitle)
    // const isContainEn = /[A-Za-z]/.test(rawTitle)

    // if (!isContainEn){

    /* if enTitle is exist and not empty, use enTitle Property */
    if (enTitle && enTitle.toString().trim()!=='') {
        return `${enTitle}-${id}`
    }else {   /* if enTitle is not exist or empty, */
      if (!title) return id //if title is not exist, return id
      return `${title}-${id}`//if title is exist, return title-id
    } 
  }
  return id
}

export const normalizeTitle = (title: string | null): string => {

  return (title || '')
  .replaceAll(' ', '-')
  .replaceAll(/[^\dA-Za-z\u4E00-\u9FA5-]/g, '')
  .replaceAll('--', '-')
  .replace(/-$/, '')
  .replace(/^-/, '')
  .replace(/&/, '-')
  .replace(/\(\[/,'-')
  .replace(/^\(^\[/,'')
  .replace(/\)]/,'-')
  .replace(/\)$]$/,'')
  .replace(/\?/,'')
  .replace(/[|ㄱ-ㅣ가-힣]/,'')
  .trim()
  .toLowerCase()
  
}


