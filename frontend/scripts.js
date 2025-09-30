// Toast de feedback
const toast = document.getElementById('toast');
function mostrarToast(msg, tipo = 'sucesso') {
	if (!toast) return;
	toast.textContent = msg;
	toast.className = 'toast ' + tipo;
	toast.style.display = 'block';
	setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
// Exportação CSV/JSON
const btnExportarCSV = document.getElementById('exportar-csv');
const btnExportarJSON = document.getElementById('exportar-json');

function getLivrosFiltrados() {
	let filtrados = [...livrosOriginais];
	const genero = filtroGenero.value;
	const ano = filtroAno.value;
	const status = filtroStatus.value;
	const busca = searchInput.value.trim().toLowerCase();
	if (genero) filtrados = filtrados.filter(l => l.genero === genero);
	if (ano) filtrados = filtrados.filter(l => String(l.ano) === String(ano));
	if (status) filtrados = filtrados.filter(l => l.status === status);
	if (busca) filtrados = filtrados.filter(l =>
		l.titulo.toLowerCase().includes(busca) ||
		l.autor.toLowerCase().includes(busca)
	);
	// Ordenação igual à tela
	filtrados.sort((a, b) => {
		if (ordenacao.campo === 'titulo') {
			if (a.titulo.toLowerCase() < b.titulo.toLowerCase()) return ordenacao.inverso ? 1 : -1;
			if (a.titulo.toLowerCase() > b.titulo.toLowerCase()) return ordenacao.inverso ? -1 : 1;
			return 0;
		} else if (ordenacao.campo === 'ano') {
			return ordenacao.inverso ? a.ano - b.ano : b.ano - a.ano;
		}
		return 0;
	});
	return filtrados;
}

function exportarCSV() {
	const livros = getLivrosFiltrados();
	if (!livros.length) {
		mostrarToast('Nenhum livro para exportar', 'erro');
		return;
	}
	const campos = ['titulo', 'autor', 'ano', 'genero', 'isbn', 'status', 'id'];
	const header = campos.map(h => '"' + h + '"').join(',');
	const rows = livros.map(l => campos.map(c => '"' + String(l[c] ?? '').replace(/"/g, '""') + '"').join(','));
	// BOM para Excel em UTF-8
	const bom = '\uFEFF';
	const csv = bom + [header].concat(rows).join('\r\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'livros.csv';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	mostrarToast('Exportado CSV com sucesso', 'sucesso');
}

function exportarJSON() {
	const livros = getLivrosFiltrados();
	if (!livros.length) {
		mostrarToast('Nenhum livro para exportar', 'erro');
		return;
	}
	// Exporta somente campos públicos desejados
	const campos = ['titulo', 'autor', 'ano', 'genero', 'isbn', 'status', 'id'];
	const dados = livros.map(l => {
		const obj = {};
		campos.forEach(c => obj[c] = l[c] ?? null);
		return obj;
	});
	const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'livros.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	mostrarToast('Exportado JSON com sucesso', 'sucesso');
}

if (btnExportarCSV) btnExportarCSV.addEventListener('click', exportarCSV);
if (btnExportarJSON) btnExportarJSON.addEventListener('click', exportarJSON);
// Modal Novo Livro
const modalNovoLivro = document.getElementById('modal-novo-livro');
const btnNovoLivro = document.getElementById('novo-livro-btn');
const btnFecharModal = document.getElementById('fechar-modal-novo');
const formNovoLivro = document.getElementById('form-novo-livro');
const erroForm = document.getElementById('erro-form');

function abrirModalNovoLivro() {
	formNovoLivro.reset();
	erroForm.textContent = '';
	modalNovoLivro.style.display = 'flex';
	setTimeout(() => formNovoLivro.titulo.focus(), 100);
}
function fecharModalNovoLivro() {
	modalNovoLivro.style.display = 'none';
}
if (btnNovoLivro) btnNovoLivro.addEventListener('click', abrirModalNovoLivro);
if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModalNovoLivro);
window.addEventListener('keydown', e => {
	if (modalNovoLivro.style.display === 'flex' && e.key === 'Escape') fecharModalNovoLivro();
});

// Atalho de teclado Alt+N
window.addEventListener('keydown', e => {
	if (e.altKey && e.key.toLowerCase() === 'n') {
		abrirModalNovoLivro();
		e.preventDefault();
	}
});

// Validação e envio do formulário
formNovoLivro.addEventListener('submit', async function (e) {
	e.preventDefault();
	erroForm.textContent = '';
	const titulo = formNovoLivro.titulo.value.trim();
	const autor = formNovoLivro.autor.value.trim();
	const ano = Number(formNovoLivro.ano.value);
	const genero = formNovoLivro.genero.value.trim();
	const isbn = formNovoLivro.isbn.value.trim();
	const status = formNovoLivro.status.value;
	const capaFile = formNovoLivro.capa.files[0];
	// Validações front-end
	if (titulo.length < 3 || titulo.length > 90) {
		erroForm.textContent = 'Título deve ter entre 3 e 90 caracteres.';
		formNovoLivro.titulo.focus();
		return;
	}
	if (!autor) {
		erroForm.textContent = 'Autor é obrigatório.';
		formNovoLivro.autor.focus();
		return;
	}
	const anoAtual = new Date().getFullYear();
	if (ano < 1900 || ano > anoAtual) {
		erroForm.textContent = `Ano deve ser entre 1900 e ${anoAtual}.`;
		formNovoLivro.ano.focus();
		return;
	}
	if (!genero) {
		erroForm.textContent = 'Gênero é obrigatório.';
		formNovoLivro.genero.focus();
		return;
	}
	if (livrosOriginais.some(l => l.titulo.toLowerCase() === titulo.toLowerCase())) {
		erroForm.textContent = 'Já existe um livro com esse título.';
		formNovoLivro.titulo.focus();
		return;
	}
	// Enviar para API (FormData)
	try {
		const formData = new FormData();
		formData.append('titulo', titulo);
		formData.append('autor', autor);
		formData.append('ano', ano);
		formData.append('genero', genero);
		formData.append('isbn', isbn);
		formData.append('status', status);
		if (capaFile) formData.append('capa', capaFile);
		const resp = await fetch(API_URL, {
			method: 'POST',
			body: formData
		});
		if (!resp.ok) {
			const erro = await resp.json();
			throw new Error(erro.detail || 'Erro ao cadastrar livro');
		}
		fecharModalNovoLivro();
		mostrarToast('Livro cadastrado com sucesso!', 'sucesso');
		await carregarLivros();
	} catch (err) {
		erroForm.textContent = err.message;
		mostrarToast(err.message, 'erro');
	}
});


// URL da API backend
const API_URL = 'http://127.0.0.1:8000/livros';
// Base da API (usada para servir capas enviadas ao backend)
const API_BASE = API_URL.replace(/\/livros\/?$/i, '');

// Elementos DOM
const listaLivros = document.getElementById('livros-lista');
const filtroGenero = document.getElementById('filtro-genero');
const filtroAno = document.getElementById('filtro-ano');
const filtroStatus = document.getElementById('filtro-status');
const searchInput = document.getElementById('search');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
const overlayMenu = document.getElementById('overlay-menu');



let livrosOriginais = [];
let ordenacao = {
	campo: localStorage.getItem('ordenarPor') || 'titulo',
	inverso: localStorage.getItem('ordenarInverso') === 'true' || false
};
let paginaAtual = 1;
const livrosPorPagina = 10;

const ordenarPorSelect = document.getElementById('ordenar-por');
const inverterOrdemBtn = document.getElementById('inverter-ordem');
const paginacaoInfo = document.getElementById('paginacao-info');
const btnAnterior = document.getElementById('pagina-anterior');
const btnProxima = document.getElementById('pagina-proxima');

// Buscar e exibir livros
async function carregarLivros() {
	try {
		const resp = await fetch(API_URL);
		if (!resp.ok) throw new Error('Erro ao buscar livros');
		livrosOriginais = await resp.json();
		preencherFiltros(livrosOriginais);
		aplicarFiltros();
	} catch (e) {
		listaLivros.innerHTML = `<p style="color:#b91c1c">${e.message}</p>`;
	}
}

// Exibir livros na tela
function exibirLivros(livros) {
	if (!livros.length) {
		listaLivros.innerHTML = '<p>Nenhum livro encontrado.</p>';
		return;
	}
	listaLivros.innerHTML = livros.map(livro => {
		let nomeCapa = 'sem-capa.png';
		// Mapeamento de capa, gênero e ano para livros conhecidos
		const map = {
			'O Pequeno Príncipe': {capa: 'pequeno-principe.webp', genero: 'Infantojuvenil', ano: 1943},
			'Dom Casmurro': {capa: 'dom-casmurro.jpg', genero: 'Clássico', ano: 1899},
			'1984': {capa: '1984.jpg', genero: 'Distopia', ano: 1949},
			'A Menina que Roubava Livros': {capa: 'menina-que-roubava-livros.jpg', genero: 'Drama', ano: 2005},
			'Harry Potter e a Pedra Filosofal': {capa: 'harry-potter.jpg', genero: 'Fantasia', ano: 1997},
			'O Hobbit': {capa: 'o-hobbit.jpg', genero: 'Fantasia', ano: 1937},
			'Capitães da Areia': {capa: 'capitaes-da-areia.jpg', genero: 'Drama', ano: 1937},
			'O Alquimista': {capa: 'o-alquimista.jpg', genero: 'Aventura', ano: 1988},
			'O Senhor dos Anéis': {capa: 'senhor-dos-aneis.webp', genero: 'Fantasia', ano: 1954},
			'A Revolução dos Bichos': {capa: 'revolucao-dos-bichos.jpg', genero: 'Distopia', ano: 1945}
		};
		if (livro.capa) {
			// usar URL do backend para capas customizadas
			nomeCapa = `${API_BASE}/capas/${livro.capa}`;
		} else if (map[livro.titulo]) {
			// carregar também pelo backend, para consistência entre capas customizadas e as estáticas
			nomeCapa = `${API_BASE}/capas/${map[livro.titulo].capa}`;
			if (!livro.genero || livro.genero === 'Outros') livro.genero = map[livro.titulo].genero;
			if (!livro.ano) livro.ano = map[livro.titulo].ano;
		} else {
			// usar sem-capa via backend também
			nomeCapa = `${API_BASE}/capas/sem-capa.png`;
			if (!livro.genero) livro.genero = 'Outros';
		}
		return `
		<div class="livro-card" tabindex="0" aria-label="Livro: ${livro.titulo}">
			<img src="${nomeCapa}" alt="Capa do livro ${livro.titulo}" class="capa-livro" style="width:100px; height:auto; align-self:center; border-radius:6px; box-shadow:0 2px 8px #0001; margin-bottom:0.7em;" />
			<div class="titulo">${livro.titulo}</div>
			<div class="autor">${livro.autor}</div>
			<div class="ano">Ano: ${livro.ano}</div>
			<div class="genero">Gênero: ${livro.genero}</div>
			<div class="status ${livro.status}">Status: ${livro.status}</div>
			<button class="btn-emprestimo" data-id="${livro.id}" data-status="${livro.status}">
				${livro.status === 'disponível' ? 'Emprestar' : 'Devolver'}
			</button>
			<button class="btn-excluir" data-id="${livro.id}" aria-label="Excluir livro ${livro.titulo}">Excluir</button>
		</div>
		`;
	}).join('');
	// Adicionar eventos aos botões de empréstimo/devolução
	document.querySelectorAll('.btn-emprestimo').forEach(btn => {
		btn.addEventListener('click', abrirModalEmprestimo);
	});
	// Adicionar eventos aos botões de exclusão
	document.querySelectorAll('.btn-excluir').forEach(btn => {
		btn.addEventListener('click', async (e) => {
			e.stopPropagation();
			const id = btn.getAttribute('data-id');
			if (!id) return;
			try {
				const confirmado = await pedirConfirmacao(`Confirma exclusão deste livro? Esta ação não pode ser desfeita.`);
				if (!confirmado) return;
				const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
				if (!resp.ok) {
					const err = await resp.json().catch(() => ({}));
					throw new Error(err.detail || 'Erro ao excluir livro');
				}
				mostrarToast('Livro excluído com sucesso', 'sucesso');
				await carregarLivros();
			} catch (err) {
				mostrarToast(err.message || 'Erro ao excluir', 'erro');
			}
		});
	});

// Modal de confirmação acessível (retorna Promise<boolean>)
const modalConfirmacao = document.getElementById('modal-confirmacao');
const textoModalConfirmacao = document.getElementById('texto-modal-confirmacao');
const btnConfirmarAcao = document.getElementById('confirmar-acao');
const btnCancelarAcao = document.getElementById('cancelar-acao');

function pedirConfirmacao(mensagem) {
    return new Promise((resolve) => {
        if (!modalConfirmacao) {
            // fallback para confirm()
            resolve(window.confirm(mensagem));
            return;
        }
        textoModalConfirmacao.textContent = mensagem;
        modalConfirmacao.style.display = 'flex';
        // foco no botão cancelar por acessibilidade (evita ativação acidental)
        btnCancelarAcao.focus();

        function limparHandlers() {
            btnConfirmarAcao.removeEventListener('click', onConfirm);
            btnCancelarAcao.removeEventListener('click', onCancel);
            window.removeEventListener('keydown', onKey);
        }

        function onConfirm() {
            limparHandlers();
            modalConfirmacao.style.display = 'none';
            resolve(true);
        }

        function onCancel() {
            limparHandlers();
            modalConfirmacao.style.display = 'none';
            resolve(false);
        }

        function onKey(e) {
            if (e.key === 'Escape') {
                onCancel();
            }
        }

        btnConfirmarAcao.addEventListener('click', onConfirm);
        btnCancelarAcao.addEventListener('click', onCancel);
        window.addEventListener('keydown', onKey);
    });
}
}

// Modal Empréstimo/Devolução
const modalEmprestimo = document.getElementById('modal-emprestimo');
const textoModalEmprestimo = document.getElementById('texto-modal-emprestimo');
const btnConfirmarEmprestimo = document.getElementById('confirmar-emprestimo');
const btnCancelarEmprestimo = document.getElementById('cancelar-emprestimo');
const erroEmprestimo = document.getElementById('erro-emprestimo');
let livroSelecionado = null;
let acaoEmprestimo = null;

function abrirModalEmprestimo(e) {
	const btn = e.currentTarget;
	const id = btn.getAttribute('data-id');
	const status = btn.getAttribute('data-status');
	livroSelecionado = id;
	acaoEmprestimo = status === 'disponível' ? 'emprestar' : 'devolver';
	textoModalEmprestimo.textContent = status === 'disponível'
		? 'Deseja emprestar este livro?'
		: 'Deseja devolver este livro?';
	erroEmprestimo.textContent = '';
	modalEmprestimo.style.display = 'flex';
	btnConfirmarEmprestimo.focus();
}
function fecharModalEmprestimo() {
	modalEmprestimo.style.display = 'none';
	livroSelecionado = null;
	acaoEmprestimo = null;
}
if (btnCancelarEmprestimo) btnCancelarEmprestimo.addEventListener('click', fecharModalEmprestimo);
window.addEventListener('keydown', e => {
	if (modalEmprestimo.style.display === 'flex' && e.key === 'Escape') fecharModalEmprestimo();
});

if (btnConfirmarEmprestimo) btnConfirmarEmprestimo.addEventListener('click', async function () {
	if (!livroSelecionado || !acaoEmprestimo) return;
	erroEmprestimo.textContent = '';
	try {
		const resp = await fetch(`${API_URL}/${livroSelecionado}/${acaoEmprestimo}`, { method: 'POST' });
		if (!resp.ok) {
			const erro = await resp.json();
			throw new Error(erro.detail || 'Erro na operação');
		}
		fecharModalEmprestimo();
		mostrarToast('Operação realizada com sucesso!', 'sucesso');
		await carregarLivros();
	} catch (err) {
		erroEmprestimo.textContent = err.message;
		mostrarToast(err.message, 'erro');
	}
});

// Preencher filtros de gênero e ano
function preencherFiltros(livros) {
	// Gêneros fixos (já no HTML)
	// Anos presentes nos livros, ordenados decrescente
	let anosUnicos = [...new Set(livros.map(l => l.ano))].sort((a, b) => b - a);
	filtroAno.innerHTML = '<option value="">Todos</option>' + anosUnicos.map(a => `<option value="${a}">${a}</option>`).join('');
}



// Aplicar filtros, busca, ordenação e paginação
function aplicarFiltros() {
	let filtrados = [...livrosOriginais];
	const genero = filtroGenero.value;
	const ano = filtroAno.value;
	const status = filtroStatus.value;
	const busca = searchInput.value.trim().toLowerCase();

	if (genero) filtrados = filtrados.filter(l => l.genero === genero);
	if (ano) filtrados = filtrados.filter(l => String(l.ano) === ano);
	if (status) filtrados = filtrados.filter(l => l.status === status);
	if (busca) filtrados = filtrados.filter(l =>
		l.titulo.toLowerCase().includes(busca) ||
		l.autor.toLowerCase().includes(busca)
	);

	// Ordenação
	filtrados.sort((a, b) => {
		if (ordenacao.campo === 'titulo') {
			if (a.titulo.toLowerCase() < b.titulo.toLowerCase()) return ordenacao.inverso ? 1 : -1;
			if (a.titulo.toLowerCase() > b.titulo.toLowerCase()) return ordenacao.inverso ? -1 : 1;
			return 0;
		} else if (ordenacao.campo === 'ano') {
			return ordenacao.inverso ? a.ano - b.ano : b.ano - a.ano;
		}
		return 0;
	});

	// Paginação
	const totalLivros = filtrados.length;
	const totalPaginas = Math.ceil(totalLivros / livrosPorPagina) || 1;
	if (paginaAtual > totalPaginas) {
		paginaAtual = totalPaginas;
		// Reaplica para garantir que não mostre página vazia
		aplicarFiltros();
		return;
	}
	const inicio = (paginaAtual - 1) * livrosPorPagina;
	const fim = inicio + livrosPorPagina;
	const paginaLivros = filtrados.slice(inicio, fim);
	exibirLivros(paginaLivros);
	atualizarPaginacao(paginaAtual, totalPaginas, totalLivros);
}

function atualizarPaginacao(pagina, totalPaginas, totalLivros) {
	if (paginacaoInfo) {
		paginacaoInfo.textContent = `Página ${pagina} de ${totalPaginas} (${totalLivros} livros)`;
	}
	if (btnAnterior) btnAnterior.disabled = pagina <= 1;
	if (btnProxima) btnProxima.disabled = pagina >= totalPaginas;
}

if (btnAnterior && btnProxima) {
	btnAnterior.addEventListener('click', () => {
		if (paginaAtual > 1) {
			paginaAtual--;
			aplicarFiltros();
		}
	});
	btnProxima.addEventListener('click', () => {
		paginaAtual++;
		aplicarFiltros();
	});
}

// Sempre que filtros mudam, volta para página 1
function resetarPaginacao() {
	paginaAtual = 1;
}
filtroGenero.addEventListener('change', () => { resetarPaginacao(); aplicarFiltros(); });
filtroAno.addEventListener('change', () => { resetarPaginacao(); aplicarFiltros(); });
filtroStatus.addEventListener('change', () => { resetarPaginacao(); aplicarFiltros(); });
searchInput.addEventListener('input', () => { resetarPaginacao(); aplicarFiltros(); });

// Eventos de ordenação
if (ordenarPorSelect && inverterOrdemBtn) {
	ordenarPorSelect.value = ordenacao.campo;
	inverterOrdemBtn.setAttribute('aria-pressed', ordenacao.inverso);

	ordenarPorSelect.addEventListener('change', () => {
		ordenacao.campo = ordenarPorSelect.value;
		localStorage.setItem('ordenarPor', ordenacao.campo);
		aplicarFiltros();
	});
	inverterOrdemBtn.addEventListener('click', () => {
		ordenacao.inverso = !ordenacao.inverso;
		localStorage.setItem('ordenarInverso', ordenacao.inverso);
		inverterOrdemBtn.setAttribute('aria-pressed', ordenacao.inverso);
		aplicarFiltros();
	});
}

// Eventos de filtro e busca
filtroGenero.addEventListener('change', aplicarFiltros);
filtroAno.addEventListener('change', aplicarFiltros);
filtroStatus.addEventListener('change', aplicarFiltros);
searchInput.addEventListener('input', aplicarFiltros);

// Inicialização
window.addEventListener('DOMContentLoaded', carregarLivros);

// Menu toggle behavior
if (menuToggle && sidebar && overlayMenu) {
	function openMenu() {
		sidebar.classList.add('open');
		overlayMenu.classList.add('active');
		overlayMenu.setAttribute('aria-hidden', 'false');
		menuToggle.setAttribute('aria-pressed', 'true');
	}
	function closeMenu() {
		sidebar.classList.remove('open');
		overlayMenu.classList.remove('active');
		overlayMenu.setAttribute('aria-hidden', 'true');
		menuToggle.setAttribute('aria-pressed', 'false');
	}
	// ensure aria defaults
	overlayMenu.setAttribute('aria-hidden', 'true');
	menuToggle.setAttribute('aria-pressed', 'false');
	menuToggle.addEventListener('click', () => {
		const opened = sidebar.classList.contains('open');
		if (opened) {
			closeMenu();
			document.body.classList.remove('sidebar-open');
		} else {
			openMenu();
			document.body.classList.add('sidebar-open');
		}
	});
	overlayMenu.addEventListener('click', closeMenu);
	window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}
