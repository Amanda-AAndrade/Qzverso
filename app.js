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
    atualizarEstadoAutenticacao();
    switchAuthMode("login");
    inicializarBusca();
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
    // KE Club é a obra principal: não deixar a ordem da API definir o destaque.
    historiasCache.sort(function (a, b) {
        return Number(b.id === "ke-club") - Number(a.id === "ke-club");
    });
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
        const metadados = [];
        if (h.status) metadados.push('<span class="story-meta-chip story-status">' + escapeHtml(h.status) + '</span>');
        if (Array.isArray(h.generos)) h.generos.filter(Boolean).forEach(function (genero) {
            metadados.push('<span class="story-meta-chip">' + escapeHtml(genero) + '</span>');
        });
        if (h.classificacao) metadados.push('<span class="story-meta-chip story-rating"><i class="fa-solid fa-user-shield" aria-hidden="true"></i> ' + escapeHtml(h.classificacao) + '</span>');
        if (h.capitulos != null) metadados.push('<span class="story-meta-chip"><i class="fa-solid fa-book-open" aria-hidden="true"></i> ' + escapeHtml(String(h.capitulos)) + (Number(h.capitulos) === 1 ? ' capítulo' : ' capítulos') + '</span>');

        const metricas = [];
        if (h.visualizacoes_texto || h.visualizacoes != null) {
            const valor = h.visualizacoes_texto || Number(h.visualizacoes).toLocaleString("pt-BR");
            metricas.push('<span><i class="fa-solid fa-eye"></i> ' + escapeHtml(valor) + ' visualizações</span>');
        }
        if (h.curtidas_texto || h.curtidas != null) {
            const valor = h.curtidas_texto || Number(h.curtidas).toLocaleString("pt-BR");
            metricas.push('<span><i class="fa-solid fa-heart"></i> ' + escapeHtml(valor) + ' curtidas</span>');
        }

        const metaHtml = metadados.length ? '<div class="story-meta-row">' + metadados.join("") + '</div>' : "";
        const metricasHtml = metricas.length ? '<div class="story-metrics">' + metricas.join("") + '</div>' : "";
        return '<article class="story-card"><button type="button" class="story-card-button" data-story-id="' + id + '" aria-label="Ver detalhes de ' + titulo + '">' +
            '<div class="card-cover-wrapper"><img src="' + capa + '" class="card-cover-img" alt="Capa de ' + titulo + '" loading="lazy"><span class="card-platform-badge"><i class="fa-solid fa-arrow-up-right-from-square"></i> Fanficando</span></div>' +
            '<div class="card-body"><div class="card-title-text">' + titulo + '</div><div class="card-author-text"><i class="fa-solid fa-pen-nib"></i> ' + autora + '</div>' +
            metaHtml + '<div class="card-synopsis-snippet">' + sinopse + '</div>' + metricasHtml +
            '<div class="card-footer-action"><span>Fanficando</span><span>Ver detalhes <i class="fa-solid fa-arrow-right"></i></span></div></div></button></article>';
    }).join("");

    grade.querySelectorAll(".story-card-button").forEach(function (button) {
        button.addEventListener("click", function () { openHistoriaModal(button.getAttribute("data-story-id")); });
    });
    grade.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () { image.src = "qzverso.jpg"; }, { once: true });
    });
}

function renderizarDestaque() {
    const h = historiasCache.find(function (item) { return item.id === "ke-club"; }) || historiasCache[0];
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

function obterPerfisWattpad(h) {
    const perfis = {
        qz: { nome: "Qz", url: "https://www.wattpad.com/user/CabellitaQ" },
        julia: { nome: "Julia", url: "https://www.wattpad.com/user/julia_katycats" }
    };
    const ids = Array.isArray(h && h.escritoras_ids) ? h.escritoras_ids : [];
    return ids.filter(function (id) { return Boolean(perfis[id]); }).map(function (id) { return perfis[id]; });
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
    const linkEhPerfil = h.link_tipo === "perfil";
    const acaoFanficando = url
        ? '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" class="btn-primary-glow modal-read-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> ' + (linkEhPerfil ? 'Ver perfil no Fanficando' : 'Ler no Fanficando') + '</a>'
        : '<p class="development-note"><i class="fa-solid fa-circle-info"></i> O link externo do Fanficando ainda não foi cadastrado.</p>';
    const perfisWattpad = obterPerfisWattpad(h);
    const acoesWattpad = perfisWattpad.length
        ? '<div class="wattpad-profile-links"><span class="wattpad-links-label">Também no Wattpad</span>' + perfisWattpad.map(function (perfil) {
            return '<a class="btn-secondary-glass wattpad-profile-link" href="' + escapeHtml(perfil.url) + '" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-book-open"></i> Perfil de ' + escapeHtml(perfil.nome) + '</a>';
        }).join("") + '<small>Os links abrem os perfis das coautoras; o endereço direto de cada história será incluído quando confirmado.</small></div>'
        : "";
    const acoesExternas = acaoFanficando + acoesWattpad;

    const metadados = [];
    if (h.status) metadados.push('<span class="story-meta-chip story-status">' + escapeHtml(h.status) + '</span>');
    if (Array.isArray(h.generos)) h.generos.filter(Boolean).forEach(function (genero) {
        metadados.push('<span class="story-meta-chip">' + escapeHtml(genero) + '</span>');
    });
    if (h.classificacao) metadados.push('<span class="story-meta-chip story-rating"><i class="fa-solid fa-user-shield" aria-hidden="true"></i> Classificação ' + escapeHtml(h.classificacao) + '</span>');
    if (h.capitulos != null) metadados.push('<span class="story-meta-chip"><i class="fa-solid fa-book-open" aria-hidden="true"></i> ' + escapeHtml(String(h.capitulos)) + (Number(h.capitulos) === 1 ? ' capítulo' : ' capítulos') + '</span>');
    if (h.atualizacao) metadados.push('<span class="story-meta-chip">Atualizada em ' + escapeHtml(h.atualizacao) + '</span>');

    const metricas = [];
    if (h.visualizacoes_texto || h.visualizacoes != null) {
        const valor = h.visualizacoes_texto || Number(h.visualizacoes).toLocaleString("pt-BR");
        metricas.push('<span><i class="fa-solid fa-eye"></i> ' + escapeHtml(valor) + ' visualizações</span>');
    }
    if (h.curtidas_texto || h.curtidas != null) {
        const valor = h.curtidas_texto || Number(h.curtidas).toLocaleString("pt-BR");
        metricas.push('<span><i class="fa-solid fa-heart"></i> ' + escapeHtml(valor) + ' curtidas</span>');
    }

    const observacaoSinopse = h.sinopse_completa === false
        ? '<p class="auth-note">Trecho exibido na prévia do perfil Fanficando. Consulte o perfil para ver a sinopse completa e os dados atualizados.</p>'
        : '';
    const observacaoLink = linkEhPerfil
        ? '<div class="redirect-note"><i class="fa-solid fa-circle-info"></i><span>O link abre o perfil da escritora no Fanficando. Localize a obra na lista de histórias para continuar.</span></div>'
        : '<div class="redirect-note"><i class="fa-solid fa-circle-info"></i><span>O Qzverso apresenta e divulga as obras. A leitura integral acontece na página original no Fanficando.</span></div>';

    conteudo.innerHTML = '<div class="modal-cover"><img src="' + capa + '" class="modal-cover-img" alt="Capa de ' + titulo + '"></div>' +
        '<div class="modal-info"><span class="hero-badge"><i class="fa-solid fa-bookmark"></i> Catálogo Qzverso</span><h2>' + titulo + '</h2>' +
        '<p class="modal-author"><i class="fa-solid fa-pen-nib"></i> Por ' + autora + '</p>' +
        (metadados.length ? '<div class="story-meta-row story-modal-meta">' + metadados.join("") + '</div>' : '') +
        (metricas.length ? '<div class="story-metrics story-modal-metrics">' + metricas.join("") + '</div>' : '') +
        '<p class="modal-synopsis">' + sinopse + '</p>' + observacaoSinopse + observacaoLink + acoesExternas + '</div>';
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

function inicializarBusca() {
    const campo = document.getElementById("input-busca");
    const botao = document.getElementById("btn-pesquisar");

    if (campo) {
        campo.addEventListener("input", filtrarHistorias);
        campo.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                executarBusca();
            }
        });
    }

    if (botao) botao.addEventListener("click", executarBusca);
}

function filtrarHistorias() {
    aplicarFiltros();
}

function executarBusca() {
    aplicarFiltros();
    const vitrine = document.getElementById("vitrine");
    if (vitrine) vitrine.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
    const nomesEscritoras = {
        qz: "Qz",
        julia: "Julia Laura",
        marina: "Marina"
    };

    const filtradas = historiasCache.filter(function (h) {
        const autorias = Array.isArray(h.escritoras_ids) ? h.escritoras_ids : [];
        const categoriaOk = categoriaAtual === "todas" || autorias.includes(categoriaAtual);

        // Qzverso é a marca do portal, não uma escritora. Ela não deve fazer
        // todas as obras aparecerem quando a pessoa pesquisa apenas "Qz".
        const nomesAutores = autorias.length
            ? autorias.filter(function (id) { return id !== "qzverso"; })
                .map(function (id) { return nomesEscritoras[id] || ""; }).join(" ")
            : String(h.escritora_nome || "").replace(/\\bqzverso\\b/gi, " ");

        const texto = normalizarTexto([
            h.titulo || "",
            h.sinopse || "",
            nomesAutores
        ].join(" "));

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
    const closeButton = modal.querySelector(".modal-close");    if (closeButton) closeButton.focus();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector('.modal-overlay[aria-hidden="false"]')) document.body.classList.remove("modal-open");
}

function atualizarEstadoAutenticacao() {
    const status = document.getElementById("auth-status");
    const message = document.getElementById("auth-status-text");
    if (!status || !message) return;

    const configurada = Boolean(API_URL);
    status.classList.toggle("is-configured", configurada);
    const icon = status.querySelector("i");
    if (icon) icon.className = configurada ? "fa-solid fa-circle-check" : "fa-solid fa-circle-info";

    message.textContent = configurada
        ? "Endereço da API configurado. A disponibilidade do acesso depende de o serviço estar ativo."
        : "A interface está pronta, mas entrar e criar conta só funcionarão depois que o serviço de autenticação for conectado.";
}

function switchAuthMode(mode) {
    const login = document.getElementById("form-login");
    const register = document.getElementById("form-registro");
    const loginButton = document.getElementById("btn-tab-login");
    const registerButton = document.getElementById("btn-tab-registro");
    const title = document.getElementById("auth-title");
    const description = document.getElementById("auth-description");
    if (!login || !register || !loginButton || !registerButton) return;

    const showLogin = mode === "login";
    login.style.display = showLogin ? "grid" : "none";
    register.style.display = showLogin ? "none" : "grid";
    login.setAttribute("aria-hidden", String(!showLogin));
    register.setAttribute("aria-hidden", String(showLogin));
    loginButton.classList.toggle("active", showLogin);
    registerButton.classList.toggle("active", !showLogin);
    loginButton.setAttribute("aria-selected", String(showLogin));
    registerButton.setAttribute("aria-selected", String(!showLogin));

    if (title) title.textContent = showLogin ? "Boas-vindas de volta" : "Crie sua conta";
    if (description) description.textContent = showLogin
        ? "Entre para continuar explorando o universo Qzverso."
        : "Faça parte da comunidade e descubra novas histórias.";
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
    const confirmacao = document.getElementById("reg-confirma-senha").value;

    if (senha !== confirmacao) {
        showToast("As senhas não coincidem. Confira os dois campos.", "error");
        document.getElementById("reg-confirma-senha").focus();
        return;
    }

    try {
        await requisicaoApi("/auth/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: nome, email: email, senha: senha, tipo_usuario: "leitor" })
        });
        showToast("Conta criada. Entre com seu e-mail e senha.", "success");
        document.getElementById("form-registro").reset();
        switchAuthMode("login");
        document.getElementById("login-email").value = email;
        document.getElementById("login-senha").value = "";
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
    return [
        {
            id: "weather-girl",
            titulo: "The Weather Girl",
            sinopse: "Lauren Baker acreditava que estava no caminho certo para o sucesso quando se tornou colunista júnior de um dos maiores jornais impressos de Chicago. No entanto, suas opiniões fortes e sua atitude ousada em um ambiente conservador acabaram custando seu emprego. Após enfrentar um período difícil, uma improvável oportunidade surge: apresentar a previsão do tempo na emissora de maior audiência de Illinois. Embora longe de seus planos iniciais, essa nova fase traz uma perspectiva inesperada para sua vida profissional.\n\nEnquanto navega por uma rotina agitada, uma vida amorosa desastrosa e expectativas frustradas, Lauren cruza o caminho de Camila, uma mulher de bem com a vida e cheia de talentos que, após um divórcio conturbado, sustenta-se como motorista de aplicativo.\n\nQuando Lauren decide desistir do amor, entre o caos diário e as surpresas da vida, será que alguém realmente se importará em ficar? Uma história de encontros improváveis, recomeços e beleza do amor que surge quando menos se espera.",
            sinopse_completa: true,
            capa_url: "covers/the-weather-girl.jpg",
            link_leitura_externo: "https://www.fanficando.com/story/187",
            escritora_nome: "Qz, Julia Laura e Qzverso",
            escritoras_ids: ["qz", "julia", "qzverso"],
            status: "Concluída",
            generos: ["Comédia"],
            classificacao: "18+",
            capitulos: 30
        },
        {
            id: "ke-club",
            titulo: "KE Club",
            sinopse: "Entre tantos outros bares pelas ruas de Nova York, o KE Bar seria apenas mais um, se não fosse a porta de entrada do lugar perfeito para satisfazer todos os seus desejos do corpo e luxúria: O KE Club.\n\nDona da melhor noite novaiorquina, da metade dos negócios ilícitos da cidade e de uma beleza matadora, Karla Escorpia pode ser seu melhor sonho ou seu pior pesadelo e Lauren Foster acaba de descobrir isso ao atravessar seu caminho. Como alguém que não tem nada a perder, suas escolhas são claras:\n\nMorra por ela ou pelas mãos dela.\n\nLauren intersexual.\n\nATENÇÃO: Contém cenas de sexo explícito, drogas ilícitas, palavrões e violência.\n\nEsta obra utiliza nomes e imagens de pessoas públicas, mas em nada condiz com a realidade. Todo o conteúdo narrado é totalmente fictício.",
            sinopse_completa: true,
            capa_url: "covers/ke-club.jpg",
            link_leitura_externo: "https://www.fanficando.com/story/653",
            escritora_nome: "Qz, Marina e Qzverso",
            escritoras_ids: ["qz", "marina", "qzverso"],
            status: "Em andamento",
            generos: ["Ação"],
            classificacao: "18+",
            capitulos: 51
        },
        {
            id: "ke-club-gadot-margot",
            titulo: "KE Club - Gadot e Margot (One Shot)",
            sinopse: "Quando o KE Club ainda dava seus primeiros passos para o sucesso que viria a tornar-se anos à frente, Gal Gadot escolheu ser a pessoa fiel de Karla Escorpia. Contudo...",
            sinopse_completa: false,
            capa_url: "covers/ke-club-gadot-margot.jpg",
            link_leitura_externo: "https://www.fanficando.com/author/365",
            link_tipo: "perfil",
            escritora_nome: "Qz, Marina e Qzverso",
            escritoras_ids: ["qz", "marina", "qzverso"],
            status: "Concluída",
            generos: ["Romance"],
            classificacao: "18+",
            capitulos: 1,
            atualizacao: "06/10/2026"
        },
        {
            id: "todo-dia-elas-cronicas",
            titulo: "Todo dia, elas. - Crônicas",
            sinopse: "Em meio à rotina dos dias que parecem iguais, existem histórias que insistem em nascer nos detalhes (ou pensamentos também). Esta é uma coletânea de crônicas...",
            sinopse_completa: false,
            capa_url: "covers/todo-dia-elas.jpg",
            link_leitura_externo: "https://www.fanficando.com/author/282",
            link_tipo: "perfil",
            escritora_nome: "Julia Laura e Qzverso",
            escritoras_ids: ["julia", "qzverso"],
            status: "Concluída",
            generos: ["Fanfic"],
            classificacao: "16",
            capitulos: 3,
            atualizacao: "02/11/2026"
        },
        {
            id: "ultraviolence",
            titulo: "ULTRAVIOLENCE",
            sinopse: "No submundo intocável da máfia toscana, Lauren Baldoni construiu sua autoridade com frieza e estratégia, desafiando estruturas geracionais que jamais deveriam ser...",
            sinopse_completa: false,
            capa_url: "covers/ultraviolence.jpg",
            link_leitura_externo: "https://www.fanficando.com/author/282",
            link_tipo: "perfil",
            escritora_nome: "Julia Laura e Qzverso",
            status: "Em andamento",
            generos: ["Fanfic"],
            classificacao: "18+",
            capitulos: 4,
            atualizacao: "25/09/2026"
        }
    ];
}