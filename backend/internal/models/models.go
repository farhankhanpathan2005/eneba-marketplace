package models

import "time"

type User struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Role      string    `gorm:"default:'customer'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Product struct {
	ID            uint      `gorm:"primarykey" json:"id"`
	Title         string    `gorm:"not null" json:"title"`
	Description   string    `json:"description"`
	Category      string    `gorm:"not null" json:"category"`
	Platform      string    `json:"platform"`
	ImageURL      string    `gorm:"not null" json:"imageUrl"`
	Price         float64   `gorm:"not null" json:"price"`
	OriginalPrice float64   `json:"original_price"`
	Stock         int       `gorm:"default:999" json:"stock"`
	SellerID      uint      `gorm:"not null" json:"seller_id"`
	Rating        float64   `json:"rating"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Cart struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex:idx_cart_user_product,unique" json:"user_id"`
	ProductID uint      `gorm:"uniqueIndex:idx_cart_user_product,unique" json:"product_id"`
	Quantity  int       `gorm:"default:1" json:"quantity"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product"`
	CreatedAt time.Time `json:"created_at"`
}

type Order struct {
	ID         uint        `gorm:"primarykey" json:"id"`
	UserID     uint        `gorm:"not null" json:"user_id"`
	Status     string      `gorm:"default:'pending'" json:"status"`
	Total      float64     `gorm:"not null" json:"total"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID" json:"order_items"`
	CreatedAt  time.Time   `json:"created_at"`
}

type OrderItem struct {
	ID        uint    `gorm:"primarykey" json:"id"`
	OrderID   uint    `gorm:"not null" json:"order_id"`
	ProductID uint    `gorm:"not null" json:"product_id"`
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"not null" json:"price"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`
}
