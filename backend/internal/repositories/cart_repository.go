package repositories

import (
	"gorm.io/gorm"

	"eneba-marketplace/backend/internal/models"
)

type CartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) GetByUserID(userID uint) ([]models.Cart, error) {
	var carts []models.Cart
	err := r.db.Where("user_id = ?", userID).Preload("Product").Find(&carts).Error
	return carts, err
}

func (r *CartRepository) Add(cart *models.Cart) error {
	// Upsert: if exists, update quantity; otherwise create new
	result := r.db.Where("user_id = ? AND product_id = ?", cart.UserID, cart.ProductID).
		Assign(models.Cart{Quantity: cart.Quantity}).
		FirstOrCreate(cart)
	return result.Error
}

func (r *CartRepository) UpdateQuantity(cartID uint, quantity int) error {
	return r.db.Model(&models.Cart{}).
		Where("id = ?", cartID).
		Update("quantity", quantity).Error
}

func (r *CartRepository) Delete(cartID uint) error {
	return r.db.Delete(&models.Cart{}, cartID).Error
}

func (r *CartRepository) ClearByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.Cart{}).Error
}

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepository) CreateOrderItem(item *models.OrderItem) error {
	return r.db.Create(item).Error
}

func (r *OrderRepository) GetByUserID(userID uint) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Where("user_id = ?", userID).
		Preload("OrderItems.Product").
		Order("created_at DESC").
		Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) GetByID(id uint) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("OrderItems.Product").First(&order, id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Order{}).Where("id = ?", id).Update("status", status).Error
}

// DB field accessor for order completion handler
func (r *OrderRepository) GetDB() *gorm.DB {
	return r.db
}