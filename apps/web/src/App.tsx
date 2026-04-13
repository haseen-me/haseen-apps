import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { HaseenThemeProvider } from '@haseen-me/ui';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { SecurityPage } from './pages/SecurityPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <HaseenThemeProvider>
    <ErrorBoundary>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '200px 24px 120px' }}>
              <h1 style={{ fontSize: 64, fontWeight: 700, color: 'var(--hsn-text-muted)', marginBottom: 8 }}>404</h1>
              <p style={{ fontSize: 16, color: 'var(--hsn-text-secondary)', marginBottom: 24 }}>Page not found</p>
              <Link to="/" style={{ color: 'var(--hsn-brand)', fontWeight: 500 }}>← Back to Home</Link>
            </div>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
    </ErrorBoundary>
    </HaseenThemeProvider>
  );
}
