
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class StatusEnum(enum.Enum):
	disponivel = "disponível"
	emprestado = "emprestado"

class Livro(Base):
	__tablename__ = "livros"
	id = Column(Integer, primary_key=True, index=True)
	titulo = Column(String(90), nullable=False, unique=True)
	autor = Column(String(90), nullable=False)
	ano = Column(Integer, nullable=False)
	genero = Column(String(50), nullable=False)
	isbn = Column(String(20), nullable=True)
	status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.disponivel)
	data_emprestimo = Column(DateTime, nullable=True)
	capa = Column(String(120), nullable=True)  # nome do arquivo da capa customizada
