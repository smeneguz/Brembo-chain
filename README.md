# ManufacturinChain HMI Suite

## Installation

### Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/)
1. Install Docker and Docker Compose (see [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/))
1. From **the root of the repository** run `npm install`

### API

1. Go to `apps/api`
1. Copy `.env.example` to `.env` and edit accordingly. See the [API README](apps/api/README.md) for more information.
1. Run `docker-compose up -d` to start the containers
1. Open `http://localhost:9011` in your browser to access the FusionAuth admin panel (the port can be changed in the `.env` file)
1. Set up FusionAuth admin account
1. Once logged in, create a new Application
1. Copy the Application ID and paste it in the `.env` file as the value of `FUSIONAUTH_APPLICATION_ID`
1. Create an API key
1. Copy the API key and paste it in the `.env` file as the value of `FUSIONAUTH_API_KEY`
1. In "Applications", select "Manage Roles" on the created application and add a super role
1. In "Users" select "Manage" on the existing user
1. In the "Registrations" tab create a new registration for the created application. Please note that a registration's username cannot be used for login: only email or a profile's username can be used for login.
1. You can now use your FusionAuth credentials to log in to the app via the API. Additional users and roles can be created in the FusionAuth admin panel.
1. Run `npx prisma migrate dev` to migrate the database and generate the Prisma client
1. Setup Private Chain (follow the instruction inside the specific folder) and then deploy smart contracts (from contracts folder).
1. Create `.\misc\input\` folder.
1. Run `npm run start:dev` to start the API server
1. Include the xml file for Staor/Rotor/Assembly inside the folder input located in the path `.\misc\input\` (the file will be added in the DB after the prevoius Phase is completed)
1. Navigate to `http://localhost:8200` to access the Vault UI (the port can be changed in the `.env` file)
1. Setup the vault by selecting the number of key shares (9) and key threshold (3) and click on "Initialize"
1. Download the json file with the generated keys
1. Unseal the vault by clicking on "Unseal" and inserting the unseal key (any three of the nine base64 encoded keys in the json file)
    - **Note: the vault will be sealed again if the container is restarted**
1. Login with the root token (found in the json file)
1. Enable a new secret engine (KV) and create a new secret with the path `quorum`, the name `private_key` and a value taken from the private blockchain member nodes
1. Update the .env file with the vault environment variables

### HMI

1. Go to `apps/hmi`
1. Run `npm run dev`
1. Navigate with browser to `http://localhost:5173`
1. Login with email and password inserted in previous steps
