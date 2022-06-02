
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


      
