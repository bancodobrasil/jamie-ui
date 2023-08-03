# Jamie UI

## Dependencies

To run the Jamie UI project on your machine, it is necessary to configure certain dependencies. Make sure you have the following prerequisites:

- [Node](https://nodejs.org/en)
- [npm](https://www.npmjs.com/)
- [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)
- [Jamie API](https://github.com/bancodobrasil/jamie-api/)

## Preparations

Follow the steps below to set up the environment and run the Jamie UI project:


### Installing Dependencies and Initializing Docker

Open the project directory in your terminal and run `yarn` to install the dependencies. Next, execute the command `docker-compose up -d` in the same directory. Docker will launch a Keycloak application on port `8080`. Open your browser and navigate to `localhost:8080` for configuration.

### Keycloak

After all dependencies have been downloaded, it will be necessary to configure Keycloak for Jamie's usage. On `localhost:8080`, a screen similar to the following will load:

![Tela inicial Keycloa](img/telaInicial-keycloak.png)

Click on `Administration Consol`, which will open a login screen. Enter the following credentials:

    Username: admin
    Password: admin

This will initiate a screen similar to the following:

![Tela inicial Keycloa](img/keycloak-logado.png)

Next, you will need to create the `realm`. To do this, click on the red-bordered area in the image. Under the "Master" section, you will find the option to create a new Realm. Upon selecting this option, the screen will display:

![Criando Realm](img/criando-realm.png)

In **Realm name**, enter `jamie`, then click on create. On the initial Keycloak screen, in the same location where you clicked to create a Realm, you will now see the newly created "jamie" Realm. Enter this Realm.

Next, on the side menu, click on **Clients**, which will open a screen similar to the following:

![Tela inicial Keycloak](img/clients-menu.png)

Click on **Create Client**, we will create two clients, one for Jamie UI and another for Jamie API.

### Jamie UI Client Configuration
Fill in the fields with the following data:

1. **Client ID**: jamie

2. **Name**: Jamie UI

3. Under **ACCESS Settings**, input:
    - **Valid Redirect URIs**:
        - http://localhost:80/* 
        - http://localhost:3000/*
        - http://localhost/*

    - **Valid Post Logout Redirect URIs**: 
        - http://localhost:80/* 
        - http://localhost:3000/*
        - http://localhost/*

    - **Web Origins**: 
        - http://localhost:80
        - http://localhost:3000
        - http://localhost

4. In **Capability Config**,

    **Uncheck**:
    - Client Authentication
    - Authorization
    
    **Enable(ON)**:
    - Standard Flow
    - Direct Access Grants