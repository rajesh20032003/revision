FROM ruby:3.3-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY Gemfile .
RUN bundle install
COPY app.rb config.ru ./
ENV PORT=8080
EXPOSE 8080
CMD ["bundle", "exec", "puma", "-p", "8080"]
