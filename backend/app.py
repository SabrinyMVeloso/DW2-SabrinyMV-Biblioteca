

from fastapi import FastAPI, HTTPException, status, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from models import Livro, StatusEnum
from database import SessionLocal, criar_tabelas
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
from seed import seed


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
	ano: int = Field(..., ge=1800, le=datetime.now().year)
	genero: str
	isbn: Optional[str] = None
	status: StatusEnum = StatusEnum.disponivel
	capa: Optional[str] = None


class LivroCreate(LivroBase):
	pass


class LivroUpdate(LivroBase):
	pass

class LivroOut(LivroBase):
	id: int
	data_emprestimo: Optional[datetime]
	capa: Optional[str]
	class Config:
		orm_mode = True

# Inicializar tabelas
criar_tabelas()
# Popula o banco automaticamente se estiver vazio
try:
	seed()
except Exception as e:
	print(f"[AVISO] Não foi possível rodar seed automaticamente: {e}")

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


# Pasta para uploads de capas
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'capas')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/livros", response_model=LivroOut, status_code=status.HTTP_201_CREATED)
async def criar_livro(
	titulo: str = Form(...),
	autor: str = Form(...),
	ano: int = Form(...),
	genero: str = Form(...),
	isbn: Optional[str] = Form(None),
	status: StatusEnum = Form(StatusEnum.disponivel),
	capa: Optional[UploadFile] = File(None),
	db: Session = Depends(get_db)
):
	if db.query(Livro).filter(Livro.titulo == titulo).first():
		raise HTTPException(status_code=400, detail="Título já cadastrado")
	nome_arquivo = None
	if capa:
		ext = os.path.splitext(capa.filename)[1].lower()
		nome_arquivo = f"capa_{titulo.replace(' ', '_')}_{int(datetime.now().timestamp())}{ext}"
		caminho = os.path.join(UPLOAD_DIR, nome_arquivo)
		with open(caminho, "wb") as f:
			f.write(await capa.read())
		print(f"[UPLOAD] Capa salva em: {caminho}")
	novo_livro = Livro(
		titulo=titulo,
		autor=autor,
		ano=ano,
		genero=genero,
		isbn=isbn,
		status=status,
		capa=nome_arquivo
	)
	db.add(novo_livro)
	db.commit()
	db.refresh(novo_livro)
	return novo_livro

# Servir arquivos de capa customizada
@app.get("/capas/{nome_capa}")
def get_capa(nome_capa: str):
	caminho = os.path.join(UPLOAD_DIR, nome_capa)
	if not os.path.exists(caminho):
		print(f"[CAPA] Tentativa de acessar capa inexistente: {caminho}")
		raise HTTPException(status_code=404, detail="Capa não encontrada")
	print(f"[CAPA] Servindo capa: {caminho}")
	return FileResponse(caminho)

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


@app.post("/livros/{livro_id}/capa", response_model=LivroOut)
async def upload_capa_livro(livro_id: int, capa: UploadFile = File(...), db: Session = Depends(get_db)):
	db_livro = db.query(Livro).filter(Livro.id == livro_id).first()
	if not db_livro:
		raise HTTPException(status_code=404, detail="Livro não encontrado")
	ext = os.path.splitext(capa.filename)[1].lower()
	nome_arquivo = f"capa_{db_livro.titulo.replace(' ', '_')}_{int(datetime.now().timestamp())}{ext}"
	caminho = os.path.join(UPLOAD_DIR, nome_arquivo)
	with open(caminho, "wb") as f:
		f.write(await capa.read())
	print(f"[UPLOAD] Capa atualizada para livro id={livro_id}: {caminho}")
	db_livro.capa = nome_arquivo
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
