import { IoMailOutline } from '@react-icons/all-files/io5/IoMailOutline'
import cs from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { type PageBlock } from 'notion-types'
import { getBlockTitle, getPageProperty, parsePageId } from 'notion-utils'
import * as React from 'react'
import { useEffect, useState } from 'react'
import BodyClassName from 'react-body-classname'
import {
  type NotionComponents,
  NotionRenderer,
  useNotionContext
} from 'react-notion-x'
import { EmbeddedTweet, TweetNotFound, TweetSkeleton } from 'react-tweet'
import { useSearchParam } from 'react-use'

import type * as types from '@/lib/types'
import * as config from '@/lib/config'
import { mapImageUrl } from '@/lib/map-image-url'
import { getCanonicalPageUrl, mapPageUrl } from '@/lib/map-page-url'
import { searchNotion } from '@/lib/search-notion'
import { useDarkMode } from '@/lib/use-dark-mode'

import { FontLoader } from './FontLoader'
import { Footer } from './Footer'
// import { GitHubShareButton } from './GitHubShareButton'
import { Loading } from './Loading'
import { NotionPageHeader } from './NotionPageHeader'
import { Page404 } from './Page404'
import { PageAside } from './PageAside'
import { PageHead } from './PageHead'
import { PageSocial } from './PageSocial'
//import { SetFontbyProperty } from './SetFontbyProperty'
import styles from './styles.module.css'
import { SubscriptionForm } from './SubscriptionForm'

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const SwitchFont = dynamic(() =>
  import('./SwitchFont').then((m) => m.SwitchFont)
)

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(async (m) => {
    // add / remove any prism syntaxes here
    await Promise.allSettled([
      import('prismjs/components/prism-markup-templating.js'),
      import('prismjs/components/prism-markup.js'),
      import('prismjs/components/prism-bash.js'),
      import('prismjs/components/prism-c.js'),
      import('prismjs/components/prism-cpp.js'),
      import('prismjs/components/prism-csharp.js'),
      import('prismjs/components/prism-docker.js'),
      import('prismjs/components/prism-java.js'),
      import('prismjs/components/prism-js-templates.js'),
      import('prismjs/components/prism-coffeescript.js'),
      import('prismjs/components/prism-diff.js'),
      import('prismjs/components/prism-git.js'),
      import('prismjs/components/prism-go.js'),
      import('prismjs/components/prism-graphql.js'),
      import('prismjs/components/prism-handlebars.js'),
      import('prismjs/components/prism-less.js'),
      import('prismjs/components/prism-makefile.js'),
      import('prismjs/components/prism-markdown.js'),
      import('prismjs/components/prism-objectivec.js'),
      import('prismjs/components/prism-ocaml.js'),
      import('prismjs/components/prism-python.js'),
      import('prismjs/components/prism-reason.js'),
      import('prismjs/components/prism-rust.js'),
      import('prismjs/components/prism-sass.js'),
      import('prismjs/components/prism-scss.js'),
      import('prismjs/components/prism-solidity.js'),
      import('prismjs/components/prism-sql.js'),
      import('prismjs/components/prism-stylus.js'),
      import('prismjs/components/prism-swift.js'),
      import('prismjs/components/prism-wasm.js'),
      import('prismjs/components/prism-yaml.js')
    ])
    return m.Code
  })
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false
  }
)
const Modal = dynamic(
  () =>
    import('react-notion-x/build/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport')
      return m.Modal
    }),
  {
    ssr: false
  }
)

function Tweet({ id }: { id: string }) {
  const { recordMap } = useNotionContext()
  const tweet = (recordMap as types.ExtendedTweetRecordMap)?.tweets?.[id]

  return (
    <React.Suspense fallback={<TweetSkeleton />}>
      {tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />}
    </React.Suspense>
  )
}

// const propertyLastEditedTimeValue = (
//   { block, pageHeader },
//   defaultFn: () => React.ReactNode
// ) => {
//   if (pageHeader && block?.last_edited_time) {
//     return `Last updated ${formatDate(block?.last_edited_time, {
//       month: 'long'
//     })}`
//   }

//   return defaultFn()
// }

// const propertyDateValue = (
//   { data, schema, pageHeader },
//   defaultFn: () => React.ReactNode
// ) => {
//   if (pageHeader && schema?.name?.toLowerCase() === 'published') {
//     const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date

//     if (publishDate) {
//       return `${formatDate(publishDate, {
//         month: 'long'
//       })}`
//     }
//   }

//   return defaultFn()
// }

const propertyTextValue = (
  { schema, pageHeader },
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>
  }

  return defaultFn()
}

export function NotionPage({
  site,
  recordMap,
  error,
  pageId
}: types.PageProps) {
  const router = useRouter()
  const lite = useSearchParam('lite')

  const [showSubscribe, setShowSubscribe] = useState(false)

  useEffect(() => {
    if (window.innerWidth >= 1400) {
      setShowSubscribe(true)
    }
  }, [])

  const components = React.useMemo<Partial<NotionComponents>>(
    () => ({
      nextLegacyImage: Image,
      nextLink: Link,
      Code,
      Collection,
      Equation,
      Pdf,
      Modal,
      Tweet,
      Header: NotionPageHeader,
      // propertyLastEditedTimeValue,
      propertyTextValue
      // propertyDateValue
    }),
    []
  )

  // lite mode is for oembed
  const isLiteMode = lite === 'true'

  const { isDarkMode } = useDarkMode()

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return mapPageUrl(site, recordMap, searchParams)
  }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value

  const font = '' + getPageProperty('Font', block, recordMap)

  const isIndexPage =
    parsePageId(block?.id) === parsePageId(site?.rootNotionPageId)
  // const isBlogPost =
  //   block?.type === 'page' && block?.parent_table === 'collection'

  const footer = React.useMemo(() => <Footer />, [])

  if (router.isFallback) {
    return <Loading />
  }

  if (error || !site || !block) {
    return <Page404 site={site} pageId={pageId} error={error} />
  }

  const title = getBlockTitle(block, recordMap) || site.name

  console.log('notion page', {
    isDev: config.isDev,
    title,
    pageId,
    categoryParentId: block.parent_id,
    rootNotionPageId: site.rootNotionPageId,
    recordMap
  })

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }

  const canonicalPageUrl =
    !config.isDev && getCanonicalPageUrl(site, recordMap)(pageId)

  const socialImage = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
      (block as PageBlock).format?.page_cover ||
      config.defaultPageCover,
    block
  )

  const socialDescription =
    getPageProperty<string>('Description', block, recordMap) ||
    config.description

  const isNotMain =
    block?.type === 'page' && block.parent_table === 'collection'
  const isPostList =
    isNotMain &&
    block?.parent_id === parsePageId(config.categoryParentId, { uuid: true })

  const isBlogPost = isNotMain && !isPostList

  const createdDate = isBlogPost
    ? getPageProperty<number>('Created Date', block, recordMap)
    : undefined
  const updatedTime = isBlogPost
    ? getPageProperty<number>('Updated Time', block, recordMap)
    : undefined

  const timeUpdated = updatedTime
    ? new Date(updatedTime).toISOString()
    : undefined
  const dateCreated = createdDate
    ? new Date(createdDate).toISOString()
    : undefined

  // const date = isBlogPost && dateCreated
  // ? `${dateCreated.toLocaleString('en-US', {
  //     month: 'long',
  //     year: 'numeric',
  //     timeZone: 'Asia/Seoul'  // Specify Korean Standard Time (KST)
  //   })}`
  // : undefined

  let pageAside = null

  const showTableOfContents = !!isBlogPost
  const minTableOfContentsItems = 3

  // only display comments and page actions on blog post pages
  if (isNotMain) {
    if (isBlogPost) {
      // if blog post
      console.log('Page Type: Blog Post')
      //default is nanum square
      let isDefaultFont = true
      pageAside = (
        <div className='aside'>
          <PageAside
            block={block}
            recordMap={recordMap}
            isBlogPost={isBlogPost}
          />
          {/* <SetFontbyProperty font={font.toString()}></SetFontbyProperty> */}
          <SwitchFont
            toggleFont={function (): void {
              //inner.setAttribute('style', `transform: rotate(-0.03deg)`)
              let fontAtt: string
              let defaultFontAtt: string
              defaultFontAtt = `font-family: 'NanumSquare', sans-serif`

              if (font !== '') {
                defaultFontAtt = `font-family: 'Binggrae-two'`
                // defaultFontAtt = `font: normal normal normal 1em 1em 'Binggrae-two'`
              }
              //const defaultFontAtt = `font: normal normal normal 1em 1em 'NanumSquare', sans-serif`
              if (isDefaultFont) {
                //fontAtt = `font: normal normal medium 1em 1em 'NotoSerifKR', serif`
                //fontAtt = `font-family: 'NotoSerifKR', serif`
                fontAtt = `font-family: 'Noto Serif KR', serif`

                isDefaultFont = false
              } else {
                fontAtt = defaultFontAtt
                isDefaultFont = true
              } /*
        const inner = document.querySelector('.notion-page-content-inner')
        inner.setAttribute('style', fontAtt)
*/

              const innertext = document.querySelectorAll('.notion-text')
              for (const elem of innertext) {
                elem.setAttribute('style', fontAtt)
                //   elem.setAttribute('style', `font-width: normal`)
              }
              const list = document.querySelectorAll('.notion-list')
              for (const elem of list) {
                elem.setAttribute('style', fontAtt)
                //   elem.setAttribute('style', `font-width: normal`)
              }
            }}
          />
        </div>
      )
    } else if (isPostList) {
      //if post list
      console.log('Page Type: Post List')
      // pageAside = (

      // )
    }
  } else {
    //if root page
    console.log('Page Type: Root Page')

    pageAside = (
      <div>
        <PageSocial />
      </div>
    )
  }

  return (
    <>
      <PageHead
        pageId={pageId}
        site={site}
        title={title}
        description={socialDescription}
        image={socialImage}
        url={canonicalPageUrl}
        createdDate={isBlogPost ? dateCreated : undefined}
        updatedTime={isBlogPost ? timeUpdated : undefined}
        isBlogPost={isBlogPost}
      />
      <FontLoader site={site} />
      {isLiteMode && <BodyClassName className='notion-lite' />}
      {isDarkMode && <BodyClassName className='dark-mode' />}

      <NotionRenderer
        bodyClassName={cs(
          styles.notion,
          // pageId === site.rootNotionPageId && 'index-page',
          isBlogPost && 'blog-post',
          isPostList && 'post-list',
          isIndexPage && 'index-page'
        )}
        darkMode={isDarkMode}
        components={components}
        recordMap={recordMap}
        rootPageId={site.rootNotionPageId}
        rootDomain={site.domain}
        fullPage={!isLiteMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={true}
        showTableOfContents={showTableOfContents}
        minTableOfContentsItems={minTableOfContentsItems}
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        mapPageUrl={siteMapPageUrl}
        mapImageUrl={mapImageUrl}
        searchNotion={config.isSearchEnabled ? searchNotion : null}
        pageAside={pageAside}
        footer={footer}
      />

      {/* <GitHubShareButton /> */}
      {
        <div className={styles.subscriptionWrapper}>
          <button
            className={styles.subscriptionToggle}
            onClick={() => setShowSubscribe(!showSubscribe)}
            aria-label='Toggle subscription form'
          >
            <IoMailOutline />
            구독
          </button>

          <div
            className={cs(
              styles.subscriptionContainer,
              showSubscribe && styles.visible
            )}
          >
            <SubscriptionForm />
          </div>
        </div>
      }
    </>
  )
}
