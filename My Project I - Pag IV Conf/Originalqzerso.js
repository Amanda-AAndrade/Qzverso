// Carregar configurações salvas ao abrir a página
window.onload = function() {
    if (localStorage.getItem("idioma")) {
        document.getElementById("idioma").value = localStorage.getItem("idioma");
    }
    if (localStorage.getItem("tema")) {
        document.getElementById("tema").value = localStorage.getItem("tema");
        aplicarTema(localStorage.getItem("tema"));
    }
};

// Salvar configurações no localStorage
function salvarConfiguracoes() {
    const idioma = document.getElementById("idioma").value;
    const tema = document.getElementById("tema").value;

    localStorage.setItem("idioma", idioma);
    localStorage.setItem("tema", tema);

    aplicarTema(tema);

    alert("Configurações salvas com sucesso!");
}

// Aplicar o tema ao site
function aplicarTema(tema) {
    if (tema === "dark") {
        document.body.style.backgroundColor = "#000";
        document.body.style.color = "#fff";
    } else if (tema === "sepia") {
        document.body.style.backgroundColor = "#f4ecd8";
        document.body.style.color = "#333";
    } else if (tema === "light") {
        document.body.style.backgroundColor = "#fff";
        document.body.style.color = "#000";
    }
}
