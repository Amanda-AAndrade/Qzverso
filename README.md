# Qzverso

PROJETO QZVERSO - PORTAL LITERÁRIO

# 🌌 Qzverso — Portal de Divulgação Literária

O **Qzverso** é um portal desenvolvido como Projeto de Extensão Universitária no curso de Engenharia de Software, dedicado à divulgação de histórias, parcerias e produtos relacionados ao seu universo literário.

Inspirado na experiência de descoberta de conteúdos de plataformas de entretenimento, as histórias são apresentadas aos leitores por meio de capas, sinopses e informações sobre as obras. O portal não possui como objetivo oferecer a leitura integral das obras; ao se interessar por uma história, o leitor é direcionado através de um link para o espaço externo onde a obra está publicada e disponível para leitura.

---

## 🚀 Funcionalidades Principais

* **Cadastro e Autenticação de Leitores**: Acesso seguro para os leitores no portal.
* **Área Exclusiva para as Escritoras**: Painel de gestão restrito para administração e publicação de obras.
* **Publicação de Histórias e Capítulos**: Exibição estruturada do catálogo literário.
* **Importação de Capítulos em Formato DOCX**: Módulo automatizado para parsing e ingestão de arquivos `.docx`.
* **Divulgação de Parceiros, Produtos e Projetos**: Espaço para promoção de parceiros, iniciativas e produtos do universo literário.

---

## 🛠️ Stack Tecnológico

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: FastAPI (Python)
* **Banco de Dados**: PostgreSQL
* **Analytics**: Power BI

---

## 🗄️ Estrutura do Banco de Dados &amp; BI

O repositório conta com scripts SQL prontos para inicialização e inteligência de negócios:

* `schema-qzverso.sql`: Script DDL para criação do esquema no PostgreSQL (tabelas de `usuarios`, `historias`, `capitulos`, `parceiros` e `produtos`).
* `queries-bi-qzverso.sql`: Views otimizadas para integração direta com o Power BI (métricas de leitores, capítulos importados, engajamento e parceiros).

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos

* Python 3.10+
* PostgreSQL 14+
* Servidor Web (ou extensão Live Server)

### 1\. Configuração do Banco de Dados (PostgreSQL)

```
psql -U seu_usuario -d seu_banco -f schema-qzverso.sql
psql -U seu_usuario -d seu_banco -f queries-bi-qzverso.sql

```

### 2\. Configuração do Backend (FastAPI)

```
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

```

---

## 📜 Licença e Propriedade Intelectual

Este projeto adota um modelo de **Licenciamento Híbrido**:

**Código-Fonte (Engine &amp; Arquitetura)**: Licenciado sob a [Apache License 2.0](LICENSE). O código da aplicação (Backend em FastAPI, esquemas PostgreSQL, parser DOCX e Frontend) está liberado para avaliação acadêmica, auditoria de código e exibição em portfólio de Engenharia de Software.

**Marca e Universo Literário**: O nome **Qzverso**, logotipos, artes visuais, sinopses, produtos e todos os conteúdos literários associados são protegidos por **Direitos Autorais Reservados (Copyright © Todos os Direitos Reservados)**. O uso da marca "Qzverso" ou de seus elementos narrativos por terceiros ou para fins comerciais é estritamente proibido.
