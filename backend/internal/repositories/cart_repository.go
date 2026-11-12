package repositories

import (
	"gorm.io/gorm"

	"github.com/user/eneba-marketplace/backend/internal/models"
)

type CartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) Add(cart *models.Cart) error {
	return r.db.Create(cart).Error
}

func (r *CartRepository) GetByUserID(userID uint) ([]models.Cart, error) {
	var carts []models.Cart
	err := r.db.Where("user_id = ?", userID).Find(&carts).Error
	return carts, err
}

func (r *CartRepository) Delete(cartID uint) error {
	return r.db.Delete(&models.Cart{}, cartID).Error
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

func (r *OrderRepository) GetByUserID(userID uint) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Where("user_id = ?", userID).Preload("OrderItems").Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) GetByID(id uint) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("OrderItems").First(&order, id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}
