# 🌌 Qzverso — Portal de Divulgação &amp; Hub Literário

&gt; **Projeto de Extensão Universitária em Engenharia de Software**  
&gt; *Uma experiência moderna e intuitiva de descoberta literária inspirada em plataformas de entretenimento.*

---

## 📖 Sobre o Projeto

O **Qzverso** é um portal dinâmico voltado para a divulgação de histórias, parcerias, projetos e produtos integrados ao seu próprio universo literário [1, 2].

Com uma proposta visual inspirada no formato de descoberta das grandes plataformas de entretenimento, o portal apresenta obras por meio de capas de alto impacto, sinopses envolventes e informações detalhadas [1]. O Qzverso funciona como uma **vitrine de curadoria e hub de navegação**: ele não disponibiliza a leitura integral das obras na plataforma, mas conecta os leitores diretamente aos locais externos onde cada texto está oficialmente publicado e pronto para leitura [1].

Além da divulgação literária, o Qzverso reserva espaços dedicados para a vitrine de parceiros, projetos colaboradores e catálogo de produtos e iniciativas associadas ao ecossistema [2].

---

## 🎯 Objetivos de Extensão &amp; Impacto Social

Como **Projeto de Extensão em Engenharia de Software**, o Qzverso atende aos seguintes pilares:

1. **Fomento à Literatura**: Facilita a ponte entre leitoras(es) e obras literárias através de uma interface de descoberta atraente [1].
2. **Espaço Exclusivo para Escritoras**: Oferece uma área restrita e intuitiva para que as autoras gerenciem suas publicações [2].
3. **Inovação Técnica &amp; Automação**: Aplica conceitos avançados de software, incluindo o processamento automatizado de arquivos `.docx` no backend para ingestão de capítulos [2].

---

## 🚀 Funcionalidades Principais

* 🔐 **Cadastro e Autenticação de Leitores**: Sistema seguro de criação de conta e acesso personalizado para os leitores [2].
* ✍️ **Área Exclusiva para Escritoras**: Painel de gestão restrito para publicação e edição de obras e capítulos [2].
* 📚 **Publicação de Histórias e Capítulos**: Estruturação organizada de obras, informações e links externos de leitura [1, 2].
* 📄 **Importação Automática via DOCX**: Módulo de ingestão que realiza a parsing de capítulos diretamente de arquivos no formato `.docx` [2].
* 🤝 **Divulgação de Parceiros e Produtos**: Espaço exclusivo para promoção de iniciativas parceiras e catálogo de produtos [2].

---

## 🛠️ Stack Tecnológico

A arquitetura do sistema é dividida em camadas bem definidas para garantir desempenho e escalabilidade:

| Camada             | Tecnologia              | Descrição                                                              |
| ------------------ | ----------------------- | -----------------------------------------------------------------------|
| **Frontend**       | HTML5, CSS3, JavaScript | Interface responsiva e interativa no estilo vitrine de streaming [2]   |
| **Backend**        | FastAPI (Python)        | API REST de alta performance e parser para importação de .docx [2]     |
| **Banco de Dados** | PostgreSQL              | Armazenamento relacional de usuários, obras, capítulos e parceiros [2] |
| **Analytics &amp; BI** | Power BI            | Dashboard para análise de métricas de engajamento e cliques [2]        |

---

## 🗄️ Estrutura do Banco de Dados &amp; Scripts BI

O projeto acompanha os scripts de banco de dados prontos para execução no PostgreSQL:

* `schema-qzverso.sql`: Script DDL para criação das tabelas (`usuarios`, `historias`, `capitulos`, `parceiros`, `produtos`) com integridade referencial e índices.
* `queries-bi-qzverso.sql`: Conjunto de *Views* otimizadas para integração direta com o Power BI, cobrindo métricas de leitores, capítulos importados e parceiros.

---

## ⚙️ Instalação e Execução

### Pré-requisitos

* **Python 3.10+**
* **PostgreSQL 14+**
* **Servidor Web / Live Server** (para o Frontend)

### 1\. Inicializar o Banco de Dados

```
psql -U seu_usuario -d seu_banco -f schema-qzverso.sql
psql -U seu_usuario -d seu_banco -f queries-bi-qzverso.sql

```

### 2\. Configurar e Executar o Backend

```
cd backend

# Criar e ativar o ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências e iniciar o servidor FastAPI
pip install -r requirements.txt
uvicorn main:app --reload

```
---

## 📜 Licenciamento Híbrido

O repositório adota um modelo de **Licenciamento Híbrido** para atender aos requisitos acadêmicos/profissionais sem comprometer os direitos de marca:

1. **Código-Fonte (Engine &amp; Arquitetura)**: Licenciado sob a **[Apache License 2.0](LICENSE)**. O código (FastAPI, esquemas SQL, parser `.docx` e Frontend) está aberto para avaliação acadêmica, auditorias de código e exibição em portfólios de Engenharia de Software.
2. **Marca &amp; Conteúdo Literário**: O nome **Qzverso**, marcas registradas, logotipos, sinopses, artes e obras são de propriedade intelectual exclusiva das autoras (**Copyright © Todos os Direitos Reservados**). É vedada qualquer reprodução comercial ou uso do nome e elementos narrativos por terceiros.
