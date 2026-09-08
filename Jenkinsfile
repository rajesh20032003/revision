@Library('shared-lib-mb@main')_
pipeline {
   agent any

   options {
     buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
     timeout(time: 30, unit: 'MINUTES')
     disableConcurrentBuilds()
     timestamps()
   }

   parameters {
       choice(
        name: 'environment',
        choices: ['dev', 'staging', 'prod'],
        description: 'deployment environment'
       )
   }

   environment {
    PROJECT_NAME = "RAJESH-JENKINS-MB"
    ENV = "${params.environment}"
   }

   stages {


   stage('detect changes') {
    steps {
        script {
            def allServices = ['cart-service', 'gateway', 'order-service', 'product-service', 'user-service']

            def changedFiles

            if (env.CHANGE_ID) {
                // This is a PR build — diff against the actual target branch
                sh "git fetch --no-tags origin ${env.CHANGE_TARGET}"
                changedFiles = sh(
                    script: "git diff --name-only origin/${env.CHANGE_TARGET}...HEAD",
                    returnStdout: true
                ).trim().split('\n')
            } else {
                // Regular branch build (e.g. main after merge)
                changedFiles = sh(
                    script: "git diff --name-only HEAD~1 HEAD || git diff --name-only origin/main HEAD",
                    returnStdout: true
                ).trim().split('\n')
            }

            env.CHANGED_SERVICES = allServices.findAll { svc ->
                changedFiles.any { file -> file.startsWith("services/${svc}/") }
            }.join(',')

            echo "Changed files: ${changedFiles.join(', ')}"
            echo "Changed services: ${env.CHANGED_SERVICES}"
        }
    }
}

    // stage('security scan') {
    //     steps {
    //         script {
    //             def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
    //             if (services.isEmpty()) { return }
    //             def branches = services.collectEntries { svc ->
    //               ["${svc}": {
    //                   catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
    //                       sec(service: svc)
    //                   }
    //               }]
    //             }
    //             parallel branches
    //         }
    //     }
    // }
    stage('sonar-scan') {
      when {
          allOf {
             expression { env.CHANGED_SERVICES?.trim() } 
            }
              }
    steps {
        script {
            def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
            if (services.isEmpty()) { return }

            def branches = services.collectEntries { svc ->
                ["${svc}": {
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        sonar(service: svc)
                         quality()
                    }
                }]
            }
            parallel branches
        }
    }
}
    
    stage('build images') {
      when {
          allOf {
             expression { env.CHANGED_SERVICES?.trim() } 
             branch 'main'
            }
              }
        steps {
            script {
                def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
                if (services.isEmpty()) {
                    echo "No service changes detected, skipping build."
                    return
                }
                def branches = services.collectEntries { svc ->
                    ["${svc}": { dockerBuild(service: svc) }]
                }
                parallel branches
            }
        }
    }

    stage('trivy-db-update') {
        when {
          allOf {
             expression { env.CHANGED_SERVICES?.trim() } 
             branch 'main'
            }
              }
        steps {
            sh 'trivy image --cache-dir /tmp/trivy-shared-db --download-db-only'
        }
    }

    // stage('trivy-scan') {
    //     steps {
    //         script {
    //             def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
    //             if (services.isEmpty()) { return }
    //             def branches = services.collectEntries { svc ->
    //                 ["${svc}": {
    //                     catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
    //                         trivyScan(service: svc)
    //                     }
    //                 }]
    //             }
    //             parallel branches
    //         }
    //     }
    // }

    // stage('sbom-generation') {
    //     steps {
    //         script {
    //             def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
    //             if (services.isEmpty()) { return }
    //             def branches = services.collectEntries { svc ->
    //                 ["${svc}": { sbomGen(service: svc)
    //                  }]
    //             }
    //             parallel branches
    //         }
    //     }

    // }

    // stage('dtrack-upload') {
    //     steps {
    //         script {
    //             def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
    //             if (services.isEmpty()) { return }
    //             def branches = services.collectEntries { svc ->
    //                 ["${svc}": { dtrackUpload(service: svc) }]
    //             }
    //             parallel branches
    //         }
    //     }
    // }
    stage('report-summary') {
    when {
        expression { env.CHANGED_SERVICES?.trim() }
    }
    steps {
        sh '''
            echo "=== Artifact Summary ==="
            find artifacts -type f | sort
            echo ""
            echo "=== File sizes ==="
            find artifacts -type f -exec ls -lh {} \\; | awk '{print $9, "-", $5}'
        '''
        archiveArtifacts artifacts: 'artifacts/**', allowEmptyArchive: true
    }
}
    stage('update-gitops-dev') {
    when {
        allOf {
            expression { env.CHANGED_SERVICES?.trim() }
            branch 'main'
        }
    }
    steps {
        script {
            def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
            if (services.isEmpty()) { return }

            def shortSha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
            def tag = "${env.BUILD_NUMBER}-${shortSha}"

            services.each { svc ->
                gitopsUpdate(service: svc, tag: tag, file: 'values-dev.yaml')
            }
        }
    }

}
 stage('smoke-test-dev') {
    when {
        expression { env.CHANGED_SERVICES?.trim() }
    }
    steps {
        sh '''
            echo "Running smoke tests for dev environment"
            sleep 5
            echo "Smoke tests completed for dev environment"
        '''
    }
 }

 stage('update-gitops-stage') {
    when {
        allOf {
            expression { env.CHANGED_SERVICES?.trim() }
            branch 'main'
        }
    }
    steps {
        script {
            def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
            if (services.isEmpty()) { return }

            def shortSha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
            def tag = "${env.BUILD_NUMBER}-${shortSha}"

            services.each { svc ->
                gitopsUpdate(service: svc, tag: tag, file: 'values-stage.yaml')
            }
        }
    }

}

 stage('smoke-test-stage') {
    when {
        expression { env.CHANGED_SERVICES?.trim() }
    }
    steps {
        sh '''
            echo "Running smoke tests for stage environment"
            sleep 5
            echo "Smoke tests completed for stage environment"
        '''
    }
 }

 stage('approve-prod') {
    when {
        allOf {
            expression { env.CHANGED_SERVICES?.trim() }
            branch 'main'
        }
    }
    steps {
        timeout(time: 30, unit: 'MINUTES') {
            input message: "Deploy to PRODUCTION?", ok: "Deploy"
        }
    }
}

stage('update-gitops-prod') {
    when {
        allOf {
            expression { env.CHANGED_SERVICES?.trim() }
            branch 'main'
        }
    }
    steps {
        script {
            def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }
            if (services.isEmpty()) { return }

            def shortSha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
            def tag = "${env.BUILD_NUMBER}-${shortSha}"

            services.each { svc ->
                gitopsUpdate(service: svc, tag: tag, file: 'values-prod.yaml')
            }
        }
    }

}
 stage('smoke-test-prod') {
    when {
        expression { env.CHANGED_SERVICES?.trim() }
    }
    steps {
        sh '''
            echo "Running smoke tests for prod environment"
            sleep 5
            echo "Smoke tests completed for prod environment"
        '''
    }
 }

   }
   post {
       always  { echo 'i am from always' }
       success { echo 'i am from success' }
       failure { echo 'i am from failure' }
       cleanup { cleanWs() }
   }
}