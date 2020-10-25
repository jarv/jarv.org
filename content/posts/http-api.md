+++
title = "Moving to HTTP from REST for the AWS API Gateway"
date = "2020-10-25"
slug = "http-api-gateway"
tags = ["cmdchallenge"]
+++

## HTTP API Gateway

When HTTP API Gateway was announced in 2019 the Amazon said:

> Our goal is to make it as easy as possible for developers to build and manage APIs with API Gateway. We encourage you to try the new HTTP APIs and let us know what you think.

Today I decided to switch from using the REST API for cmdchallenge.com to the HTTP API and I must say it is _a lot_ easier to build and setup for simple HTTP APIS.
In Terraform, it now only requires two resources:

```terraform
resource "aws_apigatewayv2_api" "default" {
  ...
}

resource "aws_lambda_permission" "default" {
  ...
}
```

Compare this to the previous configuration using REST API:

```terraform

resource "aws_api_gateway_rest_api" "default" {
  ...
}

resource "aws_api_gateway_method" "default" {
  ...
}

resource "aws_api_gateway_integration" "default" {
  ...
}

resource "aws_lambda_permission" "default" {
  ...
}

resource "aws_api_gateway_deployment" "default" {
  ...
}

```

For a full working example, see [the API Gateway Terraform configuration](https://gitlab.com/jarv/cmdchallenge/-/blob/master/terraform/modules/api/main.tf) for cmdchallenge.com. In addition to making the configuration simpler, it's supposed to be _optimized for performance_ and this doesn't disappoint either. Testing against an API endpoint that invokes a Lambda function and makes some DynamoDB calls there is a nice saving of around 100ms for the 50th percentile and 200ms for the 90th.

REST API Gateway:

```
 $ bombardier --latencies --rate 50 -d 30s 'https://g4jrkpyb3d.execute-api.us-east-1.amazonaws.com/r/?cmd=echo+hello+world&challenge_slug=hello_world'
Bombarding https://g4jrkpyb3d.execute-api.us-east-1.amazonaws.com:443/r/?cmd=echo+hello+world&challenge_slug=hello_world for 30s using 125 connection(s)
[============================================================================================================================================================================] 30s
Done!
Statistics        Avg      Stdev        Max
  Reqs/sec        48.45      33.81     211.47
  Latency         1.13s   845.04ms      6.77s
  Latency Distribution
     50%      0.88s
     75%      0.99s
     90%      2.71s
     95%      2.92s
     99%      4.78s
  HTTP codes:
    1xx - 0, 2xx - 1501, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:    86.94KB/s
```

HTTP API Gateway:

```
$ bombardier --latencies --rate 50 -d 30s 'https://ddzt9hixi4.execute-api.us-east-1.amazonaws.com/?cmd=echo+hello+world&challenge_slug=hello_world'
Bombarding https://ddzt9hixi4.execute-api.us-east-1.amazonaws.com:443/?cmd=echo+hello+world&challenge_slug=hello_world for 30s using 125 connection(s)
[============================================================================================================================================================================] 30s
Done!
Statistics        Avg      Stdev        Max
  Reqs/sec        48.44      30.62     235.42
  Latency         0.93s   679.98ms      6.70s
  Latency Distribution
     50%   703.40ms
     75%   731.99ms
     90%      1.66s
     95%      2.70s
     99%      3.98s
  HTTP codes:
    1xx - 0, 2xx - 1501, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:    33.19KB/s
```

## Caching Responses with the HTTP API Gateway

[Command Challenge](https://cmdchallenge.com) has multiple layers of caching for anonymous usage.
If there wasn't any caching, every single submission would execute in a docker container, which would not only be atrocious from a performance standpoint but also expensive as it would require multiple/large VMs executing commands in containers.

Every command that is submitted is hashed, and written to a DynamoDB table. If a subsequent command is identical for the same challenge, we return a cached response.
Putting CloudFront in front of API Gateway is a nice way to get additional caching for free, which works for the HTTP Gateway which [doesn't have a caching feature](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html). To cache HTTP API Gateway response, simple create a CloudFront distribution with the API endpoint as the `Origin Domain Name`.
