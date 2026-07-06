FROM golang:1.23-alpine AS build

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN go build -o /air-temple-api ./cmd/api

FROM alpine:3.21

WORKDIR /app

COPY --from=build /air-temple-api /air-temple-api

EXPOSE 8080

CMD ["/air-temple-api"]
