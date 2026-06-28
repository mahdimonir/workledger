FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o pdf-service .

FROM alpine:latest

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app

COPY --from=builder /app/pdf-service .
COPY templates/ ./templates/

ENV CHROMEDP_NO_SANDBOX=true
ENV PORT=8080

EXPOSE 8080

CMD ["./pdf-service"]
