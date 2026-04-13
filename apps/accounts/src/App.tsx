import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { HaseenThemeProvider } from '@haseen-me/ui';
import { SignUpPage } from '@/pages/SignUpPage';
import { SignInPage } from '@/pages/SignInPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { RecoveryKeyPage } from '@/pages/RecoveryKeyPage';
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage';
import { SecuritySettingsPage } from '@/pages/SecuritySettingsPage';
import { RecoverySettingsPage } from '@/pages/RecoverySettingsPage';
import { AppearanceSettingsPage } from '@/pages/AppearanceSettingsPage';
import { DataExportPage } from '@/pages/DataExportPage';
import { RequireAuth } from '@/components/RequireAuth';
import { Toast } from '@haseen-me/ui';
import { useToastStore } from '@haseen-me/shared/toast';

function AppRoutes() {
  const toast = useToastStore();
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/settings" replace />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/recovery-key" element={<RequireAuth><RecoveryKeyPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><ProfileSettingsPage /></RequireAuth>} />
        <Route path="/settings/security" element={<RequireAuth><SecuritySettingsPage /></RequireAuth>} />
        <Route path="/settings/recovery" element={<RequireAuth><RecoverySettingsPage /></RequireAuth>} />
        <Route path="/settings/appearance" element={<RequireAuth><AppearanceSettingsPage /></RequireAuth>} />
        <Route path="/settings/export" element={<RequireAuth><DataExportPage /></RequireAuth>} />
      </Routes>
      <Toast
        message={toast.countdown ? `${toast.message} (${toast.countdown}s)` : toast.message}
        visible={toast.visible}
        onDismiss={toast.hide}
        action={toast.action ?? undefined}
        duration={toast.countdown ? 0 : undefined}
      />
    </>
  );
}

export default function App() {
  return (
    <HaseenThemeProvider>
      <ErrorBoundary>
        <BrowserRouter basename="/accounts">
          <AppRoutes />
        </BrowserRouter>
      </ErrorBoundary>
    </HaseenThemeProvider>
  );
}
