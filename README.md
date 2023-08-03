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