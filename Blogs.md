# How I built and deployed the application

## Build the app on local using claude free tier
- I have the business logic of amex plat travel reward point computation
- I built prompts to create a simple html webpage with this formula
- I run the app on a simple http server on port 8080 using python's http.server library

### code structure
- app/images: amex plat travel card image to be used on credit card dropdown
- app/index.html: business logic and webpage html code for the calculator app
- app/styles.css: css for html
- app/script.js: js code for actions on ui component interaction
- app/https_server.py: run the app on a simple python http server

### prerequisites
- Oracle PAYG tier ARM instance (6GB ram , 1 core CPU, Oracle linux VM)
- python3 (preinstalled) 


## deployment
- ssh to server
```bash
ssh -i "path to private key" opc@"server public IP"
```
- create /app folder on sever
- I run scp command to copy the files to server
```bash
scp -i "path to private ssh key"  -r "path to code folder /app" opc@"server public IP"/app
```

## Installation on sever side (one time)

### Setting up app to run on http://<public ip>

###$ Add crontab to run the app on oracle vm
```bash
crontab -e 
@reboot nohup /app/app/serve.sh 2>&1 &
```

#### Open 8080 app port on oracle cloud instance ingress rules
- create vcn
- create subnet (192.168.0.0/16)
- add internet gateway in vcn
- connect route table to internet gateway via route rule of route table
- open ingress rule on subnet security list to destination port 8080 port (app port)

#### Open 8080 app port on oracle cloud VM
sudo firewall-cmd --permanent --zone=public --add-port=8080/tcp
sudo firewall-cmd --reload


### Connecting domain to your host IP so that app is accessible via https://"domain_name" using nginx reverse proxy

#### Create a domain and add A record on DNS section of the domain
- Points your domain to oracle vm public IP

#### Setup nginx reverse proxy and letencrypt certbot (https) on oracle vm to route traffic from domain to your oracle vm securely using ssl encryption

##### nginx setup
- Install nginx on oracle cloud vm
```bash
dnf update -y
dnf install nginx -y
```
- Ensure the nginx starts on host reboot
```bash
systemctl enable --now nginx
```
- Check if nginx runs successfully
```bash
systemctl status nginx
```
- Open http port (80) and https port (443) on ingress rules on oracle vm and oracle vm (similar to how we did for port 8080)
- Delete and existing config file for nginx in /etc/nginx/conf.d
- Create your custom nginx config /etc/nfinx/conf.d/"domain-name".conf
- Add following contents in  for https and connecting to your app running on http://"public ip"/amexptcalc uri
```bash
server {

  server_name rishighai.net;

  location /amexptcalc/ {
    proxy_pass http://127.0.0.1:8080/;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

    listen 443 ssl; # managed by Certbot
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/rishighai.net/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/rishighai.net/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = rishighai.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


  listen 80;
  listen [::]:80;

  server_name rishighai.net;
    return 404; # managed by Certbot


}
``` 

##### letencrypt certbot setup for https certs
- Create python venv
```bash
python3 -m venv /opt/certbot/
/opt/certbot/bin/pip install --upgrade pip
```
- install certbot using python
```bash
/opt/certbot/bin/pip install certbot certbot-nginx
```
- prepare certbot command
```bash
ln -s /opt/certbot/bin/certbot /usr/local/bin/certbot
```
- install certs and add the config to your nginx config in a single command
```bash
/opt/certbot/bin/certbot --nginx
```
- [Guide](https://certbot.eff.org/instructions?ws=nginx&os=pip)


##### complete nginx and https setup
- test and reload config
```bash
nginx -t
nginx -s reload
```
- [Guide](https://www.akamai.com/cloud/guides/use-nginx-reverse-proxy)
- Now the app should be visible on https://"domain name"/amexptcalc


