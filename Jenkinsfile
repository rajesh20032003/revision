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
            changeset('services/cart-service')
        }
         steps {
          sh '''
          docker build -t cart-service:${BUILD_NUMBER} services/cart-service
          '''
         }
      }

      stage('gateway-service'){
         when{
            changeset('services/gateway')
        }
         steps {
          sh '''
          docker build -t gateway-service:${BUILD_NUMBER} services/gateway
          '''
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