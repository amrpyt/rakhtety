# Phase 6 Research

## Sources Checked

- Cloudflare Workers Next.js guide: https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/
- OpenNext Cloudflare CLI docs: https://opennext.js.org/cloudflare/cli
- Next.js support policy: https://nextjs.org/support-policy
- Cloudflare Workers environment variables: https://developers.cloudflare.com/workers/configuration/environment-variables/
- Cloudflare Workers secrets guidance: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/

## Decisions

- Use browser print/PDF for Arabic reports in this phase. This keeps Arabic RTL shaping and Cairo font rendering in the browser instead of hand-shaping glyphs inside a PDF library.
- Use Cloudflare Workers + OpenNext for deployment setup. Cloudflare's current Next.js guide points to the OpenNext adapter for Next.js on Workers.
- Do not deploy with `--dangerouslyUseUnsupportedNextVersion`. The adapter blocks Next.js 14.2.35 and Next.js marks 14.x unsupported, so deployment should wait for Phase 7.

