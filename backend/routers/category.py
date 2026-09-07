from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.dependencies import get_db
from models.category import Category
from models.product import Product
from schemas.category import CategoryCreate, CategoryResponse # pydantic scehma
from services.category_service import (
    create_category as create_category_service,
    delete_category as delete_category_service,
    get_all_categories as get_all_categories_service,
    get_category_by_id as get_category_by_id_service,
    update_category as update_category_service,
)

# handles the API endpoints related to categories. It defines routes for creating, updating, deleting, and retrieving categories. Each route interacts with the database using SQLAlchemy sessions and returns appropriate responses based on the operation performed.
router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)

# create category 
@router.post("/", response_model=CategoryResponse)  # frontend receive json and convert it to CategoryResponse schema. This ensures that the response sent back to the frontend adheres to the defined structure and validation rules specified in the CategoryResponse schema.
def create_category(
    category: CategoryCreate,  # table back to database should be validated using the CategoryCreate schema. This ensures that the data received from the API request adheres to the defined structure and validation rules before it is processed and stored in the database.
    db: Session = Depends(get_db)   # For database session, we will use the Depends function to inject the database session into the route handler. This allows us to interact with the database and perform CRUD operations on the Category model.
    #db session is a SQLAlchemy session that allows us to interact with the database. It is provided by the get_db dependency, which is defined in the db.dependencies module. The get_db function creates a new database session for each request and ensures that it is properly closed after the request is completed.
):
    existing_category = (
        db.query(Category)
        .filter(Category.name == category.name)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    return create_category_service(db, category.model_dump())

# update category
@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    existing_category = get_category_by_id_service(db, category_id)

    if not existing_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Check if another category already has this name
    duplicate = (
        db.query(Category)
        .filter(
            Category.name == category.name,
            Category.id != category_id
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    return update_category_service(db, category_id, category.model_dump())

 # delete the category
@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = get_category_by_id_service(db, category_id)

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    if db.query(Product).filter(Product.category_id == category_id).count():
        raise HTTPException(status_code=409, detail="Reassign or delete this category's products before deleting it")

    delete_category_service(db, category_id)

    return {
        "message": "Category deleted successfully"
    }


# get all categories
@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return get_all_categories_service(db, page, limit)


# get category by id
@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = get_category_by_id_service(db, category_id)

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category