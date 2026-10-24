import type { NextConfig } from "next";

/**
 * `output: "standalone"` is what makes the runtime image small: the build
 * traces the server and the production dependencies it needs into
 * `.next/standalone`, and that directory is the only server the container
 * carries.
 *
 * It is also the setting that broke every Vercel deployment of a
 * standalone-configured app on Next 16.3: Next stopped writing the
 * whole-app server NFT files when a deployment adapter was present, and
 * Vercel's builder injects one, so the build died with `ENOENT`. The fix
 * landed in Next 16.3.5 (vercel/next.js#98167) — but the adapter rollout is
 * not ours to pin, and standalone output is unused on Vercel anyway, because
 * Vercel builds its own output from the same sources.
 *
 * So the build says what it wants instead of hoping. The container's build
 * asks for the standalone output, and a Vercel build never gets it. Every
 * other build — the one `next start` serves, the one the smoke suite runs,
 * the one Vercel runs — is the plain build this repo has always produced,
 * which also keeps `next start` from warning about a server it would rather
 * we ran.
 */
const wantsStandaloneOutput = process.env.BUILD_OUTPUT === "standalone";
const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig =
  wantsStandaloneOutput && !isVercelBuild ? { output: "standalone" } : {};

export default nextConfig;
