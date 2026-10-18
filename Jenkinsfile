pipeline {
    agent any

    environment {
        DOCKER_USER = "sujeetsr07"
        BACKEND_IMAGE = "sujeetsr07/student-task-backend"
        FRONTEND_IMAGE = "sujeetsr07/student-task-frontend"
        // Dynamically generates v1.0.1, v1.0.2, v1.0.3 based on Jenkins build number
        IMAGE_TAG = "v1.0.${BUILD_NUMBER}"
        
        // Adjust these paths if your YAML files have different names inside the k8s folder
        BACKEND_YAML = "k8s/backend-deployment.yaml"
        FRONTEND_YAML = "k8s/frontend-deployment.yaml"
        GIT_BRANCH = "main" 
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
                    docker build \
                    -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                    -t ${BACKEND_IMAGE}:latest \
                    ./backend
                '''
            }
        }

        stage("Build Frontend") {
            steps {
                sh '''
                    docker build \
                    -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    -t ${FRONTEND_IMAGE}:latest \
                    ./frontend
                '''
            }
        }

        stage("Push Images") {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage("Update K8s Manifests & Push to GitHub") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "github-credential", // <-- Update with your GitHub Jenkins Credential ID
                        usernameVariable: "GIT_USERNAME",
                        passwordVariable: "GIT_TOKEN"
                    )
                ]) {
                    sh '''
                        # 1. Replace old version tag with the new IMAGE_TAG in both deployment files
                        sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|g" ${BACKEND_YAML}
                        sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|g" ${FRONTEND_YAML}

                        # 2. Configure Git identity for Jenkins
                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@ci.local"

                        # 3. Stage and commit the updated YAML files
                        git add ${BACKEND_YAML} ${FRONTEND_YAML}
                        
                        # [ci skip] prevents Jenkins from triggering an infinite build loop!
                        git commit -m "chore(k8s): bump image versions to ${IMAGE_TAG} [ci skip]" || echo "No changes to commit"

                        # 4. Push changes back to GitHub safely using token
                        REPO_URL=$(git config --get remote.origin.url | sed 's|https://||')
                        git push https://${GIT_USERNAME}:${GIT_TOKEN}@${REPO_URL} HEAD:${GIT_BRANCH}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Docker images (${IMAGE_TAG}) built, pushed, and K8s manifests updated!"
        }

        failure {
            echo "Pipeline failed!"
        }

        always {
            sh 'docker logout || true'
        }
    }
}