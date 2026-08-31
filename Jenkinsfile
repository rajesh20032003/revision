pipeline {
  
  agent any 

  environment {
    PROJECT_NAME = "jenkins-multibranch-pipeline"
  }

  stages {
    
    stage('checkout') {
      steps {
        checkout scm 
      }
    }

    stage('detect affected services') {
      steps {
        script {
          def affected = sh(
            script: '''
              npx nx show projects \
                -- affected \
                -- base=origin/main \
                -- head=HEAD 
            ''',
            returnStdout: true 
          ).trim()

          echo "Affected Services:"
          echo Affected
        }
      }
    }
  }
}