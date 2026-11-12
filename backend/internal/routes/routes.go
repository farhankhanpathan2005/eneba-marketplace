package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/user/eneba-marketplace/backend/internal/handlers"
	"github.com/user/eneba-marketplace/backend/internal/middleware"
	"github.com/user/eneba-marketplace/backend/internal/repositories"
	"gorm.io/gorm"
)

func Setup(r *gin.Engine) {
	db := getDB() // TODO: Inject DB properly

	productRepo := repositories.NewProductRepository(db)
	userRepo := repositories.NewUserRepository(db)
	cartRepo := repositories.NewCartRepository(db)
	orderRepo := repositories.NewOrderRepository(db)

	authHandler := handlers.NewAuthHandler(userRepo)
	productHandler := handlers.NewProductHandler(productRepo)
	cartHandler := handlers.NewCartHandler(cartRepo)
	orderHandler := handlers.NewOrderHandler(orderRepo)

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		products := api.Group("/products")
		{
			products.GET("", productHandler.GetAllProducts)
			products.GET("/:id", productHandler.GetProduct)
			products.GET("/category", productHandler.GetProductsByCategory)
		}

		cart := api.Group("/cart")
		cart.Use(middleware.AuthMiddleware())
		{
			cart.POST("", cartHandler.AddToCart)
			cart.GET("/:user_id", cartHandler.GetCart)
		}

		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware())
		{
			orders.POST("", orderHandler.CreateOrder)
			orders.GET("/:user_id", orderHandler.GetUserOrders)
		}
	}
}

func getDB() *gorm.DB {
	// TODO: Initialize GORM connection from config
	// This is a placeholder - replace with actual DB initialization
	return nil
}
