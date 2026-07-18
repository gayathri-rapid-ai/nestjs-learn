# NestJS EC2 Starter

A minimal NestJS API with CI tests and a GitHub Actions deployment workflow for an EC2 instance.

## Local development

```bash
npm install
cp .env.example .env
npm run start:dev
```

Open `http://localhost:3000/health`; it returns `{ "status": "ok" }`.

## Test and build

```bash
npm run lint
npm run test:cov
npm run test:e2e
npm run build
```

## EC2 one-time setup

Use an Ubuntu EC2 instance with inbound TCP access to the app port (default `3000`) and inbound SSH restricted to trusted addresses. Install Git and Docker, then add the deployment user to the Docker group:

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in after changing group membership. Clone this repository on the instance into a persistent directory, for example `/opt/nestjs-ec2-starter`, and create its production environment file:

```bash
sudo mkdir -p /opt/nestjs-ec2-starter
sudo chown "$USER":"$USER" /opt/nestjs-ec2-starter
git clone <YOUR_REPOSITORY_SSH_URL> /opt/nestjs-ec2-starter
cd /opt/nestjs-ec2-starter
cp .env.example .env.production
chmod 600 .env.production
docker compose up --build --detach
```

Set production-only values in `.env.production`; it is intentionally ignored by Git. The deploy workflow copies this file into `.env` before starting the updated container.

## GitHub configuration

Create a GitHub Environment named `production` and add these secrets:

| Secret | Value |
| --- | --- |
| `EC2_HOST` | Public IP address or DNS name of the EC2 instance |
| `EC2_USERNAME` | Linux deployment user, such as `ubuntu` |
| `EC2_SSH_PRIVATE_KEY` | Private SSH key matching a public key in that user's `~/.ssh/authorized_keys` |
| `EC2_SSH_PORT` | SSH port, normally `22` |
| `EC2_APP_PATH` | Absolute clone path, such as `/opt/nestjs-ec2-starter` |

The EC2 clone must be able to `git fetch` the repository. For a private repository, configure an EC2 deploy key with read-only repository access or use another non-interactive Git credential. Each push to `main` runs CI and then deploys the exact pushed commit. Protect the `production` environment with required reviewers when appropriate.

## Deployment notes

The workflow uses `docker compose up --build`, so EC2 builds the image locally. This is straightforward for a sample service. For larger applications, publish an immutable image to Amazon ECR in CI and have EC2 pull that image instead.
