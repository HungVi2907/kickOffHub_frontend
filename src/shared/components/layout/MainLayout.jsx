import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../navigation/Navbar.jsx'
import Footer from './Footer.jsx'
import Sidebar from './Sidebar.jsx'

const MotionMain = motion.main

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-parchment via-white to-slate-100 text-slate-900">
      <Navbar />
      <div className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
          <MotionMain
            key="page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex-1"
          >
            <Outlet />
          </MotionMain>
          <Sidebar />
        </div>
      </div>
      <Footer />
    </div>
  )
}
