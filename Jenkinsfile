pipeline {
    agent any

    environment {
        // Automatically fetch regional details from the EC2 Instance Profile
        AWS_REGION     = "us-east-1" 
        AWS_ACCOUNT_ID = "634005656826" // Replace with your actual 12-digit AWS Account ID
        ECR_REPOSITORY = "myspace-myrepo"
        
        // Define unified naming schemas
        TEST_IMAGE     = "nestjs-ec2-starter-test:${BUILD_NUMBER}"
        REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    }

    stages {
        stage('Prepare Image Tag') {
            steps {
                script {
                    // Generate a unique tag using short git commit hash
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()
                    
                    // Construct explicit image URIs for pushing
                    env.IMAGE_URI_COMMIT = "${REGISTRY}/${ECR_REPOSITORY}:${env.IMAGE_TAG}"
                    env.IMAGE_URI_LATEST = "${REGISTRY}/${ECR_REPOSITORY}:latest"
                }
            }
        }

        stage('Test in Docker') {
            steps {
                // Build your dedicated test target block from your Dockerfile
                sh 'docker build --target test --tag $TEST_IMAGE .'
            }
        }

        stage('Build Production Image') {
            steps {
                // Build the lean, production-ready target architecture block
                sh 'docker build --target production --tag $IMAGE_URI_COMMIT .'
                
                // Tag the fresh build as 'latest' for rolling environments
                sh 'docker tag $IMAGE_URI_COMMIT $IMAGE_URI_LATEST'
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                # 1. Seamlessly authenticate using the EC2 instance identity role
                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${REGISTRY}
                
                # 2. Push both specific build targets up to ECR
                docker push ${IMAGE_URI_COMMIT}
                docker push ${IMAGE_URI_LATEST}
                '''
            }
        }
    } // Fixed: Crucial missing closing bracket for the stages context block

    post {
        always {
            // Clean local workspace cache of bloated container images
            sh 'docker image rm -f $TEST_IMAGE $IMAGE_URI_COMMIT $IMAGE_URI_LATEST || true'
        }
    }
}
