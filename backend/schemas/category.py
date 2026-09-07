from datetime import datetime

from pydantic import BaseModel, ConfigDict

# Api sa ana wala data ko validate karna ko lagi schema banayeko ho. Yo schema le data ko structure define karxa ra validation rules specify garxa.
class CategoryBase(BaseModel):
    name: str
    description: str | None = None  # This one is optional, so we can set it to None by default. If the user doesn't provide a description, it will be set to None.


class CategoryCreate(CategoryBase):
    pass  # nothing extra will add here for now, but we can add more fields in the future if needed. For example, if we want to add a field for the user who created the category, we can add it here.


class CategoryUpdate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)