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
        choices: ['dev'. 'staging', 'prod'],
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

    stage('check'){

      steps {

      sh '''
        echo "running from thes ${PROJECT_NAME}
        env is ${ENV}"

      '''

      }
    }
    stage("ask permission") {
      steps {
        input message: 'deploy to prod?'
        sh '''
         echo "deploying to prod"
        '''
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