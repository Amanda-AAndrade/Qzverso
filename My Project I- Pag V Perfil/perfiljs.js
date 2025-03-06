document.addEventListener("DOMContentLoaded", function () {
    const fotoUpload = document.getElementById("foto-upload");
    const fotoPreview = document.getElementById("foto-preview");
    const perfilForm = document.getElementById("perfil-form");

    // Carregar dados salvos anteriormente
    document.getElementById("nome").value = localStorage.getItem("nome") || "";
    document.getElementById("bio").value = localStorage.getItem("bio") || "";
    document.getElementById("data-nascimento").value = localStorage.getItem("dataNascimento") || "";

    // Mostrar foto salva anteriormente
    const fotoSalva = localStorage.getItem("fotoPerfil");
    if (fotoSalva) {
        fotoPreview.src = fotoSalva;
    }

    // Atualizar foto ao selecionar arquivo
    fotoUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                fotoPreview.src = e.target.result;
                localStorage.setItem("fotoPerfil", e.target.result); // Salva no localStorage
            };
            reader.readAsDataURL(file);
        }
    });

    // Salvar dados do perfil
    perfilForm.addEventListener("submit", function (event) {
        event.preventDefault();
        localStorage.setItem("nome", document.getElementById("nome").value);
        localStorage.setItem("bio", document.getElementById("bio").value);
        localStorage.setItem("dataNascimento", document.getElementById("data-nascimento").value);
        alert("Perfil salvo com sucesso!");
    });
});
