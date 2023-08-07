# Jamie UI 

Leia em Inglês aqui  [![About_en](https://github.com/yammadev/flag-icons/blob/master/png/US.png?raw=true)](https://github.com/bancodobrasil/jamie-ui/blob/develop/README.md) !

## Dependências

Para executar o projeto Jamie UI em sua máquina, é necessário configurar algumas dependências. Certifique-se de que você possui os seguintes pré-requisitos:

- [Node](https://nodejs.org/en)
- [npm](https://www.npmjs.com/)
- [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)
- [Jamie API](https://github.com/bancodobrasil/jamie-api/)

## Preparativos

Siga os passos abaixo para configurar o ambiente e executar o projeto Jamie UI:

### Instalando Dependências e Inicializando Docker

Abra o diretório do projeto no terminal rode `yarn`. Em seguida, rode o comando `docker compose up -d` no mesmo diretório. O docker subirá uma aplicação do keycloak na porta `8080`, abra ela em seu browser para configuração `localhost:8080`.

### Keycloak

Configure o Keycloak de acordo com o que é escrito no [Jamie Auth Service](https://github.com/bancodobrasil/jamie-auth-service).

### Configuração de Ambiente

Em seguida faça uma cópia do arquivo `.env.development`, deixando ele apenas ficar com o nome de `.env`. Configure a variável `JAMIE_API_BASE_URL` semelhante a seguir:

    JAMIE_API_BASE_URL=http://localhost:5000


### Jamie API

Em seguida, faça os processos do README do [Jamie API](https://github.com/bancodobrasil/jamie-api).


## Executando 

Agora temos tudo configurado, basta entrar no terminal do projeto do Jamie UI e digitar `yarn start` ele carregará a página localmente em `localhost:3000`.


<!--- 
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
<!-- colocar link do github do jamie api 
`docker compose up -d`
--->