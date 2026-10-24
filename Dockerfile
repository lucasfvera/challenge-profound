# The delivery wrapper for the AI Visibility Snapshot demo.
#
# Three stages, each with one job: install the dependencies, build the app,
# and serve the built app. The runner carries the traced server and the
# production dependencies it needs, and nothing else — no TypeScript, no
# Tailwind, no test runner — so the image is small and so is its surface.
#
# The demo reads a fixed, fictional Snapshot and fetches nothing at runtime,
# so the container needs no secret, no configuration from whoever runs it, and
# no network at serve time.

ARG NODE_VERSION=22-alpine

# --- deps: the dependencies, installed from the lockfile ------------------

FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# The lockfile is the source of truth, so the image installs the same
# dependency tree the verification run installs on the host.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# --- builder: the production build ----------------------------------------

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# The build needs the toolchain as much as it needs the dependencies, so this
# stage takes both. `NODE_ENV` is deliberately not set here: it would make
# `npm ci` skip the development dependencies the build itself needs.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The build is hermetic — it reads no remote font and no remote asset — and
# the telemetry is off, so the build says nothing to the network.
ENV NEXT_TELEMETRY_DISABLED=1

# The standalone output is what makes this image small: the build traces the
# server and the production dependencies it needs into `.next/standalone`.
# It is asked for here, by the container's build, and by no other build — the
# plain build is the one every other platform gets.
ENV BUILD_OUTPUT=standalone
RUN npm run build

# The demo ships no asset of its own: the favicon travels through
# `src/app/favicon.ico`. `public/` is created anyway, because the runner
# copies it and a `COPY` of a path that does not exist fails the build.
RUN mkdir -p public

# --- runner: the built app, served ----------------------------------------

FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# The standalone server binds to whatever `HOSTNAME` says, and Docker sets
# `HOSTNAME` to the container id, which resolves to the container's own
# address. Without this the server would listen on that one address only: no
# loopback, no other interfaces. It is set here, in the runner, and nowhere
# else.
ENV HOSTNAME=0.0.0.0

# Every file the app reads belongs to the `node` user the base image ships,
# so the app runs as a non-root user that owns exactly what it needs.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

# The port the app serves, taken from the one the app is given, so the
# image's own two never drift apart.
EXPOSE ${PORT}

CMD ["node", "server.js"]
