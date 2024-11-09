import * as React from 'react'

export function SetFontbyProperty({ font }: { font: string }) {
    const [_curfont, changeFont]  = React.useState('나눔스퀘어');
    const setFontCb = React.useCallback(
        (e) => {
            e.preventDefault()
            
        },[]
    )

    React.useEffect(()=>{
        changeFont(font);
        let fontAtt: string
        if(font === '빙그레2'){
            fontAtt = `font-family: 'Binggrae-two'`
        }else if(font === 'notoserif'){
            fontAtt = `font-family: 'Noto Serif KR', serif`

           //fontAtt = `font-family: 'NotoSerifKR-Medium', serif`
          // fontAtt = `font: normal normal normal 1em 1em 'NotoSerifKR', serif`
        }

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

        
    },[font])
    return (
        <>{setFontCb}</>
    )
    
}