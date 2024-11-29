import Head from 'next/head'

import type * as types from '@/lib/types'
import * as config from '@/lib/config'
import { getSocialImageUrl } from '@/lib/get-social-image-url'

// Function to convert UTC to UTC+9
function convertToKST(utcDate) {
  // Convert if utcDate is not a Date object
  if (utcDate === undefined) return ''
  const date = utcDate instanceof Date ? utcDate : new Date(utcDate)

  // Adjust to (UTC+9)
  const kstOffset = 9 * 60 // 9 hours in minutes
  const localTime = new Date(date.getTime() + kstOffset * 60 * 1000)
  return localTime.toISOString().replace('Z', '+09:00')
}
export function PageHead({
  site,
  title,
  description,
  pageId,
  image,
  url,
  createdDate,
  updatedTime,
  isBlogPost
}: types.PageProps & {
  title?: string
  description?: string
  image?: string
  url?: string
  createdDate?: any
  updatedTime?: any
  isBlogPost?: boolean
}) {
  const rssFeedUrl = `${config.host}/feed`

  title = title ?? site?.name
  description = description ?? site?.description

  const socialImageUrl = getSocialImageUrl(pageId) || image

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
      <meta name='language' content={config.language} />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
      />

      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black' />

      <meta
        name='theme-color'
        media='(prefers-color-scheme: light)'
        content='#fefffe'
        key='theme-color-light'
      />
      <meta
        name='theme-color'
        media='(prefers-color-scheme: dark)'
        content='#2d3439'
        key='theme-color-dark'
      />

      <meta name='robots' content='index,follow' />
      <meta property='og:type' content='website' />

      {site && (
        <>
          <meta property='og:site_name' content={site.name} />
          <meta property='twitter:domain' content={site.domain} />
        </>
      )}

      {config.twitter && (
        <meta name='twitter:creator' content={`@${config.twitter}`} />
      )}

      {config.author && (
        <>
          <meta name='author' content={config.author} />
          <meta property='article:author' content={config.author} />
        </>
      )}

      {config.publisher && (
        <>
          <meta name='publisher' content={config.publisher} />
          <meta property='article:publisher' content={config.publisher} />
        </>
      )}

      {description && (
        <>
          <meta name='description' content={description} />
          <meta property='og:description' content={description} />
          <meta name='twitter:description' content={description} />
        </>
      )}

      {socialImageUrl ? (
        <>
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:image' content={socialImageUrl} />
          <meta property='og:image' content={socialImageUrl} />
        </>
      ) : (
        <meta name='twitter:card' content='summary' />
      )}

      {url && (
        <>
          <link rel='canonical' href={url} />
          <meta property='og:url' content={url} />
          <meta property='twitter:url' content={url} />
        </>
      )}

      <link
        rel='alternate'
        type='application/rss+xml'
        href={rssFeedUrl}
        title={site?.name}
      />

      <meta property='og:title' content={title} />
      <meta name='twitter:title' content={title} />
      <title>{title}</title>

      {/* Schema.org Markup */}
      <script type='application/ld+json'>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: config.name,
          url: config.domain,
          description,
          author: {
            '@type': 'Person',
            name: config.author
          },
          publisher: {
            '@type': 'Person',
            name: config.publisher,
            logo: {
              '@type': 'ImageObject',
              url: `${config.domain}/u_square-512x512.png`
            }
          }
        })}
      </script>

      <script type='application/ld+json'>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          image: socialImageUrl,
          url,
          mainEntity: isBlogPost
            ? {
                '@type': 'Article',
                headline: title,
                author: {
                  '@type': 'Person',
                  name: config.author
                },
                datePublished: convertToKST(createdDate),
                dateModified: convertToKST(updatedTime)
              }
            : undefined
        })}
      </script>
    </Head>
  )
}
