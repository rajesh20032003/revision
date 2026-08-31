pipeline {
   agent any 

   environment {
    PROJECT_NAME="RAJESH-JENKINS-MB"
   }

   stages {
    
    stage('checkout'){

      checkout scm 

    }

    stage('check'){
      sh '''
        echo "running from ${PROJECT_NAME}"
      '''
    }
   }
}