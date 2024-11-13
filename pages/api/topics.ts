import { getNotionTopics } from '@/lib/topic-utils'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const topics = await getNotionTopics()
      return res.status(200).json({ topics })
    } catch (error) {
      console.error('Error fetching topics:', error)
      return res.status(500).json({ error: 'Failed to fetch topics' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
} 