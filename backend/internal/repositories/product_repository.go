package repositories

import (
	"gorm.io/gorm"

	"eneba-marketplace/backend/internal/models"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

type ProductQuery struct {
	Page      int
	Limit     int
	Category  string
	Platform  string
	MinPrice  *float64
	MaxPrice  *float64
	SortBy    string
	SortOrder string
	Search    string
}

func (r *ProductRepository) GetAll(opts ProductQuery) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := r.db.Model(&models.Product{})

	// Apply filters
	if opts.Category != "" {
		query = query.Where("category = ?", opts.Category)
	}
	if opts.Platform != "" {
		query = query.Where("platform = ?", opts.Platform)
	}
	if opts.MinPrice != nil {
		query = query.Where("price >= ?", *opts.MinPrice)
	}
	if opts.MaxPrice != nil {
		query = query.Where("price <= ?", *opts.MaxPrice)
	}
	if opts.Search != "" {
		searchTerm := "%" + opts.Search + "%"
		query = query.Where(
			"title ILIKE ? OR description ILIKE ? OR category ILIKE ?",
			searchTerm, searchTerm, searchTerm,
		)
	}

	// Count total for pagination
	query.Count(&total)

	// Apply sorting
	switch opts.SortBy {
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	case "rating":
		query = query.Order("rating DESC NULLS LAST")
	case "newest":
		query = query.Order("created_at DESC")
	default:
		query = query.Order("id DESC")
	}

	// Pagination
	if opts.Limit > 0 {
		offset := (opts.Page - 1) * opts.Limit
		query = query.Offset(offset).Limit(opts.Limit)
	}

	err := query.Find(&products).Error
	return products, total, err
}

func (r *ProductRepository) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.First(&product, id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *ProductRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *ProductRepository) GetByCategory(category string) ([]models.Product, error) {
	var products []models.Product
	err := r.db.Where("category = ?", category).Find(&products).Error
	return products, err
}

func (r *ProductRepository) UpdateImage(id uint, imageURL string) error {
	return r.db.Model(&models.Product{}).Where("id = ?", id).Update("image_url", imageURL).Error
}

func (r *ProductRepository) FindByTitle(title string) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("title = ?", title).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}