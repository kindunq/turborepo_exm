FROM node:20-alpine AS base

# PNPM 전역 경로 및 corepack 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


FROM base AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

# 필수 도구 설치 (예: MinIO CLI 등)
RUN apk update && apk add --no-cache libc6-compat curl && \
  curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && \
  chmod +x mc && mv mc /usr/local/bin/mc

# -----------------------------------
# 1. Prune 단계 (필요한 워크스페이스만 추출)
# -----------------------------------

WORKDIR /app
RUN pnpm i -g turbo
RUN turbo telemetry disable
COPY . .
RUN turbo prune main --docker
# -----------------------------------
# 2. Install 단계 (디펜던시 설치 + 소스 복사)
# -----------------------------------
FROM base AS installer
# corepack 다시 설정
RUN corepack enable
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# 캐시 최적화를 위해 lockfile 먼저 복사
COPY --from=builder /app/out/json/ .
RUN pnpm i

# turbo prune된 full 소스 복사
COPY --from=builder /app/out/full/ .


# 리모트 캐시 팀 이름
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
 
# 리모트 캐시 토큰
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN


# # 리모트 캐시 API URL
ARG TURBO_API
ENV TURBO_API=$TURBO_API


# 빌드 실행
RUN pnpm turbo telemetry disable
RUN pnpm turbo build --filter=main --concurrency=4


# -----------------------------------
# 3. Runner 단계 (최종 실행 이미지)
# -----------------------------------
FROM base AS runner
WORKDIR /app

# 비 root 유저 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs




# Next.js standalone 모드 기반 복사
COPY --from=installer --chown=nextjs:nodejs /app/apps/main/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/main/.next/static ./apps/main/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/main/public ./apps/main/public


EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/main/server.js"]
