#! /bin/sh

docker-compose down
# export REDIS_ENDPOINT= (make sure the env is set manually on the remote server)
docker-compose up -d --build

# chmod -x run.sh 
# ./run.sh
