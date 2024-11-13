import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { NotionAPI } from 'notion-client'
import { getPageProperty } from 'notion-utils'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const currentDir = dirname(__filename)
const rootDir = dirname(currentDir)

dotenv.config({ path: join(rootDir, '.env.local') })

const notionClient = new NotionAPI()
const CONVERTKIT_API_V4_KEY = process.env.CONVERTKIT_API_V4_KEY
const CATEGORY_DB_ID = 'bcc6dc2fece946c78014c50896f0f4aa'
// CATEGORY_DB_ID and PARENT_ID are different
const ParentID = '0d185e1e-84d0-4cb4-a6e1-27a185ffe7e0'

export async function getNotionTopics() {
  try {
    console.log('\n=== Fetching Topics from Notion ===')
    console.log('Category DB ID:', CATEGORY_DB_ID)

    const dbRecordMap = await notionClient.getPage(CATEGORY_DB_ID)
    const topics = new Set<string>()

    for (const [blockId, block] of Object.entries(dbRecordMap.block)) {
      if (block.value?.type === 'page' && block.value?.parent_id === ParentID) {
      // if (block.value?.type === 'page' && block.value?.parent_id === CATEGORY_DB_ID) {
        console.log('\n=== Processing page ===')
        
        const pageRecordMap = await notionClient.getPage(blockId)
        const pageBlock = pageRecordMap.block[blockId]?.value

        if (pageBlock) {
          const pageTitle = getPageProperty('Name', pageBlock, pageRecordMap) || 'Untitled'
          const topicsProperty = getPageProperty('Topics for newsletter', pageBlock, pageRecordMap)

          console.log(`\nPage "${pageTitle}":`)
          console.log('Topics:', topicsProperty)

          if (Array.isArray(topicsProperty)) {
            topicsProperty.forEach(topic => {
              if (typeof topic === 'string') {
                topics.add(topic)
              }
            })
          }
        }
      }
    }

    const uniqueTopics = Array.from(topics)
    console.log('\n=== Topics Summary ===')
    console.log(`Total unique topics: ${uniqueTopics.length}`)
    console.log('Topics:', uniqueTopics)
    console.log('=== End ===\n')

    return uniqueTopics
  } catch (error) {
    console.error('Error fetching Notion topics:', error)
    throw error
  }
}

export async function authKitv4() {
  try {
    console.log('\n=== Authenticating with Kit ===')
    const response = await fetch('https://api.kit.com/v4/account', {
      method: 'GET',
      headers: {
        'Accept': `application/json`,
        'X-Kit-Api-Key': `${CONVERTKIT_API_V4_KEY}`
      }
    })

    const responseBody = await response.json()
    console.log(`Account Info:`, responseBody)

    if (!response.ok) {
      throw new Error(`Failed to authenticate with Kit: ${responseBody.error}`)
    }

    console.log(`Successfully authenticated with ConvertKit`)
  } catch (error) {
    console.error(`Error authenticating with ConvertKit:`, error)
    throw error
  }
}

export async function createKitTagv4(topic: string) {
  
  const response = await fetch(`https://api.kit.com/v4/tags`, {
    method: `POST`,
    headers: {
      'Content-Type': `application/json`,
      'X-Kit-Api-Key': `${CONVERTKIT_API_V4_KEY}`
    },
    body: JSON.stringify({
      tag: {
        name: topic,
        description: `Posts related to ${topic}`
      }
    })
  })
  
  // 응답 확인을 위한 로깅 추가
  console.log(`Full API URL:`, `https://api.kit.com/v4/tags?api_key=<hidden>`)
  console.log(`Response status:`, response.status)
  const responseBody = await response.text()
  console.log(`Response body:`, responseBody)

  if (!response.ok) {
    throw new Error(`Failed to create tags: ${responseBody}`)
  }

  return response.json()
}

export async function createBulkTagsv4(topics: string[]) {
  try {
    await authKitv4()

    console.log(`\n=== Creating Kit Tags in Bulk ===`)
    
    const requestBody = {
      tags: topics.map(topic => ({
        name: topic,
        description: `Posts related to ${topic}`
      }))
    }
    console.log(`Request body:`, JSON.stringify(requestBody, null, 2))

    const response = await fetch(`https://api.kit.com/v4/tags/bulk`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`,
        'X-Kit-Api-Key': `${CONVERTKIT_API_V4_KEY}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`Response status:`, response.status)
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`Error creating tags:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      })
      throw new Error(`Failed to create tags in bulk: ${responseText}`)
    }

    const data = await response.json()
    console.log(`Created tags:`, data.tags.map(tag => `${tag.name} (ID: ${tag.id})`).join(', '))
    console.log(`Successfully created all tags in bulk`)
    console.log(`=== End ===\n`)
  } catch (error) {
    console.error(`Error creating Kit tags:`, error)
    throw error
  }
}

export async function syncBulkTopicsToKitTagsv4() {
  try {
    console.log('Starting tags sync...')
    const topics = await getNotionTopics()
    await createBulkTagsv4(topics)
    console.log('Tags sync completed successfully')
  } catch (error) {
    console.error('Tags sync failed:', error)
    process.exit(1)
  }
}

export async function syncTopicsToKitTagsv4() {
  try {
    console.log(`=== Creating Kit Tags Sequentially ===`)
    
    const topics = await getNotionTopics()
    console.log(`Fetched topics from Notion:`, topics)

    await authKitv4()
    for (const topic of topics) {
      try {
        const result = await createKitTagv4(topic)
        console.log(`Successfully created tag: ${topic}`)
      } catch (error) {
        console.error(`Failed to create tag ${topic}:`, error)
      }
    }
  } catch (error) {
    console.error(`Failed to fetch topics from Notion:`, error)
    throw error
  }
}

// script for local testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncTopicsToKitTagsv4()
}
