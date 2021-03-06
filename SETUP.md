# Overflow: Online

## Development

### Requirements

1. Docker
- [Windows 10 Pro](https://www.docker.com/products/docker-desktop)*
- [Windows 10 Home](https://docs.docker.com/docker-for-windows/install-windows-home/)
- [Linux](https://docs.docker.com/engine/install/)

* Note: Using Docker with Hyper-V prevents you from running VirtualBox

2. VS Code
- [Remote Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Steps

1. Run `update-env.sh`

    `source update-env.sh`

1. Run the migrations

    `cd overflow-backend && npm run typeorm migration:run`

1. Start the frontend by running `npm run dev` in the `overflow-frontend` folder

    `cd overflow-frontend && npm run dev`

1. Start the backend by running `npm run start:dev` in the `overflow-backend` folder

    `cd overflow-backend && npm run start:dev`

### Resetting

1. Remove the database container

    `docker container rm overflowonline_devcontainer_db_1`

2. Remove the mongodb-data volume
   
    `docker volume rm overflowonline_devcontainer_mongodb-data`

3. Rebuild the container