pipeline {

    agent any

    environment {

        DOCKER_USER = "sujeetsr07"

        BACKEND_IMAGE = "${DOCKER_USER}/student-task-backend"

        FRONTEND_IMAGE = "${DOCKER_USER}/student-task-frontend"

    }

    stages {

        stage("Checkout") {

            steps {

                checkout scm

            }
        }

        stage("Build Backend") {

            steps {

                sh """
                docker build -t %BACKEND_IMAGE%:latest backend
                """

            }
        }

        stage("Build Frontend") {

            steps {

                sh """
                docker build -t %FRONTEND_IMAGE%:latest frontend
                """

            }
        }

        stage("Push Images") {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub",
                        usernameVariable: "DOCKER_USERNAME",
                        passwordVariable: "DOCKER_PASSWORD"
                    )
                ]) {

                    sh """

                    docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%

                    docker push %BACKEND_IMAGE%:latest

                    docker push %FRONTEND_IMAGE%:latest

                    """

                }

            }
        }

        stage("Deploy") {

            steps {

                sh """

                kubectl apply -k k8s

                kubectl rollout restart deployment/backend -n student-app

                kubectl rollout restart deployment/frontend -n student-app

                """

            }
        }

        stage("Verify") {

            steps {

                sh """

                kubectl rollout status deployment/backend -n student-app

                kubectl rollout status deployment/frontend -n student-app

                kubectl get pods -n student-app

                """

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

    }
}