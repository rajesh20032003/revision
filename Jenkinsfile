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

    stage('checkout') {
      steps {
        checkout scm
      }
    }

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
      when { branch 'main' }
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
        when { expression { env.CHANGED_SERVICES?.trim() } && {branch 'main'} }
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

   }
   post {
       always  { echo 'i am from always' }
       success { echo 'i am from success' }
       failure { echo 'i am from failure' }
       cleanup { cleanWs() }
   }
}