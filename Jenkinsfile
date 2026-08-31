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

    stage('build images') {
    parallel {

      stage('cart-services'){
        when{
            changeset 'services/cart-service/**'
        }
         steps {
        dockerBuild(service: 'cart-service')
         }
      }

      stage('gateway-service'){
         when{
            changeset 'services/gateway/**'
        }
         steps {
          dockerBuild(service: 'gateway')
         }
      }

      stage('order-service'){
        when {
          changeset 'services/order-service/**'
        }

        steps {
          dockerBuild(service: 'order-service')
        }
      }

      stage('product-service') {
        when {
          changeset 'services/product-service/**'
        }

        steps {
          dockerBuild(service: 'product-service')
        }
      }

      stage('user-service') {
        when {
          changeset 'services/user-service/**'
        }
        steps {
          dockerBuild(service: 'user-service')
        }
      }
    }

    stage('trivy-scan') {
      parallel{
        stage('cart-service') {
          steps{
          sh '''
            service='cart-service'
            tag="${BUILD_NUMBER}"
            trivy scan $service:$tag
          '''
        }
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