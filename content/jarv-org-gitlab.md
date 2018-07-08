Title: Using GitLab CICD for your static blog
Date: 2018-06-05
Author: jarv
Slug: jarv-org-cicd

In the process of making all of my private repositories public on Github and moving off of GitHub
pages I have also decided to move most of my repos over to GitLab. 
One reason is that setting up a CICD pipeline makes it 
extremely easy to publish these posts automatically. This in combination with GitLab's
web IDE makes minor changes a little bit easier to make.

CICD piplines in GitLab are controlled with a single file, `.gitlab-ci.yml` that is placed
at the root of the repository.
Wit this file, on every commit, the following pipeline runs that deploys to [draft.jarv.org](https://draft.jarv.org)
and on the master branch for [jarv.org](https://jarv.org).

GitLab has integrated CI/CD runners that allow you to execute whatever you want in a docker
image of your choice. By creating the `.gitlab-ci.yml` below you get a nice 
deployment pipeline like this:

<img src="{attach}static/jarv-cicd.png" width="600px" alt="cicd"/>

Here is what the `gitlab-ci.yml` configuration looks like for the [jarv.org repository](https://gitlab.com/jarv/jarv.org/blob/master/.gitlab-ci.yml):

```
:::yaml
stages:
  - build
  - deploy

before_script:
  - git submodule update --init --recursive
  - pip install -r requirements.txt

build:
  image: registry.gitlab.com/jarv/jarv.org/ci-image
  stage: build
  script:
    - make clean
    - make html

deploy_draft:
  image: registry.gitlab.com/jarv/jarv.org/ci-image
  stage: deploy
  script:
    - make clean
    - export S3_BUCKET=draft.jarv.org
    - export DISTID=E1B0Q0MMPJQ79F
    - make s3_upload
  environment:
    name: draft
    url: https://draft.jarv.org

deploy_prod:
  image: registry.gitlab.com/jarv/jarv.org/ci-image
  stage: deploy
  script:
    - make clean
    - export S3_BUCKET=jarv.org
    - export DISTID=EEN9NFVIDRTGS
    - make s3_upload
  environment:
    name: jarv 
    url: https://draft.jarv.org
  only:
    - master
```

Some notes about the setup:

* There are two stages, build and deploy. Build generates the html for the blog and deploy deploys it to both draft and the main site.
* Deploying to the main site only happens on the master branch.
* I am using a custom image that has some of the blog depencencies preinstalled, it is created with [this docker file](https://gitlab.com/jarv/jarv.org/blob/master/Dockerfile-ci).
* Every time the deploy happens, an invalidate is sent to the cloudfront distribution in front of it.
* Since I am no longer using GitHub pages, the blog is hosted in an S3 bucket so the CICD pipeline does an `aws s3 sync ...` to get the static files on the bucket.

There is a special key named `environment` that hints to GitLab that the stage is a deploy step. With this the URL provided will show up under operations->deployments like this:


<img src="{attach}static/jarv-envs.png" width="600px" alt="envs"/>

That's it! It couldn't be simpler and I think one of the nicest things about this setup is the ability to use the GitLab web ide to make quick changes.

_Disclaimer: I work for GitLab though the opinions here are my own._
