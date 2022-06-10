
Cloud resume challenge

Created a HTML/CSS version of my resume. Used a borrowed template version and tweaked it to my liking


## Step 1 - AWS setup
Created a root account and setup MFA for added security

created another user

Installed aws-vault to talk with AWS using https://github.com/99designs/aws-vault 

```
choco install aws-vault
aws-vault add "new user" #put in the creds
aws-vault exec DevOpsUser -- aws s3 ls

```

on IAM gave my new user the AmazonS3FullAccess 

## Using AWS SAM using Cloud formation
Install SAM using
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-windows.html


``` 
aws-vault exec DevOpsUser --no-session -- sam deploy --guided
```
Added a Resource in the template.yaml in this format to create a S3 bucket

```
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties: 
      BucketName: my-fanstastic-website
```
Ran sam build again and then deployed without the --guided flag. Stacks succesfully created on cloudformation and a S3 bucket with the name "my-fantastic-website" is generated

_Error encountered: during the first guided build, mistakenly renamed samconfig.toml to "y", when we run deploy again it needs to read from the samconfig.yaml, since the name was incorrect, I was unable to use sam deploy_ 

After this stage, I could see the stacks in CloudFormation and the s3 bucket resource created


## Setting up S3 with HTML and CSS files

Created a Makefile for convenience (extremely handy)

```
.PHONY: build

build:
	sam build

deploy-infra:
	sam build && aws-vault exec DevOpsUser --no-session -- sam deploy

deploy-site:
	aws-vault exec DevOpsUser --no-session -- aws s3 sync ~.\devops-project\CloudResumeRepo\aws-crc-frontend-main s3://my-fanstastic-website
 ```
 
 Ran `make Deploy-site` to copy the website files over to s3 bucket using Sync command
 
 
 Edited the template.yaml file for sam build with the below info. Purpose, to have the S3 read the html and CSS file. Also added the bucketpolicy to enable public access to the site.
 
 Changes made to the MyS3Bucket in the template.yaml file
 
 ```
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties: 
      BucketName: my-fanstastic-website
      AccessControl: PublicRead
      WebsiteConfiguration: 
        IndexDocument: index.html

  BucketPolicy: 
    Type: AWS::S3::BucketPolicy
    Properties:
      PolicyDocument:
        Id: MyPolicy
        Version: 2012-10-17
        Statement: 
          - Sid: "PublicReadForGetBucketObjects"
            Effect: "Allow"
            Principal: "*"
            Action: "s3:GetObject"
            Resource: !Join
            - ""
            - - "arn:aws:s3:::my-fanstastic-website/*"
            - !Ref MyS3Bucket
            - /*
      Bucket: !Ref MyS3Bucket  
``` 

Wesbite is now publicly accessible at the endpoint provided by the Bucket http://my-fanstastic-website.s3-website-us-east-1.amazonaws.com


## CloudFront setup and Route53 - Easiest step for me

Created a new distribution with origin domain in the format:

added below contents to template.yml. Build and deploy. 
```
  MyDistribution:
    Type: "AWS::CloudFront::Distribution"
    Properties:
      DistributionConfig:
        DefaultCacheBehavior:
          ViewerProtocolPolicy: allow-all
          TargetOriginId: my-fanstastic-website.s3-website-us-east-1.amazonaws.com
          DefaultTTL: 0
          MinTTL: 0
          MaxTTL: 0
          ForwardedValues:
            QueryString: false
        Origins:
          - DomainName: my-fanstastic-website.s3-website-us-east-1.amazonaws.com
            Id: my-fanstastic-website.s3-website-us-east-1.amazonaws.com
            CustomOriginConfig:
              OriginProtocolPolicy: match-viewer
        Enabled: "true"
        DefaultRootObject: index.html
```
_Error encountered: Dont forget to mention in Default root object as index.html in CloudFront's distribution settings to avoid XML parsing errors_


Moving on,  already owned a domain www.blankfolio.com which I am going to use for this project
Used ACM to generate a certificate for www.blankfolio.com and added routes to Route53 using the option provided (Create Records in Route53) . On my domain provider, Namecheap, updated nameservers to use the ones provided for AWS in route53.

ACM created a zone for www.blankfolio.com in which I went ahead and created a simple A record enabling routing to cloudfront domain d1feck1sd1hyh2.cloudfront.net. when accessing blankfolio.com on the web


Back in the CloudFront distribution, added **alternate domain name** value in the field given i.e www.blankfolio.com 

Frontend is complete and website is securely available on a custom Domain.


## BACKEND

##DynamoDB setup

The idea is to create a visitor's count functionality - API GATEWAY <----> Lambda Function <----> DynamoDB

The no. of visitors would be updated every time a person opens our website. This no. will be stored and updated inside a DynamoDB table and will be updated & fetched using APIs calling Lambda functions.
Setup a simple DynamoDB table, added the following snippet to the template.yaml file. This case requires a very basic setup — just give a name and add a partition key. Added a record to this table "view-count" to store the number of visitors

```
  DynamoDBTable:
    Type: AWS::DynamoDB::Table
    Properties: 
      TableName: cloud-resume-challenge
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions: 
        - AttributeName: id
          AttributeType: S
      KeySchema: 
        - AttributeName: id
          KeyType: HASH
```

##Lambda function

In AWS UI, created a new lambda function using boto3 library to converse with DynamoDb table

```
import boto3
import json
import os


def lambda_handler(event, context):
    # Init DynamoDB Client
    dynamodb = boto3.resource("dynamodb")
    # Set dynamodb table name variable from env
    #ddbTableName = os.environ["cloud-resume-challenge"]
    table = dynamodb.Table("cloud-resume-challenge")
    # table = dynamodb.Table("tvq-cloud-resume-counter")

    # Atomic update item in table or add if doesn't exist
    ddbResponse = table.update_item(
        Key={"id": "view-count"},
        UpdateExpression="ADD amount :inc",
        ExpressionAttributeValues={":inc": 1},
        ReturnValues="UPDATED_NEW",
    )

    # Format dynamodb response into variable
    responseBody = json.dumps(
        {"visitorCount": int(float(ddbResponse["Attributes"]["amount"]))}
    )

    # Create api response object
    apiResponse = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": responseBody,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
    }
    
   ```
    
    ### API gateway
    
    IN AWS UI, set up a new REST API, further created a GET method and integerated the lambda function. Deployed the API and tested it - no errors.
    Indicating that the function is ok and has the right permissions. 
    
    
    ## HTML AND JavaScript to use the API and display the results on the webpage
