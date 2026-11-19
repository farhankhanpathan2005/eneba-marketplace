package config

import (
	"fmt"
	"log"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Port       string
	JWTSecret  string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
}

func Load() *Config {
	v := viper.New()

	v.SetDefault("PORT", "8080")
	v.SetDefault("JWT_SECRET", "")
	v.SetDefault("DB_HOST", "localhost")
	v.SetDefault("DB_PORT", "5432")
	v.SetDefault("DB_USER", "postgres")
	v.SetDefault("DB_PASSWORD", "password")
	v.SetDefault("DB_NAME", "marketplace")
	v.SetDefault("DB_SSLMODE", "disable")

	// Read from environment
	v.AutomaticEnv()
	v.BindEnv("PORT", "SERVER_PORT")
	v.BindEnv("JWT_SECRET", "JWT_SECRET")
	v.BindEnv("DB_HOST", "POSTGRES_HOST")
	v.BindEnv("DB_PORT", "POSTGRES_PORT")
	v.BindEnv("DB_USER", "POSTGRES_USER")
	v.BindEnv("DB_PASSWORD", "POSTGRES_PASSWORD")
	v.BindEnv("DB_NAME", "POSTGRES_DB")
	v.BindEnv("DB_SSLMODE", "POSTGRES_SSLMODE")

	cfg := &Config{
		Port:       v.GetString("PORT"),
		JWTSecret:  v.GetString("JWT_SECRET"),
		DBHost:     v.GetString("DB_HOST"),
		DBPort:     v.GetString("DB_PORT"),
		DBUser:     v.GetString("DB_USER"),
		DBPassword: v.GetString("DB_PASSWORD"),
		DBName:     v.GetString("DB_NAME"),
		DBSSLMode:  v.GetString("DB_SSLMODE"),
	}

	// Hard fail if JWT_SECRET is not set
	if cfg.JWTSecret == "" {
		log.Fatal("FATAL: JWT_SECRET environment variable is required but not set. Cannot start server.")
		os.Exit(1)
	}

	return cfg
}

func DSN(c *Config) string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}
