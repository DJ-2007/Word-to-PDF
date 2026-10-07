# Multi-stage Dockerfile for Convertly File Converter
FROM node:20-bookworm-slim AS base

# Install system dependencies including Python 3, LibreOffice, and graphics libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libreoffice-nogui \
    poppler-utils \
    ghostscript \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python conversion engines
RUN pip install --no-cache-dir \
    pymupdf \
    pdf2docx \
    reportlab \
    python-docx \
    python-pptx \
    openpyxl \
    markdown-it-py \
    pillow

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Production Runner Stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libreoffice-nogui \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy virtualenv and build output from base
COPY --from=base /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV NODE_ENV=production
ENV PYTHON_PATH="/opt/venv/bin/python3"
ENV LIBREOFFICE_PATH="soffice"
ENV TEMP_STORAGE_DIR="/app/.temp_storage"

COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/scripts ./scripts

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
