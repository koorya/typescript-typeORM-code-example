cd /home/rosnova/rosnova-alert
docker-compose -f docker-compose.yml down

prevHEAD=$(git rev-parse HEAD)
git pull
if git diff $prevHEAD --name-only | grep -q -E 'package.*\.json|DockerfileBase'; then 
	echo "Rebuild base image";
	docker build -t rosnova/base.node -f Dockerfile.base.node .;
else
	echo "Package.json and DockerfileBase not modified";
fi

docker build -t rosnova/base.project -f Dockerfile.base.project .


export DOCKER_UID=$(id -u)
export DOCKER_GID=$(id -g)

docker-compose -f docker-compose.yml up -d
