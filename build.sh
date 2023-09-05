#!/bin/sh
#env
export PROJECT='node_crawler'
export TAG=$(git rev-parse HEAD)

#imageName
dockerhub=dockerhub.int.taou.com/fe/node_crawler/
imageName=$PROJECT:$TAG

if DOCKER_CLI_EXPERIMENTAL=enabled docker manifest inspect $dockerhub$imageName >/dev/null; then
  echo "image $dockerhub$imageName exists, direct deploy"
  exit 0
fi

echo "1.build $imageName"
docker build -t $imageName ./

echo "2.tag $imageName $dockerhub$imageName"
docker tag $imageName "$dockerhub$imageName"

echo "3.upload tag $imageName \n"
docker push -q "$dockerhub$imageName"
