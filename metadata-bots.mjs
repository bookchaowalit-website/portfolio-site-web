// Next 15 streams <title>/<meta> into <body> unless the user agent matches
// `htmlLimitedBots`. Match every agent so Googlebot and browsers get the tags
// in <head>. Our metadata is static per route, so blocking costs no TTFB.
export const htmlLimitedBots = /.*/;
