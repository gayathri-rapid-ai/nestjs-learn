pipeline {
    agent any 
    stages {
        stage('Build') {
            steps {
                echo 'Building the application...'
                echo sh 'ls -la' 
            }
        }
        stage('Test') {
            steps {
                echo 'Running unit tests...'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying to staging environment...'
            }
        }
    }
}
