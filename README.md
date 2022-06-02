
Cloud resume challenge

Created a HTML/CSS version of my resume. Used a borrowed template version and tweaked it to my liking

#challenges : not familiar with CSS


Step 2 - AWS setup
Created a root account and setup MFA for added security

created another user
installed aws-vault using https://github.com/99designs/aws-vault 

```
choco install aws-vault
aws-vault add "new user" #put in the creds
aws-vault exec DevOpsUser -- aws s3 ls

```
