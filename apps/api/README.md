# Brembochain API

## Environment variables

- `COMPOSE_PROJECT_NAME`: the name of the project, used to prefix the containers' names
- `DOCKER_RESTART_POLICY`: the restart policy for the containers, can be `no`, `always`, `on-failure`, `unless-stopped`
- `REDIS_PORT`: the port on which Redis will be exposed on the local machine
- `DATABASE_URL`: the URL of the database, in the form `postgres://<username>:<password>@<host>:<port>/<database>`
- `DATABASE_USERNAME`: the username to use to connect to the database
- `DATABASE_PASSWORD`: the password to use to connect to the database
- `DATABASE_NAME`: the name of the database for the application
- `DATABASE_PORT`: the port on which the database will be exposed on the local machine

- `FUSIONAUTH_APP_MEMORY`: the amount of memory to allocate to FusionAuth
- `FUSIONAUTH_APP_RUNTIME_MODE`: the runtime mode for FusionAuth, can be `development` or `production`
- `FUSIONAUTH_DATABASE_NAME`: the name of the database for FusionAuth
- `FUSIONAUTH_PORT`: the port on which FusionAuth will be exposed on the local machine
- `FUSIONAUTH_API_KEY`: the API key to use to connect to FusionAuth
- `FUSIONAUTH_APPLICATION_ID`: the ID of the application to use to connect to FusionAuth

- `API_URL`: the URL of the API, in the form `http(s)://<host>:<port>`
- `API_PORT`: the port on which the API will be exposed on the local machine
- `FRONTEND_URL`: the URL of the frontend, in the form `http(s)://<host>:<port>`
- `API_ROOT_PATH`: the root path of the API, used to prefix the API routes
- `QUEUE_INPUT_DIRECTORY`: the path where process xml files should be placed

- `VAULT_PORT`: the port on which Vault will be exposed on the local machine
- `VAULT_API_URL`: the URL of the Vault API, in the form `http(s)://<host>:<port>`
- `VAULT_TOKEN`: the token to use to connect to Vault
- `VAULT_SECRET_KEYPATH`: the path to the secrets in Vault (KV storage name)
- `VAULT_SECRET_KEYNAME`: the name of the key within the secret in the Vault
