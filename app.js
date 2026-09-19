/* ============================================================
   QZVERSO — FRONTEND INTERACTION CONTROLLER (V2)
   ============================================================ */

const API_URL = "http://127.0.0.1:8000/api";
let historiasCache = [];
let token = localStorage.getItem("qz_token");
let userData = JSON.parse(localStorage.getItem("qz_user") || "{}");

document.addEventListener("DOMContentLoaded", () => {
    checkAuthState();
    carregarHistorias();
    carregarParceiros();
    carregarProdutos();
});

// ------------------------------------------------------------
// API FETCHERS
// ------------------------------------------------------------
async function carregarHistorias() {
    try {
        const res = await fetch(`${API_URL}/historias`);
        if (!res.ok) throw new Error("Falha ao buscar histórias");
        historiasCache = await res.json();
        renderizarHistorias(historiasCache);
        atualizarSelectObras(historiasCache);
    } catch (err) {
        console.warn("API indisponível, exibindo dados de demonstração local:", err);
        historiasCache = getHistoriasDemo();
        renderizarHistorias(historiasCache);
        atualizarSelectObras(historiasCache);
    }
}

function renderizarHistorias(lista) {
    const grid = document.getElementById("grid-historias");
    if (!lista || lista.length === 0) {
        grid.innerHTML = `<p class="text-muted">Nenhuma história encontrada nesta categoria.</p>`;
        return;
    }

    grid.innerHTML = lista.map(h => `
        <div class="story-card" onclick="openHistoriaModal('${h.id}')">
            <div class="card-cover-wrapper">
                <img src="${h.capa_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'}" class="card-cover-img" alt="${escapeHtml(h.titulo)}">
                <span class="card-platform-badge"><i class="fa-solid fa-arrow-up-right-from-square"></i> Externo</span>
            </div>
            <div class="card-body">
                <div class="card-title-text">${escapeHtml(h.titulo)}</div>
                <div class="card-author-text"><i class="fa-solid fa-pen-nib"></i> ${escapeHtml(h.escritora_nome || 'Escritora Qzverso')}</div>
                <div class="card-synopsis-snippet">${escapeHtml(h.sinopse)}</div>
                <div class="card-footer-action">
                    <span><i class="fa-solid fa-eye"></i> ${h.visualizacoes || 0} acessos</span>
                    <span>Saiba mais &rarr;</span>
                </div>
            </div>
        </div>
    `).join("");
}

async function carregarParceiros() {
    const grid = document.getElementById("grid-parceiros");
    try {
        const res = await fetch(`${API_URL}/parceiros`);
        const parceiros = await res.json();
        if (parceiros.length === 0) throw new Error();
        grid.innerHTML = parceiros.map(p => `
            <div class="story-card p-3" style="padding:1.5rem;">
                <h3 style="color:var(--primary-glow); margin-bottom:0.5rem;"><i class="fa-solid fa-bookmark"></i> ${escapeHtml(p.nome)}</h3>
                <p style="font-size:0.9rem; color:var(--text-muted);">${escapeHtml(p.descricao || '')}</p>
            </div>
        `).join("");
    } catch {
        grid.innerHTML = `
            <div class="story-card p-3" style="padding:1.5rem;">
                <h3 style="color:var(--primary-glow); margin-bottom:0.5rem;"><i class="fa-solid fa-book-bookmark"></i> Editora Parceira</h3>
                <p style="font-size:0.9rem; color:var(--text-muted);">Editora e selo literário independente focado na publicação de novos talentos e escritoras da literatura fantástica.</p>
            </div>
        `;
    }
}

async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    try {
        const res = await fetch(`${API_URL}/produtos`);
        const produtos = await res.json();
        if (produtos.length === 0) throw new Error();
        grid.innerHTML = produtos.map(p => `
            <div class="story-card p-3" style="padding:1.5rem;">
                <h3 style="color:white; margin-bottom:0.4rem;">${escapeHtml(p.nome)}</h3>
                <p style="color:var(--accent-cyan); font-weight:700;">R$ ${p.preco ? p.preco.toFixed(2) : '15,00'}</p>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">${escapeHtml(p.descricao || '')}</p>
            </div>
        `).join("");
    } catch {
        grid.innerHTML = `
            <div class="story-card p-3" style="padding:1.5rem;">
                <h3 style="color:white; margin-bottom:0.4rem;">Marcador Qzverso Colecionável</h3>
                <p style="color:var(--accent-cyan); font-weight:700;">R$ 15,00</p>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">Marcador de página metálico exclusivo com arte temática do universo.</p>
            </div>
        `;
    }
}

// ------------------------------------------------------------
// MODAL DETAILS & FILTERS
// ------------------------------------------------------------
function openHistoriaModal(id) {
    const h = historiasCache.find(item => item.id === id) || historiasCache[0];
    if (!h) return;

    const modalContent = document.getElementById("modal-historia-content");
    modalContent.innerHTML = `
        <div class="modal-cover">
            <img src="${h.capa_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'}" style="width:100%; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.6);" alt="${escapeHtml(h.titulo)}">
        </div>
        <div class="modal-info">
            <span class="hero-badge"><i class="fa-solid fa-circle-check"></i> Obra Catalogada</span>
            <h2 style="font-size:2rem; margin:0.5rem 0; color:white;">${escapeHtml(h.titulo)}</h2>
            <p style="color:var(--primary-glow); font-weight:600; margin-bottom:1rem;"><i class="fa-solid fa-pen-nib"></i> Por ${escapeHtml(h.escritora_nome || 'Escritora Qzverso')}</p>
            
            <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.7; margin-bottom:1.8rem;">
                ${escapeHtml(h.sinopse)}
            </p>

            <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:8px; border-left:3px solid var(--accent-cyan); margin-bottom:1.5rem; font-size:0.85rem; color:var(--text-muted);">
                <i class="fa-solid fa-circle-info"></i> <strong>Nota de Redirecionamento:</strong> O Qzverso não disponibiliza a leitura integral das obras no portal. Ao clicar abaixo, você será direcionado(a) ao espaço oficial onde a história está publicada.
            </div>

            <a href="${h.link_leitura_externo}" target="_blank" rel="noopener noreferrer" class="btn-primary-glow" style="text-decoration:none; display:inline-flex; width:100%; justify-content:center;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Ler História na Plataforma Oficial
            </a>
        </div>
    `;
    openModal("modal-historia");
}

function openFeaturedModal() {
    if (historiasCache.length > 0) {
        openHistoriaModal(historiasCache[0].id);
    }
}

function filtrarCategoria(cat) {
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    event.target.classList.add("active");

    if (cat === 'todas') {
        renderizarHistorias(historiasCache);
    } else {
        const filtradas = historiasCache.filter(h => h.titulo.toLowerCase().includes(cat) || h.sinopse.toLowerCase().includes(cat));
        renderizarHistorias(filtradas.length > 0 ? filtradas : historiasCache);
    }
}

function filtrarHistorias() {
    const query = document.getElementById("input-busca").value.toLowerCase();
    const filtradas = historiasCache.filter(h => 
        h.titulo.toLowerCase().includes(query) || 
        h.sinopse.toLowerCase().includes(query) ||
        (h.escritora_nome && h.escritora_nome.toLowerCase().includes(query))
    );
    renderizarHistorias(filtradas);
}

// ------------------------------------------------------------
// AUTH & DASHBOARD TABS
// ------------------------------------------------------------
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function switchAuthMode(mode) {
    const formLogin = document.getElementById("form-login");
    const formRegistro = document.getElementById("form-registro");
    const btnLogin = document.getElementById("btn-tab-login");
    const btnReg = document.getElementById("btn-tab-registro");

    if (mode === 'login') {
        formLogin.style.display = "block";
        formRegistro.style.display = "none";
        btnLogin.classList.add("active");
        btnReg.classList.remove("active");
    } else {
        formLogin.style.display = "none";
        formRegistro.style.display = "block";
        btnLogin.classList.remove("active");
        btnReg.classList.add("active");
    }
}

function switchDashTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
    
    if (tab === 'nova-obra') {
        document.getElementById("tab-nova-obra").style.display = "block";
        event.target.classList.add("active");
    } else {
        document.getElementById("tab-importar-docx").style.display = "block";
        event.target.classList.add("active");
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Erro ao entrar");

        localStorage.setItem("qz_token", data.access_token);
        localStorage.setItem("qz_user", JSON.stringify({ nome: data.nome, tipo: data.tipo_usuario }));
        token = data.access_token;
        userData = { nome: data.nome, tipo: data.tipo_usuario };

        checkAuthState();
        closeModal("modal-auth");
        alert(`Bem-vinda(o), ${data.nome}!`);
    } catch (err) {
        alert(err.message);
    }
}

async function handleRegistro(e) {
    e.preventDefault();
    const nome = document.getElementById("reg-nome").value;
    const email = document.getElementById("reg-email").value;
    const senha = document.getElementById("reg-senha").value;
    const tipo_usuario = document.getElementById("reg-tipo").value;

    try {
        const res = await fetch(`${API_URL}/auth/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha, tipo_usuario })
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Erro ao cadastrar");
        }
        alert("Conta criada com sucesso! Faça login agora.");
        switchAuthMode("login");
    } catch (err) {
        alert(err.message);
    }
}

async function handleNovaObra(e) {
    e.preventDefault();
    const titulo = document.getElementById("obra-titulo").value;
    const sinopse = document.getElementById("obra-sinopse").value;
    const capa_url = document.getElementById("obra-capa").value;
    const link_leitura_externo = document.getElementById("obra-link").value;

    try {
        const res = await fetch(`${API_URL}/historias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ titulo, sinopse, capa_url, link_leitura_externo })
        });
        if (!res.ok) throw new Error("Erro ao publicar obra.");
        alert("História publicada na vitrine com sucesso!");
        document.getElementById("form-nova-obra").reset();
        carregarHistorias();
    } catch (err) {
        alert(err.message);
    }
}

function checkAuthState() {
    if (token && userData.nome) {
        document.getElementById("btn-login-trigger").style.display = "none";
        document.getElementById("user-badge").style.display = "flex";
        document.getElementById("user-name-display").textContent = userData.nome;
        
        if (userData.tipo === "escritora" || userData.tipo === "admin") {
            document.getElementById("link-escritora-nav").style.display = "inline-flex";
            document.getElementById("escritoras").style.display = "block";
        }
    }
}

function logout() {
    localStorage.removeItem("qz_token");
    localStorage.removeItem("qz_user");
    location.reload();
}

function atualizarSelectObras(lista) {
    const select = document.getElementById("docx-select-historia");
    if (!select) return;
    select.innerHTML = lista.map(h => `<option value="${h.id}">${escapeHtml(h.titulo)}</option>`).join("");
}

function escapeHtml(str) {
    return str ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : "";
}

function getHistoriasDemo() {
    return [
        {
            id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
            titulo: "O Universo Fantástico",
            sinopse: "Uma sinopse envolvente sobre o universo literário de Qzverso. Acompanhe a jornada de descoberta, magia e segredos entrelaçados em portais multidimensionais.",
            capa_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
            link_leitura_externo: "https://plataformadeleitura.com/obra/123",
            escritora_nome: "Amanda Andrade",
            visualizacoes: 142
        }
    ];
}
