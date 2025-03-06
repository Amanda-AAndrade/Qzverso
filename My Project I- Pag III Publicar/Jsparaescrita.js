// Exibir a prévia da capa ao fazer upload
document.getElementById("capa-upload").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById("capa-preview").src = e.target.result;
      };
      reader.readAsDataURL(file);
  }
});

// Simulação de salvamento automático
let editor = document.getElementById("editor");
editor.addEventListener("input", function() {
  localStorage.setItem("historiaDraft", editor.value);
});

window.onload = function() {
  if (localStorage.getItem("historiaDraft")) {
      editor.value = localStorage.getItem("historiaDraft");
  }
};

// Simulação do "Ctrl + Z" (Desfazer)
editor.addEventListener("keydown", function(event) {
  if (event.ctrlKey && event.key === "z") {
      document.execCommand("undo");
  }
});

// Função para importar arquivos (Word/PDF) — (Precisa ser implementada)
function importarArquivo() {
  alert("Funcionalidade de importação ainda em desenvolvimento...");
}

// Função para exportar história
function exportarArquivo() {
  const blob = new Blob([editor.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "MinhaHistoria.txt";
  a.click();
}

// Simulação do botão de salvar capítulo
function salvarCapitulo() {
  alert("Capítulo salvo com sucesso!");
}
