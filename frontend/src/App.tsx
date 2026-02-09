import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { IntroPage } from './components/auth/IntroPage';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { BillDetailsPage } from './components/payment/BillDetailsPage';
import { BillsDashboard } from './components/payment/BillsDashboard';
import { EmergencyPage } from './components/service/EmergencyPage';
import { GrievancePage } from './components/service/GrievancePage';
import { StatusPage } from './components/service/StatusPage';
import WastePage from './components/waste/WastePage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AnnouncementsPage } from './components/admin/AnnouncementsPage';
import { VoiceFloatingButton } from './components/ui/VoiceFloatingButton';
import { SahayakChat } from './components/ui/SahayakChat';
import { AccessibilityPanel } from './components/ui/AccessibilityPanel';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { AnimatePresence, motion } from 'framer-motion';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'sonner';
import { ParticleBackground } from './components/ui/ParticleBackground';


// Wrapper for Auth Flow to handle navigation
const AuthenticationFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<'intro' | 'login'>('intro');

  const handleIntroComplete = () => {
    setStep('login');
  };

  const handleLoginSuccess = (user: any) => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    setStep('intro');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {step === 'intro' ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex"
          >
            <IntroPage onComplete={handleIntroComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full p-6"
          >
            <LoginPage onLoginSuccess={handleLoginSuccess} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  useInactivityTimeout(); // Global Timeout

  // Show Voice Button only if NOT on the root (Auth) page
  const showVoice = location.pathname !== '/' && location.pathname !== '/auth';

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/auth" replace />} />

          <Route
            path="/auth"
            element={
              <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AuthenticationFlow />
              </motion.div>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <motion.div className="h-full" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                  <Dashboard />
                </motion.div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/status"
            element={
              <ProtectedRoute>
                <motion.div className="h-full" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}>
                  <StatusPage />
                </motion.div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/waste"
            element={
              <ProtectedRoute>
                <motion.div className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <WastePage />
                </motion.div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <BillsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bills/:type"
            element={
              <ProtectedRoute>
                <BillDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <EmergencyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/grievance"
            element={
              <ProtectedRoute>
                <GrievancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute requireAdmin>
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes >
      </AnimatePresence >
      {/* Show Sahayak AI only on citizen pages, not admin */}
      {showVoice && !location.pathname.startsWith('/admin') && (
        <>
          <VoiceFloatingButton />
          <SahayakChat />
        </>
      )}
    </>
  );
};

function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <ParticleBackground />
        <AnimatedRoutes />
        <AccessibilityPanel />
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App;
