Title: Using GitLab CICD for your static blog
Date: 2018-06-05
Author: jarv
Slug: jarv-org-cicd

In the process of making all of my private public on Github, taking this blog off of GitHub
pages I have also decided to move most of my repositories over to GitLab. 
One reason, other than working for them of course, is that setting up a CICD pipeline makes it 
extremely easy to publish these posts automatically.

Now, on every commit the followig pipeline runs that deploys to https://draft.jarv.org
and on the master branch, https://jarv.org.

![jarv-cicd]({attach}static/jarv-cicd.png)

Here is what the `gitlab-ci.yml` configuration looks like for the [jarv.org repository](https://gitlab.com/jarv/jarv.org):

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
    - export DIST_ID=E1B0Q0MMPJQ79F
    - make s3_upload

deploy_prod:
  image: registry.gitlab.com/jarv/jarv.org/ci-image
  stage: deploy
  script:
    - make clean
    - export S3_BUCKET=jarv.org
    - export DIST_ID=EEN9NFVIDRTGS
    - make s3_upload
  only:
    - master
```

_Disclaimer: I am working for GitLab though the opinions here are my own._
