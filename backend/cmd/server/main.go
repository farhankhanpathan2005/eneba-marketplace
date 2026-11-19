package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/subosito/gotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"eneba-marketplace/backend/internal/config"
	"eneba-marketplace/backend/internal/handlers"
	"eneba-marketplace/backend/internal/middleware"
	"eneba-marketplace/backend/internal/models"
	"eneba-marketplace/backend/internal/repositories"
)

func main() {
	// Load .env file if it exists
	loadEnv()

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := connectDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate models
	err = autoMigrate(db)
	if err != nil {
		log.Printf("Warning: Migration failed: %v", err)
	}

	// Seed sample data if empty
	seedData(db)

	// Setup router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "eneba-marketplace"})
	})

	// Setup API routes
	apiRoutes(r, db, cfg)

	// Start server
	port := cfg.Port

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func connectDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := config.DSN(cfg)
	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Cart{},
		&models.Order{},
		&models.OrderItem{},
	)
}

func seedData(db *gorm.DB) {
	// Check if products exist
	var count int64
	db.Model(&models.Product{}).Count(&count)
	if count > 0 {
		return
	}

	// Sample products with images
	samples := []models.Product{
		{Title: "Grand Theft Auto VI", Description: "The most anticipated game of the decade. Explore Vice City in this open-world adventure.", Category: "Games", Platform: "PlayStation", Price: 59.99, OriginalPrice: 79.99, Stock: 100, SellerID: 1, Rating: 4.9, ImageURL: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop"},
		{Title: "Cyberpunk 2077: Ultimate Edition", Description: "Complete edition with all DLCs and expansions included.", Category: "Games", Platform: "PC", Price: 29.99, OriginalPrice: 59.99, Stock: 50, SellerID: 1, Rating: 4.5, ImageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"},
		{Title: "The Witcher 3: Complete Edition", Description: "All three games plus 16 DLC packs in one bundle.", Category: "Games", Platform: "PC", Price: 19.99, OriginalPrice: 49.99, Stock: 75, SellerID: 2, Rating: 4.8, ImageURL: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop"},
		{Title: "Steam $50 Gift Card", Description: "Add funds to your Steam wallet instantly.", Category: "Gift Cards", Platform: "Multi-platform", Price: 47.99, OriginalPrice: 50.00, Stock: 200, SellerID: 1, Rating: 4.7, ImageURL: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=400&h=300&fit=crop"},
		{Title: "PlayStation Network $25 Card", Description: "Digital code for PSN wallet.", Category: "Gift Cards", Platform: "PlayStation", Price: 23.99, OriginalPrice: 25.00, Stock: 150, SellerID: 2, Rating: 4.6, ImageURL: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop"},
		{Title: "Xbox Game Pass Ultimate", Description: "Access to hundreds of games on console and PC.", Category: "Software", Platform: "Xbox", Price: 14.99, OriginalPrice: 16.99, Stock: 300, SellerID: 1, Rating: 4.8, ImageURL: "https://images.unsplash.com/photo-1621259182902-885a6a4a1c7e?w=400&h=300&fit=crop"},
		{Title: "Microsoft Office 365", Description: "Full productivity suite with Word, Excel, PowerPoint.", Category: "Software", Platform: "PC", Price: 39.99, OriginalPrice: 99.99, Stock: 100, SellerID: 2, Rating: 4.4, ImageURL: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=300&fit=crop"},
		{Title: "Fortnite V-Bucks 2800", Description: "In-game currency for Fortnite Battle Royale.", Category: "Gift Cards", Platform: "Multi-platform", Price: 22.99, OriginalPrice: 24.99, Stock: 500, SellerID: 1, Rating: 4.5, ImageURL: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&h=300&fit=crop"},
		{Title: "FIFA 24 Standard Edition", Description: "The world's game on the pitch.", Category: "Games", Platform: "Xbox", Price: 39.99, OriginalPrice: 69.99, Stock: 80, SellerID: 2, Rating: 4.2, ImageURL: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop"},
		{Title: "Netflix Gift Card $25", Description: "Stream movies and TV shows instantly.", Category: "Streaming", Platform: "Multi-platform", Price: 23.99, OriginalPrice: 25.00, Stock: 250, SellerID: 1, Rating: 4.7, ImageURL: "https://images.unsplash.com/photo-1574375927938-d5a98e8efe85?w=400&h=300&fit=crop"},
	}

	for _, product := range samples {
		db.Create(&product)
	}
}

func apiRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	productRepo := repositories.NewProductRepository(db)
	userRepo := repositories.NewUserRepository(db)
	cartRepo := repositories.NewCartRepository(db)
	orderRepo := repositories.NewOrderRepository(db)
	adminHandler := handlers.NewAdminHandler(productRepo, cfg)

	authHandler := handlers.NewAuthHandler(userRepo, cfg)
	productHandler := handlers.NewProductHandler(productRepo)
	cartHandler := handlers.NewCartHandler(cartRepo)
	orderHandler := handlers.NewOrderHandler(orderRepo, cartRepo)

	api := r.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Products (public with optional auth)
		products := api.Group("/products")
		products.Use(middleware.OptionalAuth(cfg))
		{
			products.GET("", productHandler.GetAllProducts)
			products.GET("/:id", productHandler.GetProduct)
		}

		// Cart (requires auth)
		cart := api.Group("/cart")
		cart.Use(middleware.AuthMiddleware(cfg))
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("", cartHandler.AddToCart)
			cart.PUT("/:id", cartHandler.UpdateCartItem)
			cart.DELETE("/:id", cartHandler.RemoveCartItem)
		}

		// Orders (requires auth)
		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware(cfg))
		{
			orders.GET("", orderHandler.GetUserOrders)
			orders.GET("/:id", orderHandler.GetOrder)
			orders.POST("", orderHandler.CreateOrder)
		}

		// Admin endpoints (for development)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg))
			admin.POST("/seed-images", adminHandler.SeedImages)
	}
}

func loadEnv() {
	// Try multiple locations for .env file
	possiblePaths := []string{
		".env",                                    // Current directory
		"../.env",                                  // Parent directory
		"../../.env",                               // Two levels up
		"/Users/fap/eneba-marketplace/backend/.env", // Absolute path
	}

	for _, envPath := range possiblePaths {
		if _, err := os.Stat(envPath); err == nil {
			if err := gotenv.Load(envPath); err == nil {
				log.Printf("Loaded environment from: %s", envPath)
				return
			}
		}
	}
}