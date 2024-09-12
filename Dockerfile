FROM oven/bun:latest

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY bun.lockb ./

RUN bun install
COPY . .

ENV BROWSER_EXEC_PATH=/usr/bin/google-chrome

ENV BRAINX_URL=https://brainxhr.com/private/task/cafe-order-food
ENV BRAINX_USERNAME=
ENV BRAINX_PASSWORD=
ENV CRON_EXPRESSION="30 4 * * 3-5"

CMD ["bun", "run", "start"]