FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod ./
COPY main.go ./
RUN go build -o product-service main.go

FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/product-service .
ENV PORT=8080
EXPOSE 8080
CMD ["./product-service"]
