import type * as types from 'notion-types'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import cs from 'classnames'
import * as React from 'react'
import { Breadcrumbs, Header, Search, useNotionContext } from 'react-notion-x'

import { isSearchEnabled, navigationLinks, navigationStyle } from '@/lib/config'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  return (
    <div
      className={cs('breadcrumb', 'button', styles.toggleDarkMode, !hasMounted && styles.hidden)}
      role='button'
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
    </div>
  )
}

// export function ToggleThemeButton() {
//   const [hasMounted, setHasMounted] = React.useState(false)
//   const { isDarkMode, toggleDarkMode } = useDarkMode()

//   const onToggleDarkMode = React.useCallback(
//     (e) => {
//       e.preventDefault()
//       toggleDarkMode()
//     },
//     [toggleDarkMode]
//   )

//   React.useEffect(() => {
//     setHasMounted(true)
//   }, [])

//   return (
//       <div className={styles.settings}>
//         {hasMounted && (
//           <a
//             className={styles.toggleDarkMode}
//             href='#'
//             role='button'
//             onClick={onToggleDarkMode}
//             title='Toggle dark mode'
//           >
//             {isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
//           </a>
//         )}
//       </div>
//   )
// }

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { components, mapPageUrl } = useNotionContext()
  
  if (navigationStyle === 'default') {
    return <Header block={block} />
  }

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        <Breadcrumbs block={block} rootOnly={false} />
    
        <div className='notion-nav-header-rhs breadcrumbs'>
          {navigationLinks
            ?.map((link, index) => {
              if (!link.pageId && !link.url) {
                return null
              }

              if (link.pageId) {
                return (
                  <components.PageLink
                    href={mapPageUrl(link.pageId)}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.PageLink>
                )
              } else {
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.Link>
                )
              }
            })
            .filter(Boolean)}
          <ToggleThemeButton />
          {isSearchEnabled && <Search block={block} title={null} />}
        </div>
      </div>
    </header>
  )
}