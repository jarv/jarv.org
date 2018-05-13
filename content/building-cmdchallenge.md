Title: Building cmdchallenge using Lambda and API Gateway in the AWS free-tier with Docker and Go
Date: 2017-04-24
Slug: building-cmdchallenge

Have you ever thought about building a side-project for fun without spending a lot on hosting?
This post might be for you. With the most tech-buzz-wordy title I could conjure up here is 
a quick overview of how [cmdchallenge.com](https://cmdchallenge.com) is built.
The site is a simple web application side-project that executes shell commands
remotely in a docker container in AWS. The front-end gives the feeling of a normal terminal but underneath
it is sending whatever commands you give it remotely on an EC2 instance inside a Docker container.

The source code for most of it is located [on github](https://github.com/jarv/cmdchallenge) including
 a tiny command executer written in Go, the challenge definitions, and a test harness.

The following AWS services are used for the site:

* Cloudfront
* API Gateway
* S3 bucket
* Lambda function
* DynamoDB
* t2.micro EC2 Instance running coreos
* CloudWatch logs

<p/> 

In addition to this Amazon Certificate Manager and Route53 was used but for everything above you can keep costs close to zero in AWS. There is no free tier for Route53 (sad panda) but it's like 50 cents a month for a single zone.

<p/> 

## Features:

* Submit commands, execute them in a bash sub-shell.
* Check the output of the command for different challenges.
* Run tests for challenges that need them in addition or in place of checking output.

<p/> 

## Deployment tools (simple and boring):

* Makefiles.
* Python fabric for running commands and copying files over ssh.
* Kappa, zips up code, sends it to lambda, also manages Lambda permissions.

<p/>
With these tools the following automated steps are taken to deploy the site:

* Create a Docker image that holds the challenges.
* Launch a new coreos EC2 instance.
* Run a fabric script that does the following on the instance over SSH:
    * Configures TLS so that a Lambda function can communicate to Docker on an EC2 instance.
    * Executes some periodic commands to ensure that the host cleans up old containers.
    * Downloads the docker image that has the challenges.
    * Copies the read-only volume that is used on the container for the tests and command runner.
* Update Lambda with new code.
* Sync the static assets to S3.
* Invalidates CF cache for the main site.

<p/> 

## Architecture diagram:

There are two public entry points for the site, one is the main web-site which is static and served S3. 
The other is the API gateway at api.cmdchallenge.com which is also fronted by CloudFront so that it can
use a certificate from ACM and cache requests.

```
  api.cmdchallenge.com         cmdchallenge.com
  ********************         ****************
+---------------------+    +---------------------+ 
|      Cloudfront     |    |      Cloudfront     |   
+---------------------+    +---------------------+  
           |                          | 
+---------------------+         +-----------+
|    API Gateway      |         | s3 bucket |
+---------------------+         +-----------+
           |
  +-----------------+
  |                 |
  | Lambda Function |    +----------+
  |                 |--- |          |
  +-----------------+   \| DynamoDB |
           |             |          |
   +--------------+      +----------+
   | EC2 t2.micro |
   |   (coreos)   |
   +--------------+
```

<p/> 

One nice thing about using AWS server-less components was that **a single t2.micro instance ended up being fine for handling all of the load, even at peak.**<br />
*See section on caching/performance below.*

<p/> 

## Here is what happens when a command is submitted in the [cmdchallenge.com](cmdchallenge.com terminal):

* Javascript code sends an HTTP GET to https://api.cmdchallenge.com
* If it is cached it returns a response immediately. If not, it forwards the request to the API gateway which in turn sends it to a Lambda function.
* The Lambda function looks up the challenge and the command in DynamoDb and if it already has an answer it returns that. If the challenge doesn't exist in DyamoDB it is forwarded to the EC2 instance as a command using the docker API.
* The command that the user provides is passed to a Go command runner that executes the command in a bash sub-shell inside a docker container, checks the output and runs the tests.
* Results are returned to the Lambda function, it writes them to DynamoDb and returns the response.

<p/> 

## The challenges are expressed in a single YAML, here an example of one challenge:

```
  - slug: hello_world
    version: 4
    author: cmdchallenge
    description: |
      Print "hello world".
      Hint: There are many ways to print text on
      the command line, one way is with the 'echo'
      command.

      Try it below and good luck!
    example: echo 'hello world'
    expected_output:
      lines:
        - 'hello world'

```

<p/> 
Interested in coming up with your own? You can submit your own challenge with a [pull request](https://github.com/jarv/cmdchallenge/pulls). Your challenge will be added to the user-contributed section of the site.

<p/> 
## Caching:

You may notice that when you do `echo hello world` on the [hello world challenge](https://cmdchallenge.com/#/hello_world) it returns almost immediately.
As it is shown above there are two layers of cache, one at CloudFront and one at DynamoDb to reduce
the number of command executions on the Docker container.
API Gateway *can* provide caching but it costs money, I worked around this by sticking CloudFront in front of it but this
is only possible with HTTP GETs.
With Cloudfront in front the cache-control header in 
the response from Lambda is set to a very long cache lifetime with every request. 
The version of the challenge as well as a global cache buster param is passed in so we never 
have to worry about returning a response from a stale challenge.

<p/> 
## Performance:

If you are wondering how well this would scale for a lot of traffic, the Lambda function currently dispatches
commands to a random host in a statically configured list of EC2 instances making it pretty easy
to add more capacity. So far it seems to be operating fine with a single t2.micro EC2 instance handling
all command requests that are not cached.

* Time to get a `echo hello world` response from a cached cloudfront command - **~50ms**
* Time to get a `echo hello world` response from a cached command in dynamoDB - **~2.5s**
* Time to get a `echo hello world` response, executed in a container - **~4s**   

Without caching this wouldn't be possible and also the caching at CloudFront enables most commands to
return fairly quickly.
<p/> 

## Wrapping up

If you like the site please follow [@thecmdchallenge](https://twitter.com/thecmdchallenge) on twitter or if you have
suggestions drop me a mail at <a href="mailto:info@cmdchallenge.com">info@cmdchallenge.com</a>.

Thanks!


