import cs from 'classnames'
import { type FormEvent, useState } from 'react'

import styles from './styles.module.css'

type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error'

const DEFAULT_TOPICS = [
  'AI',
  'Apps & Tools',
  'Dev',
  'Biomedical',
  'Blockchain',
  'Random Notes',
  'Blockchain Data',
  'Blockchain Technology'
]

export function SubscriptionForm(): React.ReactElement {
  const [email, setEmail] = useState<string>('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  // const [topics, setTopics] = useState<string[]>([])
  const [status, setStatus] = useState<SubscriptionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  /* =======================
   COMMENTED OUT FOR PERFORMANCE OPTIMIZATION
   =======================
   Instead of loading a topic on every page, this was hard-coded for performance optimization.
   Therefore, dynamic topic loading has been commented out.
  // // get topics from api
  // useEffect(() => {
  //   let isMounted = true
  //   const controller = new AbortController()


  //   async function fetchTopics() {
  //     try {
  //       const response = await fetch('/api/topics', {
  //         method: 'GET',
  //         signal: controller.signal
  //       })
  //       const data = await response.json()
  //       if (isMounted && data.topics) {
  //         setTopics(data.topics)
  //       }
  //     } catch (error) {
  //       if (error.name === 'AbortError') return
  //       console.error('Failed to fetch topics:', error)
  //     }
  //   }

  //   fetchTopics()

  //   return () => {
  //     isMounted = false
  //     controller.abort()
  //   }
  // }, [])
*/

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topics: selectedTopics })
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(
          data.error || 'An error occurred while processing the subscription.'
        )
      }

      setStatus('success')
      setEmail('')
      setSelectedTopics([])
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'An unknown error occurred.'
      )
    }
  }

  return (
    <form onSubmit={subscribe} className={styles.subscriptionForm}>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='이메일 주소를 입력하세요'
        className={styles.subscriptionInput}
        required
      />
      <div className={styles.topicsLabel}>
        관심 주제를 선택해주세요. 선택하지 않으면 모든 글을 구독합니다.
      </div>
      <div className={styles.tagsContainer}>
        {/* =======================
           COMMENTED OUT FOR PERFORMANCE OPTIMIZATION
           =======================
        {topics.map((topic) => ( */}
        {DEFAULT_TOPICS.map((topic) => (
          <button
            key={topic}
            type='button'
            onClick={() => handleTopicToggle(topic)}
            className={cs(
              styles.tagButton,
              selectedTopics.includes(topic) && styles.tagSelected
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      <button
        type='submit'
        className={styles.subscriptionButton}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? '구독 처리중...' : '구독하기'}
      </button>

      {status === 'error' && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      {status === 'success' && (
        <div className={styles.successMessage}>
          이메일을 확인하여, 구독을 확정해주세요! (스팸 메일함에 넘어갈 수
          있습니다.)
        </div>
      )}
    </form>
  )
}
