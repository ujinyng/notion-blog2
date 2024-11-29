import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: 'd6b7f5b66b9146efa2b1c24b4344b6f3',
  // 카테고리 데이터베이스 ID
  categoryDBId: 'bcc6dc2fece946c78014c50896f0f4aa',
  categoryParentId: '0d185e1e84d04cb4a6e127a185ffe7e0',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: null,

  // basic site info (required)
  name: 'UJverse',
  domain: 'ujinyng.com',
  author: 'Jinyoung Yoo',
  publisher: 'UJ',

  // open graph metadata (optional)
  description: `Pursuing Technology for Flourishing`,

  // social usernames (optional)
  twitter: 'uj_korean',
  //github: 'transitive-bullshit',
  linkedin: 'ujinyng',
  facebook: '1.jinyoung.yoo',
  // mastodon: '#', // optional mastodon profile URL, provides link verification
  // newsletter: '#', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: null,

  // whether to use the default notion navigation style or a custom one with links to
  // important pages. To use `navigationLinks`, set `navigationStyle` to `custom`.
  // navigationStyle: 'default'
  navigationStyle: 'custom',
  navigationLinks: [
    {
      title: 'Archive',
      pageId: 'eeaf3f4be6b5438ab84bf287fe7acd64'
    }
  ]
})
