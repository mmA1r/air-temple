package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServerAddr       string
	DatabaseURL      string
	AdminUsername    string
	AdminPassword    string
	PublicBaseURL    string
	CORSOrigin       string
	S3Endpoint       string
	S3PublicEndpoint string
	S3Region         string
	S3Bucket         string
	S3AccessKey      string
	S3SecretKey      string
	S3UsePathStyle   bool
}

func Load() Config {
	return Config{
		ServerAddr:       getEnv("SERVER_ADDR", ":8080"),
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://air_temple:air_temple@localhost:5432/air_temple?sslmode=disable"),
		AdminUsername:    getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword:    getEnv("ADMIN_PASSWORD", "change-me"),
		PublicBaseURL:    getEnv("PUBLIC_BASE_URL", "http://localhost:8080"),
		CORSOrigin:       getEnv("CORS_ORIGIN", "http://localhost:5173"),
		S3Endpoint:       getEnv("S3_ENDPOINT", "http://localhost:9000"),
		S3PublicEndpoint: getEnv("S3_PUBLIC_ENDPOINT", "http://localhost:9000"),
		S3Region:         getEnv("S3_REGION", "us-east-1"),
		S3Bucket:         getEnv("S3_BUCKET", "air-temple-media"),
		S3AccessKey:      getEnv("S3_ACCESS_KEY", "airtemple"),
		S3SecretKey:      getEnv("S3_SECRET_KEY", "airtemple-secret"),
		S3UsePathStyle:   getBoolEnv("S3_USE_PATH_STYLE", true),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

func getBoolEnv(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}

	return parsed
}
