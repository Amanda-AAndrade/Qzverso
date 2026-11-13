/* ============================================================
   QZVERSO — CONTROLADOR DO FRONT-END
   Interface estática com integração de API opcional.
   ============================================================ */

const API_URL = String(window.QZVERSO_CONFIG && window.QZVERSO_CONFIG.apiUrl ? window.QZVERSO_CONFIG.apiUrl : "").trim().replace(/\/+$/, "");
let historiasCache = [];
let categoriaAtual = "todas";
let token = localStorage.getItem("qz_token");
let userData = lerUsuarioSalvo();

document.addEventListener("DOMContentLoaded", inicializarAplicacao);

function inicializarAplicacao() {
    checkAuthState();
    if (document.getElementById("grid-historias")) carregarHistorias();
    if (document.getElementById("grid-parceiros")) renderizarParceiros();

    document.querySelectorAll(".modal-overlay").forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeModal(modal.id);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal-overlay").forEach(function (modal) {
                if (modal.style.display === "flex") closeModal(modal.id);
            });
        }
    });
}

function lerUsuarioSalvo() {
    try { return JSON.parse(localStorage.getItem("qz_user") || "{}"); }
    catch (error) {
        localStorage.removeItem("qz_user");
        localStorage.removeItem("qz_token");
        return {};
    }
}

async function requisicaoApi(caminho, opcoes) {
    if (!API_URL) {
        throw new Error("A API ainda não está conectada a esta versão do Qzverso. O catálogo público continua disponível; autenticação e administração dependem do backend.");
    }
    const resposta = await fetch(API_URL + caminho, opcoes || {});
    let dados = {};
    try { dados = await resposta.json(); } catch (error) { dados = {}; }
    if (!resposta.ok) throw new Error(dados.detail || dados.message || "Não foi possível concluir a solicitação.");
    return dados;
}

/* CATÁLOGO */
async function carregarHistorias() {
    if (API_URL) {
        try {
            const dados = await requisicaoApi("/historias");
            historiasCache = Array.isArray(dados) ? dados : [];
            if (!historiasCache.length) throw new Error("A API não retornou histórias.");
        } catch (erro) {
            console.warn("Catálogo remoto indisponível; usando dados demonstrativos.", erro);
            historiasCache = getHistoriasDemo();
        }
    } else {
        historiasCache = getHistoriasDemo();
    }
    aplicarFiltros();
    renderizarDestaque();
}

function renderizarHistorias(lista) {
    const grade = document.getElementById("grid-historias");
    if (!grade) return;

    if (!lista || !lista.length) {
        grade.innerHTML = '<div class="empty-state"><span class="empty-state-icon"><i class="fa-solid fa-book-open"></i></span><h3>Nenhuma história encontrada</h3><p>Tente outro termo ou limpe os filtros para ver todas as obras.</p><button type="button" class="btn-secondary-glass" onclick="limparBusca()">Limpar filtros</button></div>';
        return;
    }

    grade.innerHTML = lista.map(function (h) {
        const id = escapeHtml(String(h.id || ""));
        const titulo = escapeHtml(h.titulo || "Obra sem título");
        const autora = escapeHtml(h.escritora_nome || "Escritora Qzverso");
        const sinopse = escapeHtml(h.sinopse || "Sinopse ainda não cadastrada.");
        const capa = escapeHtml(obterImagemSegura(h.capa_url) || "qzverso.jpg");
        const total = Number(h.visualizacoes);
        const acessos = Number.isFinite(total) ? total.toLocaleString("pt-BR") : "0";
        return '<article class="story-card"><button type="button" class="story-card-button" data-story-id="' + id + '" aria-label="Ver detalhes de ' + titulo + '">' +
            '<div class="card-cover-wrapper"><img src="' + capa + '" class="card-cover-img" alt="Capa de ' + titulo + '" loading="lazy"><span class="card-platform-badge"><i class="fa-solid fa-arrow-up-right-from-square"></i> Leitura externa</span></div>' +
            '<div class="card-body"><div class="card-title-text">' + titulo + '</div><div class="card-author-text"><i class="fa-solid fa-pen-nib"></i> ' + autora + '</div>' +
            '<div class="card-synopsis-snippet">' + sinopse + '</div><div class="card-footer-action"><span><i class="fa-solid fa-eye"></i> ' + acessos + ' acessos</span><span>Ver detalhes <i class="fa-solid fa-arrow-right"></i></span></div></div>' +
            '</button></article>';
    }).join("");

    grade.querySelectorAll(".story-card-button").forEach(function (button) {
        button.addEventListener("click", function () { openHistoriaModal(button.getAttribute("data-story-id")); });
    });
    grade.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () { image.src = "qzverso.jpg"; }, { once: true });
    });
}

function renderizarDestaque() {
    const h = historiasCache[0];
    const imagem = document.getElementById("hero-feature-cover");
    const titulo = document.getElementById("hero-feature-title");
    const autora = document.getElementById("hero-feature-author");
    const link = document.getElementById("hero-feature-link");
    if (!h || !imagem || !titulo || !autora || !link) return;

    imagem.src = obterImagemSegura(h.capa_url) || "qzverso.jpg";
    imagem.alt = "Capa de " + (h.titulo || "obra em destaque");
    titulo.textContent = h.titulo || "Obra em destaque";
    autora.textContent = h.escritora_nome || "Escritora Qzverso";
    const url = obterLinkExternoSeguro(h.link_leitura_externo);
    if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = 'Continuar na plataforma <i class="fa-solid fa-arrow-up-right-from-square"></i>';
    } else {
        link.href = "#vitrine";
        link.removeAttribute("target");
        link.textContent = "Ver detalhes na vitrine";
    }
}

function openHistoriaModal(id) {
    const h = historiasCache.find(function (item) { return String(item.id) === String(id); });
    const conteudo = document.getElementById("modal-historia-content");
    if (!h || !conteudo) return;

    const titulo = escapeHtml(h.titulo || "Obra sem título");
    const autora = escapeHtml(h.escritora_nome || "Escritora Qzverso");
    const sinopse = escapeHtml(h.sinopse || "Sinopse ainda não cadastrada.");
    const capa = escapeHtml(obterImagemSegura(h.capa_url) || "qzverso.jpg");
    const url = obterLinkExternoSeguro(h.link_leitura_externo);
    const acao = url
        ? '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" class="btn-primary-glow modal-read-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ler na plataforma oficial</a>'
        : '<p class="development-note"><i class="fa-solid fa-circle-info"></i> O link oficial de leitura ainda não foi cadastrado.</p>';

    conteudo.innerHTML = '<div class="modal-cover"><img src="' + capa + '" class="modal-cover-img" alt="Capa de ' + titulo + '"></div>' +
        '<div class="modal-info"><span class="hero-badge"><i class="fa-solid fa-bookmark"></i> Obra catalogada</span><h2>' + titulo + '</h2>' +
        '<p class="modal-author"><i class="fa-solid fa-pen-nib"></i> Por ' + autora + '</p><p class="modal-synopsis">' + sinopse + '</p>' +
        '<div class="redirect-note"><i class="fa-solid fa-circle-info"></i><span>O Qzverso apresenta e divulga as obras. A leitura integral acontece na plataforma externa indicada pela autoria.</span></div>' +
        acao + '</div>';
    openModal("modal-historia");
}

function openFeaturedModal() {
    if (historiasCache.length) openHistoriaModal(historiasCache[0].id);
    else document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
}

function filtrarCategoria(categoria, botao) {
    categoriaAtual = categoria || "todas";
    document.querySelectorAll(".filter-pills .pill").forEach(function (item) { item.classList.remove("active"); });
    if (botao) botao.classList.add("active");
    aplicarFiltros();
}

function filtrarHistorias() { aplicarFiltros(); }

function limparBusca() {
    const busca = document.getElementById("input-busca");
    if (busca) busca.value = "";
    categoriaAtual = "todas";
    document.querySelectorAll(".filter-pills .pill").forEach(function (item, index) {
        item.classList.toggle("active", index === 0);
    });
    aplicarFiltros();
}

function aplicarFiltros() {
    const campo = document.getElementById("input-busca");
    const termo = normalizarTexto(campo ? campo.value : "");
    const filtradas = historiasCache.filter(function (h) {
        const autora = normalizarTexto(h.escritora_nome || "");
        const categoriaOk = categoriaAtual === "todas" || autora.includes(normalizarTexto(categoriaAtual));
        const texto = normalizarTexto([h.titulo || "", h.sinopse || "", h.escritora_nome || ""].join(" "));
        return categoriaOk && (!termo || texto.includes(termo));
    });
    renderizarHistorias(filtradas);
    const status = document.getElementById("catalog-status");
    if (status) status.textContent = filtradas.length + (filtradas.length === 1 ? " obra encontrada" : " obras encontradas");
}

function renderizarParceiros() {
    const grade = document.getElementById("grid-parceiros");
    if (!grade) return;
    const parceiros = [
        { nome: "Fanficando", tipo: "Plataforma de leitura", descricao: "Ambiente externo onde as histórias são publicadas para leitura integral.", url: "https://www.fanficando.com/", icone: "fa-book-open" },
        { nome: "HMD Oficial", tipo: "Loja parceira", descricao: "Iniciativa ligada à cultura de fãs e a produtos que dialogam com o universo criativo do projeto.", url: "https://hmdoficial.lojavirtualnuvem.com.br/", icone: "fa-store" }
    ];
    grade.innerHTML = parceiros.map(function (p) {
        return '<article class="partner-card"><span class="partner-icon"><i class="fa-solid ' + p.icone + '"></i></span><span class="partner-type">' + escapeHtml(p.tipo) + '</span><h3>' + escapeHtml(p.nome) + '</h3><p>' + escapeHtml(p.descricao) + '</p><a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener noreferrer" class="text-link">Visitar parceiro <i class="fa-solid fa-arrow-up-right-from-square"></i></a></article>';
    }).join("");
}

/* MODAIS E ABAS */
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeButton = modal.querySelector(".modal-close");
    if (closeButton) closeButton.focus();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector('.modal-overlay[aria-hidden="false"]')) document.body.classList.remove("modal-open");
}

function switchAuthMode(mode) {
    const login = document.getElementById("form-login");
    const register = document.getElementById("form-registro");
    const loginButton = document.getElementById("btn-tab-login");
    const registerButton = document.getElementById("btn-tab-registro");
    if (!login || !register || !loginButton || !registerButton) return;
    const showLogin = mode === "login";
    login.style.display = showLogin ? "block" : "none";
    register.style.display = showLogin ? "none" : "block";
    loginButton.classList.toggle("active", showLogin);
    registerButton.classList.toggle("active", !showLogin);
}

function switchDashTab(tab, button) {
    document.querySelectorAll(".tab-btn").forEach(function (item) { item.classList.remove("active"); });
    document.querySelectorAll(".tab-content").forEach(function (item) { item.style.display = "none"; item.classList.remove("active"); });
    const panel = document.getElementById(tab === "nova-obra" ? "tab-nova-obra" : "tab-importar-docx");
    if (panel) { panel.style.display = "block"; panel.classList.add("active"); }
    if (button) button.classList.add("active");
}

/* AUTENTICAÇÃO E PAINEL */
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const senha = document.getElementById("login-senha").value;
    try {
        const data = await requisicaoApi("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, senha: senha })
        });
        if (!data.access_token) throw new Error("A resposta da API não trouxe um token de acesso.");
        token = data.access_token;
        userData = { nome: data.nome || email, tipo: data.tipo_usuario || "leitor" };
        localStorage.setItem("qz_token", token);
        localStorage.setItem("qz_user", JSON.stringify(userData));
        checkAuthState();
        closeModal("modal-auth");
        showToast("Acesso realizado com sucesso.", "success");
    } catch (error) { showToast(error.message, "error"); }
}

async function handleRegistro(event) {
    event.preventDefault();
    const nome = document.getElementById("reg-nome").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const senha = document.getElementById("reg-senha").value;
    try {
        await requisicaoApi("/auth/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: nome, email: email, senha: senha, tipo_usuario: "leitor" })
        });
        showToast("Conta criada. Entre com seu e-mail e senha.", "success");
        switchAuthMode("login");
        document.getElementById("login-email").value = email;
    } catch (error) { showToast(error.message, "error"); }
}

async function handleNovaObra(event) {
    event.preventDefault();
    if (!token) { showToast("Entre com uma conta autorizada para publicar uma obra.", "error"); return; }

    const titulo = document.getElementById("obra-titulo").value.trim();
    const sinopse = document.getElementById("obra-sinopse").value.trim();
    const capa_url = document.getElementById("obra-capa").value.trim();
    const link = obterLinkExternoSeguro(document.getElementById("obra-link").value.trim());
    if (!link) { showToast("Informe um endereço HTTP ou HTTPS válido para a leitura oficial.", "error"); return; }

    try {
        await requisicaoApi("/historias", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ titulo: titulo, sinopse: sinopse, capa_url: obterImagemSegura(capa_url), link_leitura_externo: link })
        });
        document.getElementById("form-nova-obra").reset();
        await carregarHistorias();
        showToast("Obra enviada para a vitrine.", "success");
    } catch (error) { showToast(error.message, "error"); }
}

function checkAuthState() {
    const loginButton = document.getElementById("btn-login-trigger");
    const userBadge = document.getElementById("user-badge");
    const userName = document.getElementById("user-name-display");
    const writerLink = document.getElementById("link-escritora-nav");
    const writerPanel = document.getElementById("escritoras");
    const authenticated = Boolean(token && userData && userData.nome);

    if (loginButton) loginButton.style.display = authenticated ? "none" : "inline-flex";
    if (userBadge) userBadge.style.display = authenticated ? "flex" : "none";
    if (userName && authenticated) userName.textContent = userData.nome;

    const isWriter = authenticated && ["escritora", "admin"].includes(userData.tipo);
    if (writerLink) writerLink.style.display = isWriter ? "inline-flex" : "none";
    if (writerPanel) writerPanel.style.display = isWriter ? "block" : "none";
}

function logout() {
    localStorage.removeItem("qz_token");
    localStorage.removeItem("qz_user");
    token = null;
    userData = {};
    checkAuthState();
    showToast("Você saiu da sua conta.", "success");
}

/* UTILITÁRIOS */
function normalizarTexto(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function obterLinkExternoSeguro(value) {
    try {
        const url = new URL(String(value || ""));
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) { return ""; }
}

function obterImagemSegura(value) {
    if (!value) return "";
    try {
        const url = new URL(String(value), window.location.href);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) { return ""; }
}

function showToast(message, type) {
    const toast = document.getElementById("app-toast");
    if (!toast) { window.alert(message); return; }
    toast.textContent = message;
    toast.className = "app-toast visible " + (type || "info");
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(function () { toast.className = "app-toast"; }, 4800);
}

function getHistoriasDemo() {
    return [{
        id: "weather-girl",
        titulo: "The Weather Girl",
        sinopse: "Lauren Baker acreditava que estava no caminho certo para o sucesso quando se tornou colunista júnior de um dos maiores jornais impressos de Chicago. No entanto, suas opiniões fortes e sua atitude ousada em um ambiente conservador acabaram custando seu emprego. Após enfrentar um período difícil, uma improvável oportunidade surge: apresentar a previsão do tempo na emissora de maior audiência de Illinois. Embora longe de seus planos iniciais, essa nova fase traz uma perspectiva inesperada para sua vida profissional.\n\nEnquanto navega por uma rotina agitada, uma vida amorosa desastrosa e expectativas frustradas, Lauren cruza o caminho de Camila, uma mulher de bem com a vida e cheia de talentos que, após um divórcio conturbado, sustenta-se como motorista de aplicativo.\n\nQuando Lauren decide desistir do amor, entre o caos diário e as surpresas da vida, será que alguém realmente se importará em ficar? Uma história de encontros improváveis, recomeços e beleza do amor que surge quando menos se espera.",
        capa_url: "https://www.fanficando.com/assets/capa2-0dfa16b2.png",
        link_leitura_externo: "https://www.fanficando.com/story/187",
        escritora_nome: "Qz, Julia e Qzverso",
        visualizacoes: 596,
        status: "concluída"
    }];
}
