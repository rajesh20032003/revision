@Library('shared-lib-mb@main')_
pipeline {
   agent any 

   options {
     buildDiscarder(
      logRotator(
        numToKeepStr: '10',
        artifactNumToKeepStr: '5'
      )
     )

     timeout(time: 30, unit: 'MINUTES')

     disableConcurrentBuilds()

     timestamps()

   }

   parameters{
       choice(
        name: 'environment',
        choices: ['dev', 'staging', 'prod'],
        description: 'deployment environment'
       )
   }

   environment {
    PROJECT_NAME="RAJESH-JENKINS-MB"
    ENV="${params.environment}"
   }

   stages {
    
    stage('checkout'){

      steps {
        checkout scm 
      }

    }

    stage('detect changes') {
      steps {
        script {
          def allServices = ['cart-service', 'gateway', 'order-service', 'product-service', 'user-service']

          def changedFiles = sh(
            script: "git diff --name-only HEAD~1 HEAD || git diff --name-only origin/main HEAD",
            returnStdout: true 
          ).trim().split('\n')

          env.CHANGED_SERVICES = allServices.findAll {
            svc -> changedFiles.any {
              file -> file.startsWith("services/${svc}/")
            }
          }.join(',')

          echo "Changed services: ${env.CHANGED_SERVICES}"
        }
      }
    }
   stage('build images') {
    steps {
      script {
        def services = env.CHANGED_SERVICES.split(',').findAll { it.trim() }

        if (services.isEmpty()) {
          echo 'no services changed, skipping build'
          return
        }

        def branches = services.collectEntries {
          svc -> ["${svc}": {
            dockerBuild(service: svc)
          }]
        }
        parallel branches
      }
    }
   }

    // stage('build images') {
    // parallel {

    //   stage('cart-services'){
    //     when{
    //         changeset 'services/cart-service/**'
    //     }

    //     steps {
    //     dockerBuild(service: 'cart-service')
    //      }

    //   }

    //   stage('gateway-service'){
    //      when{
    //         changeset 'services/gateway/**'
    //     }
    //      steps {
    //       dockerBuild(service: 'gateway')
    //      }
    //   }

    //   stage('order-service'){
    //     when {
    //       changeset 'services/order-service/**'
    //     }

    //     steps {
    //       dockerBuild(service: 'order-service')
    //     }
    //   }

    //   stage('product-service') {
    //     when {
    //       changeset 'services/product-service/**'
    //     }

    //     steps {
    //       dockerBuild(service: 'product-service')
    //     }
    //   }

    //   stage('user-service') {
    //     when {
    //       changeset 'services/user-service/**'
    //     }
    //     steps {
    //       dockerBuild(service: 'user-service')
    //     }
    //   }
    // }
    // }
    stage('trivy-db-update') {

    steps {
        sh 'trivy image --cache-dir /tmp/trivy-shared-db --download-db-only'
    }
}
    stage('trivy-scan') {
      parallel{
        stage('cart-service') {
          when {
            changeset 'services/cart-service/**'
          }
          steps{
          catchError(buildResult: 'FAILURE', stageResult: 'FAILURE'){
          trivyScan(service: 'cart-service')
          }

        }
        }

          stage('user-service') {
          when {
            changeset 'services/user-service/**'
          }
          steps{

          catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          trivyScan(service: 'user-service')
        }
          
        }
        }

          stage('gateway-service') {
          when {
            changeset 'services/gateway/**'
          }
          steps{

          catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          trivyScan(service: 'gateway')
        }
          
        }
        }

          stage('product-service') {
          when {
            changeset 'services/product-service/**'
          }
          steps{

          catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          trivyScan(service: 'product-service')
        }
          
        }
        }

          stage('order-service') {
          when {
            changeset 'services/order-service/**'
          }
          steps{

          catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          trivyScan(service: 'order-service')
        }
          
        }
        }
      }
    }

    stage('sbom-generation') {
      parallel {
        stage('cart-service') {
          when{
              changeset 'services/cart-service/**'
          }
          steps {
             sbomGen(service: 'cart-service')
          }
        }

        stage('gateway') {
          when {
            changeset 'services/gateway/**'
          }
          steps {
            sbomGen(service: 'gateway')
          }
        }

        stage('order-service') {
          when {
            changeset 'services/order-service/**'
          }
          steps {
            sbomGen(service: 'order-service')
          }
        }

        stage('product-service') {
          when {
            changeset 'services/product-service/**'
          }
          steps{
            sbomGen(service: 'product-service')
          }
        }

        stage('user-service') {
          when {
            changeset 'services/user-service/**'
          }

          steps {
            sbomGen(service: 'user-service')
          }
        }
      }
    }
    }

   
   post{
       always {
        echo 'i am from always'
       }
       success {
        echo 'i am from success'
       }
       failure {
        echo 'i am from failure'
       }
       cleanup {
        cleanWs()
       }
   }
}