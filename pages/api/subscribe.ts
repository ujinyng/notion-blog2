import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success?: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { email, topics = [] } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  try {
    // 1. Add Subscriber to ConvertKit Form
    const formResponse = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email
        })
      }
    )

    if (!formResponse.ok) {
      throw new Error('Failed to add subscriber.')
    }

    // 2. Tag the selected topics
    if (topics.length > 0) {
      const tagsResponse = await fetch(
        `https://api.convertkit.com/v3/tags?api_key=${process.env.CONVERTKIT_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const existingTags = await tagsResponse.json()

      const tagPromises = topics.map(async (topic) => {
        // Check if the tag exists in the list
        let tagId = existingTags.tags?.find(
          (tag: any) => tag.name.toLowerCase() === topic.toLowerCase()
        )?.id

        // If the tag doesn't exist, create a new one
        if (!tagId) {
          const tagResponse = await fetch(
            'https://api.convertkit.com/v3/tags',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                api_key: process.env.CONVERTKIT_API_KEY,
                tag: { name: topic }
              })
            }
          )

          if (!tagResponse.ok) {
            console.error(`Tag creation response:`, await tagResponse.text())
            throw new Error(`Failed to create tag: ${topic}`)
          }

          const newTag = await tagResponse.json()
          tagId = newTag.id || newTag.tag?.id

          if (!tagId) {
            console.error('Tag response:', newTag)
            throw new Error(`Tag ID not found: ${topic}`)
          }
        }

        // Add tag to subscriber
        const tagSubscribeResponse = await fetch(
          `https://api.convertkit.com/v3/tags/${tagId}/subscribe`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: process.env.CONVERTKIT_API_KEY,
              email
            })
          }
        )

        if (!tagSubscribeResponse.ok) {
          throw new Error(`Failed to add tag to subscriber: ${topic}`)
        }
      })

      await Promise.all(tagPromises)
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error processing subscription:', err)
    return res.status(500).json({
      error:
        err instanceof Error
          ? err.message
          : 'An error occurred while processing the subscription'
    })
  }
}
