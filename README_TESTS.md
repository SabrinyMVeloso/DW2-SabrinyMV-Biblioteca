Manual de Testes - Biblioteca Escolar

Objetivo
- Fornecer passos manuais claros para testar as principais funcionalidades do projeto: inicialização, listagem, busca, upload de capas, exclusão, exportação e comportamento do menu.

Pré-requisitos
- Python 3.10+ instalado e disponível no PATH.
- Recomendado: criar e ativar um ambiente virtual (venv) dentro do diretório `backend`.
- Dependências do backend instaladas: ver `backend/requirements.txt`.
- Permissões de escrita na pasta `frontend/capas`.

1) Iniciar serviços
- No PowerShell, a partir da raiz do repositório:

```powershell
# Executa o script que inicia backend (uvicorn) e frontend (servidor estático) e abre o navegador
.\start.ps1
```

- Alternativa manual:

```powershell
# Backend
cd backend
python -m pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000

# Em outra janela do PowerShell, na raiz do repositório
cd frontend
python -m http.server 5500
```

Acessar a interface: http://127.0.0.1:5500

2) Verificar backend está respondendo
- Abra no navegador:
  - http://127.0.0.1:8000/docs  (Swagger UI)
  - http://127.0.0.1:8000/redoc (Redoc)
- Resposta esperada para a raiz `/`: `{"detail":"Not Found"}` — isso indica o servidor está ativo, mas não tem rota para `/`.

3) Listagem e busca de livros
- Acesse a página principal (frontend). A lista de livros deve aparecer imediatamente.
- No PowerShell, testar diretamente a API:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/livros' -Method GET | ConvertTo-Json -Depth 5
```

4) Upload de capa ao cadastrar um novo livro
- No frontend, clique em "Adicionar Livro" (ou equivalente). Preencha título, autor, ano, gênero e selecione um arquivo de imagem para a capa.
- Submeter o formulário deve:
  - Criar um novo registro na API (código 200/201) e retornar o objeto do livro com o campo `capa` contendo o nome do arquivo salvo.
  - Gravar fisicamente o arquivo em `frontend/capas` (verifique a pasta e confirme o nome salvo).
- Passos de verificação no PowerShell se a imagem não carregar na UI:

```powershell
# Listar arquivos em frontend/capas
Get-ChildItem -Path '.\frontend\capas' | Select Name,Length,LastWriteTime

# Verificar o objeto retornado pelo GET /livros (o novo livro deve conter o nome em "capa")
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/livros' -Method GET | ConvertTo-Json -Depth 5
```

- Se o frontend mostrar 404 para a imagem, verifique se o nome em `capa` corresponde exatamente ao arquivo em `frontend/capas`.

5) Exclusão de livro
- No cartão do livro, clique em "Excluir". A ação atual usa `confirm()` do browser.
- Resultado esperado: remoção do registro (verifique `GET /livros`) e atualização da lista no frontend.
- Nota: por enquanto a exclusão do registro não remove o arquivo de capa do disco.

6) Exportação CSV / JSON
- Na UI, use os botões de exportar para baixar a lista atual como CSV ou JSON.
- Para CSV abrir no Excel, se houver problemas de codificação, abrir com importação de texto e selecionar UTF-8.

7) Menu (drawer)
- Clique no botão com ícone ☰ para abrir/fechar o menu lateral.
- O menu deve estar oculto por padrão; o overlay deve aparecer ao abrir e ESC deve fechar o menu.

8) Reiniciar DB / Atualizar esquema
- Se fez alterações no `backend/models.py` (por ex. adicionou campo `capa`), você pode recriar o banco removendo `backend/app.db` e executando `backend/seed.py`:

```powershell
# Atenção: isto apagará os dados atuais
Remove-Item -Path '.\backend\app.db'
python .\backend\seed.py
```

- Alternativa recomendada: usar Alembic para migrações incrementais (não incluído no projeto atualmente).

9) Logs e diagnóstico
- Verifique a saída do terminal onde o backend (uvicorn) foi iniciado. Mensagens de upload/servir capas são impressas para facilitar o diagnóstico.

10) Teste completo (checklist rápido)
- [ ] Backend e frontend iniciam sem erros
- [ ] GET /livros retorna lista correta
- [ ] Upload grava arquivo em `frontend/capas` e UI exibe a capa
- [ ] Exclusão remove o registro e atualiza UI
- [ ] Exportação CSV/JSON funciona
- [ ] Menu abre/fecha corretamente e ESC fecha o menu

Se quiser, eu posso:
- Implementar remoção do arquivo de capa ao deletar o livro (faço a mudança no backend agora),
- Substituir a `confirm()` por um modal estilizado,
- Tornar os scripts de start mais robustos (aguardar backend antes de abrir browser),
- Escrever testes automatizados básicos.

Marque a opção que prefere e eu começo a trabalhar nela.
