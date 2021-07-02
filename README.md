quick PoC to see if I could make a docker linux container reverse proxy that does ntlm auth.

* Before running create a .env file.  Use the .end.default as a template.
* the DOMAIN_CONTROLLER_ARR value in the .env file should be a comma separated list of your domain controllers.

## To start the project in docker:
```bash
bash ./docker-start.sh
```
Notes:
* If you're on windows you'll probably want to run this script from WSL or some other environment that has bash.
* To see ntlm errors in the logs you will need to set the LOGGING_LEVEL to debug
