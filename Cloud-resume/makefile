.PHONY: build

build:
	sam build

deploy-infra:
	sam build && aws-vault exec DevOpsUser --no-session -- sam deploy

deploy-site:
	aws-vault exec DevOpsUser --no-session -- aws s3 sync C:\Users\Golu\Desktop\devops-project\CloudResumeRepo\aws-crc-frontend-main s3://my-fanstastic-website