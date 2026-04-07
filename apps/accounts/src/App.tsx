import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { SignUpPage } from '@/pages/SignUpPage';
import { SignInPage } from '@/pages/SignInPage';
import { RecoveryKeyPage } from '@/pages/RecoveryKeyPage';
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage';
import { SecuritySettingsPage } from '@/pages/SecuritySettingsPage';
import { RecoverySettingsPage } from '@/pages/RecoverySettingsPage';
import { AppearanceSettingsPage } from '@/pages/AppearanceSettingsPage';
import { DataExportPage } from '@/pages/DataExportPage';
import { RequireAuth } from '@/components/RequireAuth';

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/recovery-key" element={<RequireAuth><RecoveryKeyPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><ProfileSettingsPage /></RequireAuth>} />
        <Route path="/settings/security" element={<RequireAuth><SecuritySettingsPage /></RequireAuth>} />
        <Route path="/settings/recovery" element={<RequireAuth><RecoverySettingsPage /></RequireAuth>} />
        <Route path="/settings/appearance" element={<RequireAuth><AppearanceSettingsPage /></RequireAuth>} />
        <Route path="/settings/export" element={<RequireAuth><DataExportPage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
