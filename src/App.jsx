import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <AppRoutes key={location.pathname} location={location} />
    </AnimatePresence>
  )
}

export default App
