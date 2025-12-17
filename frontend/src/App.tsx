import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { SocketProvider } from './contexts/socket-context'
import { LoginForm } from './components/auth/login-form'
import { DashboardLayout } from './components/layout/dashboard-layout'
import DashboardPage from './pages/dashboard'
import TasksPage from './pages/tasks'
import SettingsPage from './pages/settings'
import { Toaster } from 'sonner'

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LoginForm />} />
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="tasks" element={<TasksPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
                <Toaster richColors position="top-right" />
            </SocketProvider>
        </AuthProvider>
    )
}

export default App
