pipeline {
    agent any 
    stages {
        stage('Build') {
            steps {
                echo 'Building the application...'
                def files = sh(script: 'ls', returnStdout: true).trim()
            
                echo "The files in this workspace are: ${files}"
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
