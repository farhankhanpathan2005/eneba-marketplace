package handlers

import (
	"net/http"
	cryptoRand "crypto/rand"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"eneba-marketplace/backend/internal/config"
	"eneba-marketplace/backend/internal/middleware"
	"eneba-marketplace/backend/internal/models"
	"eneba-marketplace/backend/internal/repositories"
)

type AuthHandler struct {
	userRepo *repositories.UserRepository
	cfg      *config.Config
}

func NewAuthHandler(userRepo *repositories.UserRepository, cfg *config.Config) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, cfg: cfg}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check existing email
	existingUser, _ := h.userRepo.FindByEmail(req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Check existing username
	existingUsername, _ := h.userRepo.FindByUsername(req.Username)
	if existingUsername != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := &models.User{
		Email:    req.Email,
		Username: req.Username,
		Password: string(hashedPassword),
		Role:     "customer",
	}

	if err := h.userRepo.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(h.cfg, user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":       user.ID,
		"email":    user.Email,
		"username": user.Username,
		"role":     user.Role,
		"token":    token,
		"message":  "Registration successful",
	})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userRepo.FindByEmail(req.Email)
	if err != nil || !checkPassword(user.Password, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := middleware.GenerateToken(h.cfg, user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"user_id":  user.ID,
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
		"message":  "Login successful",
	})
}

func checkPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

type ProductHandler struct {
	productRepo *repositories.ProductRepository
}

func NewProductHandler(productRepo *repositories.ProductRepository) *ProductHandler {
	return &ProductHandler{productRepo: productRepo}
}

type PaginatedResponse struct {
	Data  []models.Product `json:"data"`
	Total int64            `json:"total"`
	Page  int              `json:"page"`
	Limit int              `json:"limit"`
}

func (h *ProductHandler) GetAllProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	opts := repositories.ProductQuery{
		Page:      page,
		Limit:     limit,
		Category:  c.Query("category"),
		Platform:  c.Query("platform"),
		Search:    c.Query("search"),
		SortBy:    c.Query("sort_by"),
		SortOrder: c.Query("sort_order"),
	}

	if minPrice := c.Query("min_price"); minPrice != "" {
		if v, err := strconv.ParseFloat(minPrice, 64); err == nil {
			opts.MinPrice = &v
		}
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if v, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			opts.MaxPrice = &v
		}
	}

	products, total, err := h.productRepo.GetAll(opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, PaginatedResponse{
		Data:  products,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	product, err := h.productRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

type CartHandler struct {
	cartRepo *repositories.CartRepository
}

func NewCartHandler(cartRepo *repositories.CartRepository) *CartHandler {
	return &CartHandler{cartRepo: cartRepo}
}

type AddToCartRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity"`
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	cartItem := &models.Cart{
		UserID:    userID,
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
	userID := c.GetUint("user_id")

	carts, err := h.cartRepo.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	c.JSON(http.StatusOK, carts)
}

func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	cartID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.cartRepo.UpdateQuantity(uint(cartID), req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item updated"})
}

func (h *CartHandler) RemoveCartItem(c *gin.Context) {
	cartID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := h.cartRepo.Delete(uint(cartID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}

type OrderRequest struct {
	PaymentMethod string `json:"payment_method" binding:"required"`
}

type OrderHandler struct {
	orderRepo *repositories.OrderRepository
	cartRepo  *repositories.CartRepository
}

func NewOrderHandler(orderRepo *repositories.OrderRepository, cartRepo *repositories.CartRepository) *OrderHandler {
	return &OrderHandler{orderRepo: orderRepo, cartRepo: cartRepo}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get cart items with product preloads
	carts, err := h.cartRepo.GetByUserID(userID)
	if err != nil || len(carts) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// Calculate total
	var total float64
	for _, cartItem := range carts {
		total += cartItem.Product.Price * float64(cartItem.Quantity)
	}

	// Create order
	order := &models.Order{
		UserID: userID,
		Status: "completed",
		Total:  total,
	}

	if err := h.orderRepo.Create(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Create order items and generate keys
	keys := make([]string, 0, len(carts))
	var orderItems []*models.OrderItem
	for _, cartItem := range carts {
		// Create order item
		item := &models.OrderItem{
			OrderID:   order.ID,
			ProductID: cartItem.ProductID,
			Quantity:  cartItem.Quantity,
			Price:     cartItem.Product.Price,
		}
		if err := h.orderRepo.CreateOrderItem(item); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order item"})
			return
		}

		// Load product relationship
		h.orderRepo.GetDB().Preload("Product").First(&item, item.ID)

		// Generate mock digital key
		key := generateMockKey()
		keys = append(keys, key)
		orderItems = append(orderItems, item)
	}

	// Clear cart
	h.cartRepo.ClearByUserID(userID)

	// Reload order with pre-loaded order items and products
	var savedOrder models.Order
	h.orderRepo.GetDB().Preload("OrderItems.Product").First(&savedOrder, order.ID)

	// Return order with keys
	c.JSON(http.StatusCreated, gin.H{
		"order":   savedOrder,
		"keys":    keys,
		"message": "Order completed successfully",
	})
}

func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	userID := c.GetUint("user_id")

	orders, err := h.orderRepo.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	orderID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := c.GetUint("user_id")

	order, err := h.orderRepo.GetByID(uint(orderID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// generateMockKey generates a cryptographically random mock digital key (A1B2-C3D4-E5F6-G7H8)
func generateMockKey() string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 16)
	_, err := cryptoRand.Read(b)
	if err != nil {
		return "XXXX-XXXX-XXXX-XXXX" // fallback if /dev/urandom unavailable
	}
	for i := range b {
		b[i] = chars[int(b[i])%len(chars)]
	}
	return string(b[0:4]) + "-" + string(b[4:8]) + "-" + string(b[8:12]) + "-" + string(b[12:16])
}
