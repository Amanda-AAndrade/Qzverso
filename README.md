# Qzverso — Um Universo de Histórias

<p align="center">
  <img src="qzverso.jpg" width="150" alt="Símbolo Qzverso">
</p>

<p align="center"><strong>Uma história pode ser o começo de um universo inteiro.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-9333EA" alt="Status: em desenvolvimento">
  <img src="https://img.shields.io/badge/front--end-HTML%20%7C%20CSS%20%7C%20JavaScript-38BDF8" alt="Stack: HTML, CSS e JavaScript">
  <img src="https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue" alt="Licença Apache 2.0">
</p>

---

## Sobre o projeto

O **Qzverso** é um portal de descoberta e divulgação literária criado para aproximar histórias, escritoras e leitores. A plataforma reúne informações sobre as obras — como título, capa, autoria e sinopse — e direciona o público aos ambientes externos onde a leitura integral está disponível.

O projeto surgiu da cultura de fãs e da criação de narrativas que se expandiram para além de uma única história. Com o tempo, esse trabalho criativo ganhou identidade própria, personagens e um universo compartilhado pelas escritoras Qz, Julia e Marina.

O portal não hospeda os capítulos completos. Sua função é apresentar as obras e facilitar o caminho até suas plataformas oficiais de publicação.

## Objetivos

- Organizar a divulgação das obras em uma vitrine única.
- Facilitar a descoberta por título, sinopse e autoria.
- Valorizar a produção literária independente e o protagonismo feminino.
- Conectar o público a plataformas de leitura e iniciativas parceiras.
- Evoluir o projeto com práticas de desenvolvimento, documentação e organização de software.

## Funcionalidades e situação atual

| Recurso | Situação nesta versão |
|---|---|
| Interface pública responsiva | Implementada |
| Vitrine de histórias | Implementada com conteúdo demonstrativo local |
| Busca por título, sinopse e escritora | Implementada |
| Filtros por escritora | Implementados |
| Modal com detalhes da obra | Implementado |
| Redirecionamento para leitura externa | Implementado para a obra demonstrativa |
| Apresentação de parceiros | Implementada |
| Login e cadastro | Formulários estilizados, validação de confirmação de senha e chamadas preparadas; autenticação real depende de API |
| Publicação de obras | Interface preparada; depende de API e autorização |
| Importação de capítulos DOCX | Em desenvolvimento; não está ativa |
| Perfil e preferências do leitor | Planejados; dependem de API e persistência |

> **Importante:** o repositório contém atualmente o front-end. Não há serviço de backend ou banco de dados versionado nesta estrutura. Sem a configuração de uma API compatível, login, cadastro e publicação não funcionam. O catálogo público utiliza dados demonstrativos definidos em `app.js`.

## Tecnologias

**Implementadas no front-end**
- HTML5 — estrutura e semântica.
- CSS3 — layout responsivo, componentes e identidade visual.
- JavaScript — renderização do catálogo, busca, filtros, modais e interações.

**Recursos externos**
- Google Fonts — tipografia Outfit e Plus Jakarta Sans.
- Font Awesome — biblioteca de ícones.

Frameworks de backend, banco de dados e infraestrutura não devem ser considerados parte da stack implementada enquanto não forem integrados e versionados neste repositório.

## Estrutura de arquivos

```text
Qzverso/
├── index.html      # Página principal e estrutura do portal
├── perfil.html     # Página informativa da área de perfil
├── styles.css      # Identidade visual e responsividade
├── app.js          # Busca, filtros, catálogo, modais e integração opcional
├── qzverso.jpg     # Símbolo visual do projeto
├── README.md       # Documentação
├── LICENSE         # Licença
└── .gitignore
```

## Como executar localmente

O projeto é um front-end estático e não exige instalação de dependências via npm.

### 1. Clonar o repositório

```bash
git clone https://github.com/Amanda-AAndrade/Qzverso.git
```

### 2. Entrar na pasta

```bash
cd Qzverso
```

### 3. Iniciar um servidor local

Com Python 3:

**Windows**
```powershell
py -m http.server 5500
```

**Linux ou macOS**
```bash
python3 -m http.server 5500
```

### 4. Abrir no navegador

```text
http://localhost:5500
```

Também é possível abrir a pasta no Visual Studio Code e executar o projeto com a extensão Live Server.

## Comandos úteis de desenvolvimento

Verificar alterações locais:

```bash
git status
```

Atualizar a cópia local antes de começar:

```bash
git pull origin main
```

Verificar a sintaxe do JavaScript com Node.js:

```bash
node --check app.js
```

Adicionar e registrar alterações:

```bash
git add .
git commit -m "feat: aprimora portal Qzverso"
git push origin main
```

Não é necessário executar `npm install` nesta versão, pois o projeto não possui dependências instaladas por npm nem um processo de build.

## Integração futura com API

O front-end aceita uma URL de API opcional. Para habilitar as rotas de autenticação e gerenciamento, configure `window.QZVERSO_CONFIG` antes de carregar `app.js` no final de `index.html`:

```html
<script>
  window.QZVERSO_CONFIG = {
    apiUrl: "https://SEU-DOMINIO/api"
  };
</script>
<script src="app.js"></script>
```

A API deverá disponibilizar, no mínimo, as rotas consumidas pelo front-end:
- `GET /historias`
- `POST /auth/login`
- `POST /auth/registro`
- `POST /historias` para publicação autenticada

O servidor também deverá permitir requisições CORS originadas do domínio publicado do Qzverso. Utilize HTTPS no ambiente público. Não coloque senhas, chaves privadas ou credenciais no JavaScript do navegador.

Enquanto a API não estiver configurada, a página utiliza o catálogo demonstrativo e mantém indisponíveis as operações que exigem conta ou persistência.

## Publicação no GitHub Pages

O projeto pode ser publicado como site estático:

1. Abra **Settings → Pages** no repositório.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/ (root)`.
4. Salve e aguarde a publicação automática do GitHub Pages.

Endereço público:

[https://amanda-aandrade.github.io/Qzverso/](https://amanda-aandrade.github.io/Qzverso/)

## Próximas etapas

- [x] Consolidar a estrutura inicial do front-end.
- [x] Refinar a identidade visual e a navegação.
- [x] Implementar busca, filtros e modal de detalhes.
- [x] Organizar a apresentação do ecossistema parceiro.
- [ ] Validar o catálogo e os metadados de todas as obras com as escritoras.
- [ ] Definir contratos e requisitos da API.
- [ ] Modelar e implementar persistência de dados.
- [ ] Implementar autenticação e autorização no backend.
- [ ] Concluir o painel administrativo e a importação DOCX.
- [ ] Implementar perfil, preferências e regras de classificação indicativa.
- [ ] Adicionar testes automatizados e documentação da API.

## Créditos e direitos

**Desenvolvimento:** Amanda Andrade.

O código-fonte está identificado sob a licença Apache 2.0, conforme o arquivo `LICENSE`. A licença do código não transfere direitos sobre histórias, personagens, capas, ilustrações, marcas ou demais conteúdos criativos. Esses materiais pertencem às respectivas titulares e devem ser utilizados conforme as autorizações aplicáveis.

---

<p align="center"><strong>Qzverso — Uma história pode ser o começo de um universo inteiro.</strong></p>
