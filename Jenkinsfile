pipeline {
   agent any 

   environment {
    PROJECT_NAME="RAJESH-JENKINS-MB"
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
        echo "running from thes ${PROJECT_NAME}"
      '''
      }
    }
   }
}