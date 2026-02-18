import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const EventsPage = lazy(() => import('@/pages/EventsPage'))
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const TreasuryPage = lazy(() => import('@/pages/TreasuryPage'))
const AccountingPage = lazy(() => import('@/pages/AccountingPage'))
const TmAccountsPage = lazy(() => import('@/pages/TmAccountsPage'))
const ParcelsPage = lazy(() => import('@/pages/ParcelsPage'))
const TodosPage = lazy(() => import('@/pages/TodosPage'))
const AlertsPage = lazy(() => import('@/pages/AlertsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/treasury" element={<TreasuryPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/tm-accounts" element={<TmAccountsPage />} />
            <Route path="/parcels" element={<ParcelsPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
