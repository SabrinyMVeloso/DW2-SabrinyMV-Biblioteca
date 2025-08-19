
from sqlalchemy.orm import Session
from database import SessionLocal, criar_tabelas
from models import Livro, StatusEnum
from datetime import datetime

def seed():
	criar_tabelas()
	db: Session = SessionLocal()
	if db.query(Livro).count() > 0:
		print('Banco já populado.')
		db.close()
		return
	livros = [
		Livro(titulo="O Pequeno Príncipe", autor="Antoine de Saint-Exupéry", ano=1943, genero="Infantil", isbn="9788571650073", status=StatusEnum.disponivel),
		Livro(titulo="Dom Casmurro", autor="Machado de Assis", ano=1899, genero="Romance", isbn="9788535910665", status=StatusEnum.disponivel),
		Livro(titulo="1984", autor="George Orwell", ano=1949, genero="Distopia", isbn="9788532530781", status=StatusEnum.emprestado, data_emprestimo=datetime.utcnow()),
		Livro(titulo="A Menina que Roubava Livros", autor="Markus Zusak", ano=2005, genero="Drama", isbn="9788579800242", status=StatusEnum.disponivel),
		Livro(titulo="Harry Potter e a Pedra Filosofal", autor="J.K. Rowling", ano=1997, genero="Fantasia", isbn="9788532511018", status=StatusEnum.disponivel),
		Livro(titulo="O Hobbit", autor="J.R.R. Tolkien", ano=1937, genero="Fantasia", isbn="9788595084742", status=StatusEnum.emprestado, data_emprestimo=datetime.utcnow()),
		Livro(titulo="Capitães da Areia", autor="Jorge Amado", ano=1937, genero="Romance", isbn="9788520932300", status=StatusEnum.disponivel),
		Livro(titulo="O Alquimista", autor="Paulo Coelho", ano=1988, genero="Ficção", isbn="9788575422288", status=StatusEnum.disponivel),
		Livro(titulo="O Senhor dos Anéis", autor="J.R.R. Tolkien", ano=1954, genero="Fantasia", isbn="9788533613377", status=StatusEnum.disponivel),
		Livro(titulo="A Revolução dos Bichos", autor="George Orwell", ano=1945, genero="Sátira", isbn="9788535909553", status=StatusEnum.disponivel),
		Livro(titulo="Memórias Póstumas de Brás Cubas", autor="Machado de Assis", ano=1881, genero="Romance", isbn="9788535914847", status=StatusEnum.disponivel),
		Livro(titulo="O Cortiço", autor="Aluísio Azevedo", ano=1890, genero="Romance", isbn="9788508157278", status=StatusEnum.disponivel),
		Livro(titulo="Senhora", autor="José de Alencar", ano=1875, genero="Romance", isbn="9788508157285", status=StatusEnum.disponivel),
		Livro(titulo="A Moreninha", autor="Joaquim Manuel de Macedo", ano=1844, genero="Romance", isbn="9788508157292", status=StatusEnum.disponivel),
		Livro(titulo="O Primo Basílio", autor="Eça de Queirós", ano=1878, genero="Romance", isbn="9788508157308", status=StatusEnum.disponivel),
		Livro(titulo="O Guarani", autor="José de Alencar", ano=1857, genero="Romance", isbn="9788508157315", status=StatusEnum.disponivel),
		Livro(titulo="Iracema", autor="José de Alencar", ano=1865, genero="Romance", isbn="9788508157322", status=StatusEnum.disponivel),
		Livro(titulo="Vidas Secas", autor="Graciliano Ramos", ano=1938, genero="Romance", isbn="9788508157339", status=StatusEnum.disponivel),
		Livro(titulo="A Hora da Estrela", autor="Clarice Lispector", ano=1977, genero="Romance", isbn="9788535914847", status=StatusEnum.disponivel),
		Livro(titulo="O Auto da Compadecida", autor="Ariano Suassuna", ano=1955, genero="Comédia", isbn="9788508157346", status=StatusEnum.disponivel),
	]
	db.add_all(livros)
	db.commit()
	db.close()
	print('Banco populado com sucesso!')

if __name__ == "__main__":
	seed()
