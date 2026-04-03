import { Routes, Route } from 'react-router-dom';
import { DocsThemeProvider } from './theme';
import { DocsLayout } from './layout/DocsLayout';

// Pages
import { IntroductionPage } from './pages/IntroductionPage';
import { QuickstartPage } from './pages/QuickstartPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ColorPage } from './pages/ColorPage';
import { TokensPage } from './pages/TokensPage';
import {
  UseOnClickOutsidePage,
  UseKeyboardNavigationPage,
  UseMousePositionPage,
  UseOnEscapePressPage,
} from './pages/hooks';

// Component pages
import {
  AvatarPage,
  BannerPage,
  ButtonPage,
  ButtonGroupPage,
  ChipPage,
  CircularProgressPage,
  CodeInputPage,
  DialogPage,
  DividerPage,
  DropdownPage,
  FacepilePage,
  IconTextPage,
  InputFieldPage,
  KeyCodeSequencePage,
  MonoTagPage,
  SelectPage,
  SkeletonPage,
  SurfacePage,
  TabsPage,
  ToastPage,
  TogglePage,
  TooltipPage,
  TypographyPage,
} from './pages/components';

export default function App() {
  return (
    <DocsThemeProvider>
      <DocsLayout>
        <Routes>
          {/* Getting started */}
          <Route path="/" element={<IntroductionPage />} />
          <Route path="/quickstart" element={<QuickstartPage />} />
          <Route path="/resources" element={<ResourcesPage />} />

          {/* Components */}
          <Route path="/avatar" element={<AvatarPage />} />
          <Route path="/banner" element={<BannerPage />} />
          <Route path="/button" element={<ButtonPage />} />
          <Route path="/button-group" element={<ButtonGroupPage />} />
          <Route path="/chip" element={<ChipPage />} />
          <Route path="/circular-progress" element={<CircularProgressPage />} />
          <Route path="/code-input" element={<CodeInputPage />} />
          <Route path="/dialog" element={<DialogPage />} />
          <Route path="/divider" element={<DividerPage />} />
          <Route path="/dropdown" element={<DropdownPage />} />
          <Route path="/facepile" element={<FacepilePage />} />
          <Route path="/icon-text" element={<IconTextPage />} />
          <Route path="/input-field" element={<InputFieldPage />} />
          <Route path="/key-code-sequence" element={<KeyCodeSequencePage />} />
          <Route path="/mono-tag" element={<MonoTagPage />} />
          <Route path="/select" element={<SelectPage />} />
          <Route path="/skeleton" element={<SkeletonPage />} />
          <Route path="/surface" element={<SurfacePage />} />
          <Route path="/tabs" element={<TabsPage />} />
          <Route path="/toast" element={<ToastPage />} />
          <Route path="/toggle" element={<TogglePage />} />
          <Route path="/tooltip" element={<TooltipPage />} />
          <Route path="/typography" element={<TypographyPage />} />

          {/* Hooks */}
          <Route path="/use-on-click-outside" element={<UseOnClickOutsidePage />} />
          <Route path="/use-keyboard-navigation" element={<UseKeyboardNavigationPage />} />
          <Route path="/use-mouse-position" element={<UseMousePositionPage />} />
          <Route path="/use-on-escape-press" element={<UseOnEscapePressPage />} />

          {/* Theme */}
          <Route path="/color" element={<ColorPage />} />
          <Route path="/tokens" element={<TokensPage />} />
        </Routes>
      </DocsLayout>
    </DocsThemeProvider>
  );
}
