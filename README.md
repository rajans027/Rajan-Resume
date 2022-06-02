
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

## Using AWS SAM
Install using
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-windows.html

Chose a template Hello_world with python runtime, gave my project a name - CloudResume

cd in to CloudResume and run
``` 
aws-vault exec DevOpsUser --no-session -- sam deploy --guided
```
