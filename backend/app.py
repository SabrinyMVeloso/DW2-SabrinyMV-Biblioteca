

from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from models import Livro, StatusEnum
from database import SessionLocal, criar_tabelas
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Configuração de CORS para permitir acesso do frontend
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],  # Em produção, especifique o domínio do frontend
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Dependência para obter sessão do banco
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()

# Pydantic Schemas
class LivroBase(BaseModel):
	titulo: str = Field(..., min_length=3, max_length=90)
	autor: str
	ano: int = Field(..., ge=1900, le=datetime.now().year)
	genero: str
	isbn: Optional[str] = None
	status: StatusEnum = StatusEnum.disponivel

class LivroCreate(LivroBase):
	pass

class LivroUpdate(LivroBase):
	pass

class LivroOut(LivroBase):
	id: int
	data_emprestimo: Optional[datetime]
	class Config:
		orm_mode = True

# Inicializar tabelas
criar_tabelas()

# Rotas CRUD
@app.get("/livros", response_model=List[LivroOut])
def listar_livros(db: Session = Depends(get_db)):
	return db.query(Livro).all()

@app.get("/livros/{livro_id}", response_model=LivroOut)
def obter_livro(livro_id: int, db: Session = Depends(get_db)):
	livro = db.query(Livro).filter(Livro.id == livro_id).first()
	if not livro:
		raise HTTPException(status_code=404, detail="Livro não encontrado")
	return livro

@app.post("/livros", response_model=LivroOut, status_code=status.HTTP_201_CREATED)
def criar_livro(livro: LivroCreate, db: Session = Depends(get_db)):
	if db.query(Livro).filter(Livro.titulo == livro.titulo).first():
		raise HTTPException(status_code=400, detail="Título já cadastrado")
	novo_livro = Livro(**livro.dict())
	db.add(novo_livro)
	db.commit()
	db.refresh(novo_livro)
	return novo_livro

@app.put("/livros/{livro_id}", response_model=LivroOut)
def atualizar_livro(livro_id: int, livro: LivroUpdate, db: Session = Depends(get_db)):
	db_livro = db.query(Livro).filter(Livro.id == livro_id).first()
	if not db_livro:
		raise HTTPException(status_code=404, detail="Livro não encontrado")
	for key, value in livro.dict().items():
		setattr(db_livro, key, value)
	db.commit()
	db.refresh(db_livro)
	return db_livro

@app.delete("/livros/{livro_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_livro(livro_id: int, db: Session = Depends(get_db)):
	db_livro = db.query(Livro).filter(Livro.id == livro_id).first()
	if not db_livro:
		raise HTTPException(status_code=404, detail="Livro não encontrado")
	db.delete(db_livro)
	db.commit()
	return

# Empréstimo
@app.post("/livros/{livro_id}/emprestar", response_model=LivroOut)
def emprestar_livro(livro_id: int, db: Session = Depends(get_db)):
	livro = db.query(Livro).filter(Livro.id == livro_id).first()
	if not livro:
		raise HTTPException(status_code=404, detail="Livro não encontrado")
	if livro.status == StatusEnum.emprestado:
		raise HTTPException(status_code=400, detail="Livro já está emprestado")
	livro.status = StatusEnum.emprestado
	livro.data_emprestimo = datetime.utcnow()
	db.commit()
	db.refresh(livro)
	return livro

# Devolução
@app.post("/livros/{livro_id}/devolver", response_model=LivroOut)
def devolver_livro(livro_id: int, db: Session = Depends(get_db)):
	livro = db.query(Livro).filter(Livro.id == livro_id).first()
	if not livro:
		raise HTTPException(status_code=404, detail="Livro não encontrado")
	if livro.status == StatusEnum.disponivel:
		raise HTTPException(status_code=400, detail="Livro já está disponível")
	livro.status = StatusEnum.disponivel
	livro.data_emprestimo = None
	db.commit()
	db.refresh(livro)
	return livro
