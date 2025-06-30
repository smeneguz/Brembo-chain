# Brembo Private Blockchain

Here the explanation on how instantiate and run Private Blockchain nodes.

## Pre-requisites

### Operative system requirements

- Linux Ubuntu 22.04

It may work with different versions of the operating system, but we do not guarantee.

### Software requirements

- Docker (v24.0.6)
- docker-compose (v2.21.0)
- NodeJS (v20)

## Installation

- Make a copy of **.env.example** file and rename it as **.env**;
- Fill the **.env** file with Private Blockchain configuration values. We have put some suggested values, but you can choose what you want;
- Run _setup.sh_ with following command:

```bash
bash setup.sh
```

Don't mind if the script takes some time to complete all the process.
**ATTENTION!**: Run the script only the first time. In other case fatal errors could be occurred.

- Once the script has finished you can run following command to make nodes available:

```bash
docker compose up --build
```

- If you want to stop and remove your blockchain nodes simply run following command:

```bash
docker compose down
```
