# Controle de Territórios

Sistema para gerenciar usuários, territórios e registros de retirada, com controle de prazos, renovações e devoluções.

## Visão geral

Este projeto combina um backend em Java com Spring Boot e um frontend em React/Vite. O objetivo do sistema é permitir:

- cadastrar e listar usuários;
- cadastrar e listar territórios;
- registrar a retirada de um território por um usuário;
- acompanhar prazos de renovação e entrega obrigatória;
- buscar registros por nome, território e data;
- renovar ou devolver territórios;
- visualizar o status de cada retirada de forma prática.

## Stack tecnológica

### Backend
- Java 17
- Spring Boot 3.2.3
- Spring Web
- Spring Data JPA
- MySQL Driver

### Frontend
- React 19
- Vite
- TypeScript
- Axios
- Lucide React

## Estrutura do projeto

```text
Controle_Territorio/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/sistema/territorios/
│       │       ├── config/
│       │       ├── controller/
│       │       ├── model/
│       │       └── repository/
│       └── resources/
│           └── application.properties
├── frontend-territorios/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── pom.xml
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Funcionalidades principais

### Usuários
- cadastro de usuários;
- listagem;
- edição;
- exclusão.

### Territórios
- cadastro de territórios;
- identificação de ocupação;
- alteração de nome/identificação;
- exclusão.

### Retiradas
- registro de retirada com usuário e território;
- validação para impedir território em uso;
- cálculo automático de prazos;
- atualização de data de retirada;
- renovação;
- devolução;
- busca com filtros.

### Status de alerta
O modelo `RegistroRetirada` calcula automaticamente o status do registro:

- `DENTRO DO PRAZO`
- `OPCIONAL: RENOVAR OU ENTREGAR (>= 4 meses)`
- `ENTREGA IMEDIATA (>= 8 meses)`
- `ENTREGUE`
- `DATA DE RETIRADA NÃO DEFINIDA`

## Requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- JDK 17+
- Maven
- Node.js 18+
- MySQL 8+

## Configuração do banco

O projeto usa um banco MySQL local. Configure as variáveis do ambiente ou edite o arquivo `src/main/resources/application.properties` com suas credenciais locais:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/<nome_do_banco>?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=<usuario>
spring.datasource.password=<senha>
spring.jpa.hibernate.ddl-auto=update
```

Certifique-se de criar o banco antes de iniciar a aplicação:

```sql
CREATE DATABASE <nome_do_banco>;
```

> Evite armazenar senhas fixas no repositório. Prefira variáveis de ambiente ou arquivos locais ignorados pelo Git.

## Como executar o backend

Na raiz do projeto:

```bash
mvn clean install
mvn spring-boot:run
```

A API ficará disponível em:

```text
http://localhost:8080
```

## Como executar o frontend

No diretório do frontend:

```bash
cd frontend-territorios
npm install
npm run dev
```

O frontend fica em:

```text
http://localhost:5173
```

## Endpoints principais

### Usuários
- `GET /usuarios`
- `POST /usuarios`
- `PUT /usuarios/{id}`
- `DELETE /usuarios/{id}`

### Territórios
- `GET /territorios`
- `POST /territorios`
- `PUT /territorios/{id}`
- `DELETE /territorios/{id}`

### Retiradas
- `POST /retiradas?usuarioId={id}&territorioId={id}&dataRetirada={yyyy-MM-dd}`
- `GET /retiradas/busca?nome=...&territorioId=...&dataRetirada=...`
- `PUT /retiradas/{id}/renovar`
- `PUT /retiradas/{id}/devolver`
- `PUT /retiradas/{id}?usuarioId={id}&territorioId={id}`

## Docker

O repositório contém um `docker-compose.yml` para subir o ambiente com MySQL, backend e frontend. Porém, a estrutura atual do projeto e os caminhos de build podem exigir ajustes conforme a organização local do workspace.

Exemplo do fluxo esperado:

```bash
docker-compose up --build
```

> Verifique os caminhos dos serviços e do build antes de usar o Docker, principalmente se o backend e o frontend estiverem em diretórios com nomes diferentes dos referenciados no compose.

## Observações de desenvolvimento

- O backend utiliza JPA com atualização automática do schema (`ddl-auto=update`).
- O frontend faz chamadas para o backend em `http://localhost:8080` via Axios.
- A aplicação foi pensada para um fluxo operacional simples de gestão territorial.

## Próximos passos sugeridos

- adicionar autenticação de usuários;
- incluir filtros mais avançados e paginação;
- criar testes automatizados para backend e frontend;
- separar melhor configuração por ambiente (`dev`, `test`, `prod`);
- ajustar o Docker para refletir a estrutura real do repositório.

## Licença

Este projeto não especifica uma licença no momento. Ajuste conforme a necessidade da sua organização ou cliente.
