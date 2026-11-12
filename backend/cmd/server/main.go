package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/user/eneba-marketplace/backend/internal/middleware"
	"github.com/user/eneba-marketplace/backend/internal/routes"
)

func main() {
	r := gin.Default()

	// Configure CORS
	r.Use(middleware.CORS())

	// Setup routes
	routes.Setup(r)

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
