document.getElementById("cadastroForm").addEventListener("submit", function (event) {
    let senha = document.getElementById("senha").value;
    let confirmarSenha = document.getElementById("confirmar_senha").value;
    let erroSenha = document.getElementById("erro_senha");

    if (senha !== confirmarSenha) {
        event.preventDefault(); // Impede o envio do formulário
        erroSenha.style.display = "block";
    } else {
        erroSenha.style.display = "none";
    }
});
