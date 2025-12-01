import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import AppRoutes from '@/app/routes.jsx'

function App() {
  const location = useLocation()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const removeOverlayNodes = () => {
      document.querySelectorAll("body > div[id^='webhighlights']").forEach((node) => {
        node.remove()
      })
    }

    removeOverlayNodes()
    const observer = new MutationObserver(removeOverlayNodes)
    observer.observe(document.body, { childList: true })
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <AppRoutes key={location.pathname} location={location} />
    </AnimatePresence>
  )
}

export default App
