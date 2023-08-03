# Jamie UI

## Dependências

Para executar este projeto, você precisa ter certos pré-requisitos configurados em sua máquina. Esses pré-requisitos incluem:

- [Node](https://nodejs.org/en)
- [npm](https://www.npmjs.com/)
- [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)
- [Jamie API](https://github.com/bancodobrasil/jamie-api/)

## Preparativos

Abra o diretório do projeto no terminal rode `yarn`. 

Em seguida, rode o comando `docker compose up -d` no mesmo diretório. 

Após terem sido baixadas todas as dependências, será necessário configurar o keycloak para a utilização do Jamie. O docker subirá uma aplicação do keycloak na porta `8080`, abra ela em seu browser para configuração `localhost:8080`, carregará uma tela semelhante a a seguir:

![Tela inicial Keycloa](img/telaInicial-keycloak.png)

Clique em `Administration Console`, abrirá uma tela de login, digite na tela
username: `admin` e password: `admin`. Se iniciará uma tela semelhante a a seguir:

![Tela inicial Keycloa](img/keycloak-logado.png)

Em seguida será necessário criar o `realm`, na caixa vermelha marcada na foto, clique nela, e em abaixo de master terá uma opção de criar um Realm.
Ao abrir a 

![Tela inicial Keycloa](img/criando-realm.png)

Em **Realm name** digite `jamie`, em seguida clique em create. Na tela inicil do keycloak, no mesmo lugar em que foi clicado para criar um Realm aparecerá o Realm jamie que acabamos de criar, entre nele. 

Em seguida no menu lateral clique em **Clients** e abrirá uma tela semelhante a seguir:

![Tela inicial Keycloa](img/clients-menu.png)

Clique em **Create Client**, iremos criar dois clientes, um para a UI e outro para API.

### Jamie UI
Preencha os campos com os seguintes dados:
 
- **Client ID**: jamie

- **Name**: Jamie UI

Em **ACCESS Settings** coloque:
- **Valid Redirect URIs**: http://localhost:80/* http://localhost:3000/*
http://localhost/*



------
- subir docker compose do jamie ui
`docker compose up -d`

- configurar keycloak

    criar realm `jamie`
    criar client `jamie` (para a UI)
    criar client `jamie-api` (para a api)

    criar realm roles 
        - reader
        - editor
        - manager
        - admin (opcional)

    criar seu usuário 
        definir papel de admin
        definir credencial 

- configurar as variaveis de ambiente do Jamie UI (.env)

        JAMIE_API_BASE_URL=http://localhost:5000

- subir jamie-api
<!-- colocar link do github do jamie api -->
`docker compose up -d`

-

 <!-- A seguir, para rodar o projeto digite `yarn start` ele carregará a página localmente em `localhost:3000`.-->