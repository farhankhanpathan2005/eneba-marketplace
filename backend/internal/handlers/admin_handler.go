package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"eneba-marketplace/backend/internal/config"
	"eneba-marketplace/backend/internal/repositories"
)

type AdminHandler struct {
	productRepo *repositories.ProductRepository
	cfg         *config.Config
}

func NewAdminHandler(productRepo *repositories.ProductRepository, cfg *config.Config) *AdminHandler {
	return &AdminHandler{productRepo: productRepo, cfg: cfg}
}

// SeedImages adds images to existing products without them (admin only)
func (h *AdminHandler) SeedImages(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		c.Abort()
		return
	}

	userRole, _ := c.Get("role")
	if userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		c.Abort()
		return
	}

	images := map[string]string{
		"Grand Theft Auto VI":                      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
		"Cyberpunk 2077: Ultimate Edition":          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
		"The Witcher 3: Complete Edition":           "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
		"Steam $50 Gift Card":                       "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=400&h=300&fit=crop",
		"PlayStation Network $25 Card":              "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
		"Xbox Game Pass Ultimate":                   "https://images.unsplash.com/photo-1621259182902-885a6a4a1c7e?w=400&h=300&fit=crop",
		"Microsoft Office 365":                      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=300&fit=crop",
		"Fortnite V-Bucks 2800":                     "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&h=300&fit=crop",
		"FIFA 24 Standard Edition":                  "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
		"Netflix Gift Card $25":                     "https://images.unsplash.com/photo-1574375927938-d5a98e8efe85?w=400&h=300&fit=crop",
	}

	updated := 0
	for title, imageURL := range images {
		product, err := h.productRepo.FindByTitle(title)
		if err == nil && product != nil && product.ImageURL == "" {
			product.ImageURL = imageURL
			h.productRepo.Update(product)
			updated++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image seeding completed",
		"updated": updated,
		"total":   len(images),
	})
}