
Cloud resume challenge

Created a HTML/CSS version of my resume. Used a borrowed template version and tweaked it to my liking

#challenges : not familiar with CSS


## Step 2 - AWS setup
Created a root account and setup MFA for added security

created another user
installed aws-vault using https://github.com/99designs/aws-vault 

```
choco install aws-vault
aws-vault add "new user" #put in the creds
aws-vault exec DevOpsUser -- aws s3 ls

```

on IAM gave my new user the AmazonS3FullAccess 

## Using AWS SAM using Cloud formation
Install using
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-windows.html

Chose a template Hello_world with python runtime, gave my project a name - CloudResume

cd in to CloudResume and run
``` 
aws-vault exec DevOpsUser --no-session -- sam deploy --guided
```
add a Resource in the template.yaml in this format

```
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties: 
      BucketName: my-fanstastic-website
```
Run sam build again and then deploy without the --guided flag. Stacks succesfully created on cloudformation and a S3 bucket with the name "my-fantastic-website" is generated

error: during the first build, mistakenly renamed samconfig.toml to "y", when we run deploy again it needs to read from the samconfig.yaml, since the name was incorrect, I was unable to use sam deploy 

After this stage, I could see the stacks in CloudFormation and the s3 bucket created


## Setting up S3 with HTML and CSS files

created a Makefile 

```
.PHONY: build

build:
	sam build

deploy-infra:
	sam build && aws-vault exec DevOpsUser --no-session -- sam deploy

deploy-site:
	aws-vault exec DevOpsUser --no-session -- aws s3 sync ~.\devops-project\CloudResumeRepo\aws-crc-frontend-main s3://my-fanstastic-website
 ```
 
 Run make Deploy-site to copy the website files over to s3 bucket using Sync command
 
 
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

      
