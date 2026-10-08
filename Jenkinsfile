pipeline {

    agent any

    environment {
        DOCKER_USER = "sujeetsr07"
        BACKEND_IMAGE = "sujeetsr07/student-task-backend"
        FRONTEND_IMAGE = "sujeetsr07/student-task-frontend"
    }

    stages {

        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Docker Login") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "docker-hub-cred",
                        usernameVariable: "DOCKER_USERNAME",
                        passwordVariable: "DOCKER_PASSWORD"
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin
                    '''
                }
            }
        }

        stage("Build Backend") {
            steps {
                sh '''
                    docker build -t ${BACKEND_IMAGE}:latest ./backend
                '''
            }
        }

        stage("Build Frontend") {
            steps {
                sh '''
                    docker build -t ${FRONTEND_IMAGE}:latest ./frontend
                '''
            }
        }

        stage("Push Images") {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage("Deploy to Kubernetes") {
            steps {
                sh '''
                    kubectl apply -k k8s

                    kubectl rollout restart deployment/backend -n student-app

                    kubectl rollout restart deployment/frontend -n student-app
                '''
            }
        }

        stage("Verify Deployment") {
            steps {
                sh '''
                    kubectl rollout status deployment/backend -n student-app

                    kubectl rollout status deployment/frontend -n student-app

                    kubectl get pods -n student-app

                    kubectl get svc -n student-app
                '''
            }
        }
    }

    post {

        success {
            echo "Deployment successful!"
        }

        failure {
            echo "Deployment failed!"
        }

        always {
            sh '''
                docker logout || true
            '''
        }
    }
}
