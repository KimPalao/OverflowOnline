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

1. Create a copy of the `local.env` file named `.env`
2. Start the frontend by running `npm run dev` in the `overflow-frontend` folder
3. Start the backend by running `npm run start:dev` in the `overflow-backend` folder