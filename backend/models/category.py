from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from db.database import Base

# For the database schema, we will create a Category model that represents the "categories" table in the database.
class Category(Base):
    __tablename__ = "categories"  # this python class will be mapped to the "categories" table in the database

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )