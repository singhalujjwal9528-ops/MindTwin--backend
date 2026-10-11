FROM node:20-slim

# Install Python 3, pip and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages || true

# Copy application source code
COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
