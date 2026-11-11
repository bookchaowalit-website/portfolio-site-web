// Options for withSentryConfig (see next.config.js). The SDK runs errors-only
// (src/lib/sentry.ts: no tracing, no replay), so the build tree-shakes that
// code out of the client bundle instead of shipping and evaluating it.
export const sentryBuildOptions = {
  // Suppresses source map upload logs
  silent: !process.env.CI,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Set to false to disable source map uploads
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  webpack: {
    treeshake: {
      removeTracing: true,
      removeDebugLogging: true,
      excludeReplayIframe: true,
      excludeReplayShadowDOM: true,
      excludeReplayCompressionWorker: true,
    },
  },
};
