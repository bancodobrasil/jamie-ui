# Jamie UI 

README in Portuguese here [![About_en](https://github.com/yammadev/flag-icons/blob/master/png/BR.png?raw=true)](https://github.com/bancodobrasil/jamie-ui/blob/develop/README-PTBR.md) !

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

Configure Keycloak following the instructions provided in the [Jamie Auth Service](https://github.com/bancodobrasil/jamie-auth-service).

### Environment Configuration

Next, make a copy of the `.env.development` file, renaming it to just `.env`. Configure the `JAMIE_API_BASE_URL` variable as follows:

```
JAMIE_API_BASE_URL=http://localhost:5000
```

### Jamie API

Next, follow the instructions in the [Jamie API README](https://github.com/bancodobrasil/jamie-api) to proceed.

## Running 

Now that everything is set up, simply open your Jamie UI project's terminal and type `yarn start`. This will load the page locally at `localhost:3000`.