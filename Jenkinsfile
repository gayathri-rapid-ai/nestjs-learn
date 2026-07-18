pipeline {
    agent any

    environment {
        TEST_IMAGE = "nestjs-ec2-starter-test:${BUILD_NUMBER}"
        APP_IMAGE = "nestjs-ec2-starter:${GIT_COMMIT}"
    }

    stages {
        stage('Test in Docker') {
            steps {
                sh 'docker build --target test --tag $TEST_IMAGE .'
            }
        }

        stage('Build Production Image') {
            steps {
                sh 'docker build --target production --tag $APP_IMAGE .'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Push the immutable image to ECR and deploy its commit-SHA tag to EC2 here.'
            }
        }
    }

    post {
        always {
            sh 'docker image rm -f $TEST_IMAGE $APP_IMAGE || true'
        }
    }
}
