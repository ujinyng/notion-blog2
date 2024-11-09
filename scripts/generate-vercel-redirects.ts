import fs from 'node:fs'
import path from 'node:path'

import { type ExtendedRecordMap } from 'notion-types'

import { rootNotionPageId } from '../lib/config'
import { notion } from '../lib/notion-api'
import { generateRedirects } from './generate-redirects'

interface VercelConfig {
  redirects?: any[]
}

async function getAllPages(startPageId: string) {
  const pages = new Set<string>()
  const recordMaps: ExtendedRecordMap[] = []
  const queue = [startPageId]
  
  while (queue.length > 0) {
    const pageId = queue.shift()
    if (!pageId || pages.has(pageId)) continue
    
    try {
      const recordMap = await notion.getPage(pageId)
      pages.add(pageId)
      recordMaps.push(recordMap)
      
      // Collect subpage IDs
      for (const block of Object.values(recordMap.block)) {
        if (block.value?.type === 'page' && block.value.id) {
          queue.push(block.value.id)
        }
      }
    } catch (err) {
      console.error(`Error fetching page ${pageId}:`, err)
    }
  }
  
  return recordMaps
}

async function main() {
  try {
    // Get recordMap on all pages
    const allPages = await getAllPages(rootNotionPageId)
    
    // Generate redirects for each page
    const allRedirects = allPages.flatMap(recordMap => 
      generateRedirects(recordMap)
    )
    
    // Remove duplicates
    const uniqueRedirects = Array.from(
      new Map(
        allRedirects.map(redirect => 
          [redirect.source, redirect]
        )
      ).values()
    )
    
    const vercelConfig: VercelConfig = {
      redirects: uniqueRedirects
    }
    
    // Create vercel.json file
    fs.writeFileSync(
      path.join(process.cwd(), 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    )
    
    console.log(`Generated ${uniqueRedirects.length} redirects`)
  } catch (err) {
    console.error('Error generating vercel config:', err)
    throw err
  }
}

await main() 