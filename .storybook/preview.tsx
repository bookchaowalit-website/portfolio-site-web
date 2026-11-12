import type { Preview, Decorator } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import th from "../messages/th.json";
import en from "../messages/en.json";
import "../src/app/globals.css";
import { mockApiFetch, NAVIGATION_PATHNAME, syncStoredTheme } from "./shell";
// Same next/font setup as the app root layout (src/app/[locale]/layout.tsx).
import { Geist, Geist_Mono, Noto_Sans_Thai, Kalam } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  preload: false,
});

const FONT_CLASSES = [geistSans.variable, geistMono.variable, notoSansThai.variable, kalam.variable];

const VIEWPORTS = {
  w320: { name: "320 (small phone)", styles: { width: "320px", height: "640px" } },
  w375: { name: "375 (phone)", styles: { width: "375px", height: "812px" } },
  w768: { name: "768 (tablet)", styles: { width: "768px", height: "1024px" } },
  w1440: { name: "1440 (desktop)", styles: { width: "1440px", height: "900px" } },
};

// Mirrors the app root: lang, .font-thai for Thai, .dark for dark theme.
if (typeof window !== "undefined" && !(window as { __storyFetchMocked?: boolean }).__storyFetchMocked) {
  window.fetch = mockApiFetch(window.fetch.bind(window));
  (window as { __storyFetchMocked?: boolean }).__storyFetchMocked = true;
}

const withAppShell: Decorator = (Story, context) => {
  const locale = context.globals.locale === "en" ? "en" : "th";
  const theme = context.globals.theme === "dark" ? "dark" : "light";
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    html.lang = locale;
    html.classList.add(...FONT_CLASSES);
    html.classList.toggle("font-thai", locale === "th");
    html.classList.toggle("dark", theme === "dark");
    try {
      syncStoredTheme(window.localStorage, theme);
    } catch {
      // Storage can be blocked; the class above still sets the theme.
    }
  }
  return (
    <NextIntlClientProvider locale={locale} messages={locale === "th" ? th : en} timeZone="Asia/Bangkok"
      // Missing keys are app bugs: show them as warnings instead of breaking the story.
      onError={(e) => console.warn(`[next-intl] ${e.code}: ${e.message}`)}
      getMessageFallback={({ namespace, key }) => `${namespace ? namespace + "." : ""}${key}`}
    >
      {/* key: remount on a toolbar theme change so components that read the
          theme on mount (ThemeToggle) pick up the new value. */}
      <div key={theme} className="bg-background text-foreground font-sans antialiased">
        <Story />
      </div>
    </NextIntlClientProvider>
  );
};

const preview: Preview = {
  decorators: [withAppShell],
  globalTypes: {
    locale: {
      description: "Locale",
      toolbar: { icon: "globe", items: [{ value: "th", title: "ไทย" }, { value: "en", title: "English" }], dynamicTitle: true },
    },
    theme: {
      description: "Theme",
      toolbar: { icon: "mirror", items: [{ value: "light", title: "Light" }, { value: "dark", title: "Dark" }], dynamicTitle: true },
    },
  },
  initialGlobals: { locale: "th", theme: "light" },
  parameters: {
    layout: "padded",
    nextjs: { appDirectory: true, navigation: { pathname: NAVIGATION_PATHNAME } },
    viewport: { options: VIEWPORTS },
    a11y: { test: "error", options: { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
