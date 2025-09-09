# Relatório Técnico

## 1. Arquitetura do Sistema

```
[Usuário]
   ↓
[index.html / scripts.js]
   ↓ (fetch)
[FastAPI (app.py)]
   ↓ (SQLAlchemy)
[SQLite (app.db)]
```

- O usuário interage pelo navegador (HTML/CSS/JS).
- O frontend faz requisições REST para o backend FastAPI.
- O backend processa, valida e acessa o banco SQLite via SQLAlchemy.
- As respostas são retornadas em JSON.

## 2. Tecnologias e Versões

- Python 3.13+
- FastAPI
- SQLAlchemy
- SQLite
- HTML5, CSS3 (Flex/Grid), JavaScript ES6+
- Extensões VSCode: Copilot, Python, Thunder Client

## 3. Prompts do Copilot

- "Crie um CRUD de livros com FastAPI e SQLAlchemy."
- "Implemente filtros combinados de gênero, ano e status."
- "Adicione paginação e ordenação persistida no localStorage."
- "Valide campos do formulário no front e back."
- "Implemente exportação CSV/JSON da lista filtrada."
- "Adicione toast de feedback visual para erros e sucesso."

> Trechos aceitos/editados: (descreva exemplos de código gerado, o que foi ajustado e por quê)

## 4. Peculiaridades Implementadas

- Acessibilidade real: tabindex, aria-label, foco visível, contraste, navegação por teclado.
- Filtro avançado: múltiplos critérios sem recarregar.
- Ordenação persistida: localStorage.
- Paginação.
- Exportação CSV/JSON.
- Toasts/feedback visual.
- Seed script com 20 livros plausíveis.

## 5. Validações

- Front-end: campos obrigatórios, tamanho, ano, título duplicado.
- Back-end: validações espelhadas, mensagens de erro claras.

## 6. Acessibilidade

- Uso de aria-label nos cards e botões.
- Foco visível em modais e botões.
- Contraste mínimo 4.5:1 nas cores.
- Navegação por teclado (tabindex, atalhos).

## 7. Como rodar o sistema

1. Instale as dependências do backend:
   ```
   cd backend
   python -m pip install -r requirements.txt
   ```
2. Rode o seed para popular o banco:
   ```
   python seed.py
   ```
3. Inicie o backend:
   ```
   uvicorn app:app --reload
   ```
4. Abra o arquivo `frontend/index.html` no navegador.

## 8. Prints/GIFs de funcionamento

### Prints/GIFs de funcionamento

Adicione aqui imagens do sistema rodando:

- Catálogo de livros
- Filtros aplicados
- Modal de novo livro
- Modal de empréstimo/devolução
- Exportação CSV/JSON
- Toasts de feedback
- Paginação
- Acessibilidade (foco, contraste, navegação por teclado)

**Como adicionar prints:**
1. Capture a tela usando a tecla `Print Screen` ou a ferramenta de captura do Windows.
2. Salve a imagem na pasta do projeto (ex: `prints/`).
3. Insira o print aqui usando a sintaxe:
   `![Descrição](../prints/nome-do-arquivo.png)`

**Como adicionar GIFs:**
1. Grave a tela usando uma ferramenta como ScreenToGif ou ShareX.
2. Salve o GIF na pasta do projeto.
3. Insira o GIF aqui usando a sintaxe:
   `![Descrição](../prints/nome-do-arquivo.gif)`

## 9. Limitações e Melhorias Futuras

- Upload de capas customizadas.
- Autenticação de usuários.
- Relatórios avançados.
- Tema escuro.

---

> Preencha os trechos de prompts, prints e exemplos conforme sua experiência real no desenvolvimento.
