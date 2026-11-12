package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/user/eneba-marketplace/backend/internal/models"
	"github.com/user/eneba-marketplace/backend/internal/repositories"
)

type CartHandler struct {
	cartRepo *repositories.CartRepository
}

func NewCartHandler(cartRepo *repositories.CartRepository) *CartHandler {
	return &CartHandler{cartRepo: cartRepo}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	type addToCartRequest struct {
		UserID    uint `json:"user_id" binding:"required"`
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity"`
	}

	var req addToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	cartItem := &models.Cart{
		UserID:    req.UserID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if err := h.cartRepo.Add(cartItem); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to cart"})
		return
	}

	c.JSON(http.StatusCreated, cartItem)
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)

	carts, err := h.cartRepo.GetByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	c.JSON(http.StatusOK, carts)
}

type OrderHandler struct {
	orderRepo *repositories.OrderRepository
}

func NewOrderHandler(orderRepo *repositories.OrderRepository) *OrderHandler {
	return &OrderHandler{orderRepo: orderRepo}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	type createOrderRequest struct {
		UserID uint   `json:"user_id" binding:"required"`
		Item   struct {
			ProductID uint `json:"product_id"`
			Quantity  int  `json:"quantity"`
			Price     float64 `json:"price"`
		} `json:"item" binding:"required"`
	}

	var req createOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order := &models.Order{
		UserID: req.UserID,
		Status: "pending",
		Total:  float64(req.Item.Quantity) * req.Item.Price,
	}

	if err := h.orderRepo.Create(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)

	orders, err := h.orderRepo.GetByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}
