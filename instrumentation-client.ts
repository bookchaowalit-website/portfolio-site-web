import * as Sentry from "@sentry/nextjs";

import { sentryOptions } from "@/lib/sentry";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init(sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN));
