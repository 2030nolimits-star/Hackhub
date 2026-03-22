import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import DyspraxiaMode from './pages/DyspraxiaMode'
import DementiaMode from './pages/DementiaMode'
import DepressionMode from './pages/DepressionMode'
import AnxietyMode from './pages/AnxietyMode'
import DyslexiaMode from './pages/DyslexiaMode'
import ADHDMode from './pages/ADHDMode'
import ChoosePath from './pages/ChoosePath'
import ProtectedRoute from './components/ProtectedRoute'
import AgentActivityPanel from './components/AgentActivityPanel'
import AgentToast from './components/AgentToast'

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
        <Route path="/choose" element={
          <ProtectedRoute>
            <PageWrapper><ChoosePath /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageWrapper><Dashboard /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/dyspraxia" element={
          <ProtectedRoute>
            <PageWrapper><DyspraxiaMode /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/dementia" element={
          <ProtectedRoute>
            <PageWrapper><DementiaMode /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/depression" element={
          <ProtectedRoute>
            <PageWrapper><DepressionMode /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/anxiety" element={
          <ProtectedRoute>
            <PageWrapper><AnxietyMode /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/dyslexia" element={
          <ProtectedRoute>
            <PageWrapper><DyslexiaMode /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/adhd" element={
          <ProtectedRoute>
            <PageWrapper><ADHDMode /></PageWrapper>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AgentToast />
      <AnimatedRoutes />
      <AgentActivityPanel />
    </BrowserRouter>
  )
}
