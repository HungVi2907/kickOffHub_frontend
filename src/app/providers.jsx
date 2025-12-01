import { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/shared/components/feedback/ToastProvider.jsx'
import GlobalLoader from '@/shared/components/feedback/GlobalLoader.jsx'

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<GlobalLoader show />}>{children}</Suspense>
      </ToastProvider>
    </BrowserRouter>
  )
}
