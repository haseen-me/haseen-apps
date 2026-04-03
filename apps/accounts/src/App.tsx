import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignUpPage } from '@/pages/SignUpPage';
import { SignInPage } from '@/pages/SignInPage';
import { RecoveryKeyPage } from '@/pages/RecoveryKeyPage';
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage';
import { SecuritySettingsPage } from '@/pages/SecuritySettingsPage';
import { RecoverySettingsPage } from '@/pages/RecoverySettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/recovery-key" element={<RecoveryKeyPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
        <Route path="/settings/security" element={<SecuritySettingsPage />} />
        <Route path="/settings/recovery" element={<RecoverySettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
