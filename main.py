from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

# -------------------- BASE DE DATOS --------------------
SQLALCHEMY_DATABASE_URL = "sqlite:///./productos.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------- MODELO SQLALCHEMY --------------------
class ProductoModel(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    precio = Column(Float, nullable=False)

Base.metadata.create_all(bind=engine)

# -------------------- SCHEMAS --------------------
class Producto(BaseModel):
    id: int
    nombre: str
    precio: float

    class Config:
        orm_mode = True

class ProductoCreate(BaseModel):
    nombre: str
    precio: float

# -------------------- APP --------------------
app = FastAPI()

# -------------------- CORS --------------------
origins = [
    "https://microtekdigital-dev.github.io",  # tu frontend
    "http://localhost:5500",                  # opcional local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- DEPENDENCIA DB --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- ENDPOINTS --------------------

# Crear producto
@app.post("/productos/", response_model=Producto)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    db_producto = ProductoModel(**producto.dict())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

# Listar productos
@app.get("/productos/", response_model=list[Producto])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(ProductoModel).all()

# Obtener producto
@app.get("/productos/{producto_id}", response_model=Producto)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

# Actualizar producto
@app.put("/productos/{producto_id}", response_model=Producto)
def actualizar_producto(producto_id: int, datos: ProductoCreate, db: Session = Depends(get_db)):
    producto = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto.nombre = datos.nombre
    producto.precio = datos.precio
    db.commit()
    db.refresh(producto)
    return producto

# Eliminar producto
@app.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado"}
