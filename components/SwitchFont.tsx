import * as React from 'react'

import styles from './styles.module.css'

export function SwitchFont({ toggleFont }: { toggleFont: () => void }) {

    const [hasMounted, switchFont]  = React.useState(false);

    const toggleFontCb = React.useCallback(
        (e) => {
            e.preventDefault()
            toggleFont()
            
        },[toggleFont]
    )

    React.useEffect(()=>{
        switchFont(true)      
    }, [])

    return (
        
        <div className='font-button'>
            {hasMounted ? (     
                <div className='styles.settings' >
                <a
                    className={styles.toggleFont}
                    onClick={toggleFontCb}
                    title='Toggle Font'
                    >
            <svg 
                viewBox="0 0 25 24" 
                style={{
                    fill: 'currentcolor',
                }}
            >
            <path d="M 14.507812 17.304688 L 6.210938 17.304688 L 5.222656 19.597656 C 4.898438 20.359375 4.734375 20.984375 4.734375 21.484375 C 4.734375 22.148438 5.003906 22.632812 5.535156 22.9375 C 5.839844 23.128906 6.609375 23.265625 7.835938 23.359375 L 7.835938 24 L 0.0234375 24 L 0.0234375 23.359375 C 0.863281 23.230469 1.558594 22.878906 2.097656 22.308594 C 2.640625 21.738281 3.316406 20.554688 4.109375 18.761719 L 12.515625 0 L 12.84375 0 L 21.316406 19.285156 C 22.125 21.113281 22.789062 22.261719 23.308594 22.734375 C 23.707031 23.09375 24.261719 23.304688 24.976562 23.363281 L 24.976562 24.003906 L 13.609375 24.003906 L 13.609375 23.363281 L 14.074219 23.363281 C 14.984375 23.363281 15.632812 23.230469 16 22.976562 C 16.253906 22.792969 16.382812 22.527344 16.382812 22.179688 C 16.382812 21.972656 16.347656 21.757812 16.277344 21.539062 C 16.253906 21.433594 16.082031 21 15.757812 20.238281 Z M 13.917969 16.023438 L 10.421875 7.925781 L 6.8125 16.023438 Z M 13.917969 16.023438 "/>
            </svg>
                </a>
                </div>
            ): null} 
        </div>
        
    )
    
    
}