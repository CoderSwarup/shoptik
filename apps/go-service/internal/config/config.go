package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port     string
	MongoURI string
	MongoDB  string
}

func Load() *Config {
	// Load .env file (ignore error if not found in production)
	_ = godotenv.Load()

	cfg := &Config{
		Port:     getEnv("PORT", "5002"),
		MongoURI: getEnv("MONGO_URI", "mongodb://localhost:27017/shoptik"),
		MongoDB:  getEnv("MONGO_DB", "shoptik"),
	}

	log.Printf("[config] loaded: port=%s, db=%s", cfg.Port, cfg.MongoDB)
	return cfg
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return fallback
}
