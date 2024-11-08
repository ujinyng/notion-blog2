import { type ExtendedRecordMap } from 'notion-types'
import { getPageProperty, uuidToId } from 'notion-utils'
import { getBlockTitle } from 'notion-utils'


/**
 * Gets the canonical, display-friendly version of a page's ID for use in URLs.
 */
export const getCanonicalPageId  = (
  pageId: string,
  recordMap: ExtendedRecordMap,
  { uuid = true }: { uuid?: boolean } = {}
): string | null => {
  if (!pageId || !recordMap) return null

  const id = uuidToId(pageId)
  const block = recordMap.block[pageId]?.value

  if (block) {
    const enTitle = normalizeTitle(getPageProperty("enTitle", block, recordMap))
    const rawTitle = getBlockTitle(block, recordMap)
    const title = normalizeTitle(rawTitle)
    const isContainEn = /[A-Za-z]/.test(rawTitle)

    // if (!isContainEn){

    /* if enTitle is exist, use enTitle Property */
    if (enTitle.toString()!=='') {
        return enTitle
    }else {
      if (uuid) {
        return `${title}-${id}`
      } else {
        return title
      } 
    }
  }
  return id
}

export const normalizeTitle = (title: string | null): string => {

  return (title || '')
  .replace(/ /g, '-')
  .replace(/[^a-zA-Z0-9-\u4e00-\u9fa5]/g, '')
  .replace(/--/g, '-')
  .replace(/-$/, '')
  .replace(/^-/, '')
  .replace(/\&/, '-')
  .replace(/\(\[/,'-')
  .replace(/^\(^\[/,'')
  .replace(/\)\]/,'-')
  .replace(/\)$\]$/,'')
  .replace(/\?/,'')
  .replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/,'')
  .trim()
  .toLowerCase()
  
}
// function result(result: any) {
//   throw new Error('Function not implemented.')
// }

