/**
 * The studio is a local tool, not a deployment.
 *
 * Next 16 runs Turbopack by default, so there is no webpack config here.
 * An earlier version of this file excluded `_generated/` and `_cache/`
 * from the dev watcher, which was solving the problem in the wrong place.
 *
 * The actual fix is architectural and lives in `lib/paths.js`: pipeline
 * output is JSON read with `fs` at request time, not a module the corpus
 * imports. Nothing a stage writes is in the module graph, so a stage
 * rewriting its own output mid-run cannot trigger a recompile — whatever
 * the bundler happens to be watching.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  turbopack: {},
};

export default nextConfig;
