CI_COMMIT_TAG?=$(shell git rev-parse --short HEAD)

BASEDIR=$(CURDIR)
PUBLICDIR=$(BASEDIR)/public

S3_BUCKET ?= jarv.org

# jarv.org EEN9NFVIDRTGS
# draft.jarv.org E1B0Q0MMPJQ79F
DISTID ?= EEN9NFVIDRTGS

serve:
	hugo server -D

publish:
	hugo -D
ifeq ($(S3_BUCKET), draft.jarv.org)
	printf "User-agent: *\nDisallow: /\n" > $(PUBLICDIR)/robots.txt
endif

push-image-ci: build-image-ci
	docker push $(CI_REGISTRY_IMAGE)/ci:$(CI_COMMIT_TAG)
	docker push $(CI_REGISTRY_IMAGE)/ci:latest

build-image-ci:
	docker build -t $(CI_REGISTRY_IMAGE)/ci:latest \
        --tag $(CI_REGISTRY_IMAGE)/ci:$(CI_COMMIT_TAG) -f Dockerfile-ci .

s3_upload: publish
	aws s3 sync $(PUBLICDIR)/ s3://$(S3_BUCKET) --acl public-read --delete
	aws --region us-east-1 cloudfront create-invalidation --distribution-id $(DISTID) --paths '/*'
