# NestJS EC2 Starter

A minimal NestJS API with Docker-based Jenkins tests and deployment through Amazon ECR to an EC2 instance.

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

Jenkins runs these checks in Docker with `docker build --target test .`; npm is not required on the Jenkins agent.

## EC2 one-time setup

Use an Ubuntu EC2 instance with inbound TCP access to the app port (default `3000`) and inbound SSH restricted to trusted addresses. Install Git, Docker, and the AWS CLI, then add the deployment user to the Docker group:

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin awscli
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
```

Set `IMAGE_URI` in `.env.production` to the immutable image Jenkins pushed, for example `123456789012.dkr.ecr.ap-south-1.amazonaws.com/myspace-myrepo:abc123def456`. Attach an EC2 instance role with `AmazonEC2ContainerRegistryReadOnly`, then deploy it:

```bash
cp .env.production .env
aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
docker compose pull
docker compose up --detach --remove-orphans
```

## Jenkins configuration

Create the ECR repository before the first build:

```bash
aws ecr create-repository --repository-name myspace-myrepo --region <AWS_REGION>
```

Configure these Jenkins credentials:

| Credential ID | Kind | Value |
| --- | --- | --- |
| `aws-account-id` | Secret text | AWS account ID that owns the ECR repository |
| `aws-region` | Secret text | AWS region containing ECR, for example `ap-south-1` |
| `aws-ecr-publisher` | AWS Credentials | IAM principal permitted to push to `myspace-myrepo` |

The Jenkins agent needs Docker and the AWS Credentials plugin. The pipeline runs the AWS CLI inside a Docker container, so the agent does not need npm or the AWS CLI installed. The publisher identity needs ECR upload permissions; the EC2 instance role only needs ECR read permissions.

## Deployment notes

Jenkins tags the production image with the Git commit SHA and pushes it to `myspace-myrepo`. EC2 pulls that exact tested artifact and does not build source code. Re-deploying an earlier image tag provides a straightforward rollback.
