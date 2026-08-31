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
          sh '''
          service='cart-service'

          docker buildx create \
          --name ${service}-builder \
          --driver docker-container \
          --use || docker buildx use ${service}-builder

          docker buildx inspect --bootstrap 

          docker buildx build \
            --builder ${service}-builder \
            --platform linux/amd64 \
            --tag rajesh00007/${service}:${BUILD_NUMBER} \
            --cache-from type=registry,ref=rajesh00007/${service}:buildcache \
            --cache-to type=registry,ref=rajesh00007/${service}:buildcache,mode=max \
            --push \
            services/${service}
          '''
         }
      }

      stage('gateway-service'){
         when{
            changeset 'services/gateway/**'
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