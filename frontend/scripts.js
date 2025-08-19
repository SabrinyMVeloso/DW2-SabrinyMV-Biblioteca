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
	if (ano) filtrados = filtrados.filter(l => String(l.ano) === ano);
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
	if (!livros.length) return;
	const header = Object.keys(livros[0]);
	const csv = [header.join(',')].concat(
		livros.map(l => header.map(h => '"'+String(l[h]).replace(/"/g,'""')+'"').join(','))
	).join('\r\n');
	const blob = new Blob([csv], {type: 'text/csv'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'livros.csv';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function exportarJSON() {
	const livros = getLivrosFiltrados();
	if (!livros.length) return;
	const blob = new Blob([JSON.stringify(livros, null, 2)], {type: 'application/json'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'livros.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
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
formNovoLivro.addEventListener('submit', async function(e) {
	e.preventDefault();
	erroForm.textContent = '';
	const dados = {
		titulo: formNovoLivro.titulo.value.trim(),
		autor: formNovoLivro.autor.value.trim(),
		ano: Number(formNovoLivro.ano.value),
		genero: formNovoLivro.genero.value.trim(),
		isbn: formNovoLivro.isbn.value.trim(),
		status: formNovoLivro.status.value
	};
	// Validações front-end
	if (dados.titulo.length < 3 || dados.titulo.length > 90) {
		erroForm.textContent = 'Título deve ter entre 3 e 90 caracteres.';
		formNovoLivro.titulo.focus();
		return;
	}
	if (!dados.autor) {
		erroForm.textContent = 'Autor é obrigatório.';
		formNovoLivro.autor.focus();
		return;
	}
	const anoAtual = new Date().getFullYear();
	if (dados.ano < 1900 || dados.ano > anoAtual) {
		erroForm.textContent = `Ano deve ser entre 1900 e ${anoAtual}.`;
		formNovoLivro.ano.focus();
		return;
	}
	if (!dados.genero) {
		erroForm.textContent = 'Gênero é obrigatório.';
		formNovoLivro.genero.focus();
		return;
	}
	// Impedir título duplicado no array local
	if (livrosOriginais.some(l => l.titulo.toLowerCase() === dados.titulo.toLowerCase())) {
		erroForm.textContent = 'Já existe um livro com esse título.';
		formNovoLivro.titulo.focus();
		return;
	}
	// Enviar para API
	try {
		const resp = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dados)
		});
		if (!resp.ok) {
			const erro = await resp.json();
			throw new Error(erro.detail || 'Erro ao cadastrar livro');
		}
		fecharModalNovoLivro();
		await carregarLivros();
	} catch (err) {
		erroForm.textContent = err.message;
	}
});


// URL da API backend
const API_URL = 'http://localhost:8000/livros';

// Elementos DOM
const listaLivros = document.getElementById('livros-lista');
const filtroGenero = document.getElementById('filtro-genero');
const filtroAno = document.getElementById('filtro-ano');
const filtroStatus = document.getElementById('filtro-status');
const searchInput = document.getElementById('search');



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
	listaLivros.innerHTML = livros.map(livro => `
		<div class="livro-card" tabindex="0" aria-label="Livro: ${livro.titulo}">
			<div class="titulo">${livro.titulo}</div>
			<div class="autor">${livro.autor}</div>
			<div class="ano">Ano: ${livro.ano}</div>
			<div class="genero">Gênero: ${livro.genero}</div>
			<div class="status ${livro.status}">Status: ${livro.status}</div>
			<button class="btn-emprestimo" data-id="${livro.id}" data-status="${livro.status}">
				${livro.status === 'disponível' ? 'Emprestar' : 'Devolver'}
			</button>
		</div>
	`).join('');
	// Adicionar eventos aos botões de empréstimo/devolução
	document.querySelectorAll('.btn-emprestimo').forEach(btn => {
		btn.addEventListener('click', abrirModalEmprestimo);
	});
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

if (btnConfirmarEmprestimo) btnConfirmarEmprestimo.addEventListener('click', async function() {
	if (!livroSelecionado || !acaoEmprestimo) return;
	erroEmprestimo.textContent = '';
	try {
		const resp = await fetch(`${API_URL}/${livroSelecionado}/${acaoEmprestimo}`, { method: 'POST' });
		if (!resp.ok) {
			const erro = await resp.json();
			throw new Error(erro.detail || 'Erro na operação');
		}
		fecharModalEmprestimo();
		await carregarLivros();
	} catch (err) {
		erroEmprestimo.textContent = err.message;
	}
});

// Preencher filtros de gênero e ano
function preencherFiltros(livros) {
	// Gêneros
	const generos = [...new Set(livros.map(l => l.genero))].sort();
	filtroGenero.innerHTML = '<option value="">Todos</option>' + generos.map(g => `<option value="${g}">${g}</option>`).join('');
	// Anos
	const anos = [...new Set(livros.map(l => l.ano))].sort((a,b) => b-a);
	filtroAno.innerHTML = '<option value="">Todos</option>' + anos.map(a => `<option value="${a}">${a}</option>`).join('');
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
	if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
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
