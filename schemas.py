from pydantic import BaseModel

class ProductoBase(BaseModel):
    nombre: str
    precio: int

class ProductoCreate(ProductoBase):
    pass

class Producto(ProductoBase):
    id: int

    class Config:
        orm_mode = True
