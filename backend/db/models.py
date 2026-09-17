from datetime import datetime , timezone
from db.base import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey , DateTime , Date, Float
from sqlalchemy.orm import relationship

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer,primary_key=True,index=True)
    first_name = Column(String(200),nullable=False)
    last_name = Column(String(200),nullable=False)
    email = Column(String(100),unique=True,nullable=False)
    user_name = Column(String(50) , unique=True, nullable=False)
    password = Column(String(200))

    refresh_tokens = relationship("RefreshTokens", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense" , back_populates="user" , cascade="all , delete-orphan")
    category = relationship("Category" , back_populates="user" , cascade="all , delete-orphan")


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer,primary_key=True,index=True)
    user_id =Column(Integer,ForeignKey("users.id"))
    category_name = Column(String(150),nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    expenses = relationship("Expense" , back_populates="category" , cascade="all , delete-orphan")
    user = relationship("Users", back_populates="category")



class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer , ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    title = Column(String(200))
    description = Column(String)
    amount = Column(Float,nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("Users", back_populates="expenses")
    category = relationship("Category", back_populates="expenses")



class RefreshTokens(Base):
    __tablename__ = 'refresh_tokens'

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer , ForeignKey("users.id"))
    refresh_token = Column(String(500))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)

    user = relationship("Users", back_populates="refresh_tokens")