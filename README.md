###配置微信公众号后台

#### step1:有一个vps server,并在server上装好nginx和node js （因为服务器有public ip,要让微信连上）
* sudo apt-get install nginx
* sudo apt-get install nodejs
* sudo apt-get install npm
* npm install pm2@latest -g


#### step2: 配置nginx的configuration file:
* 把 /etc/nginx/sites-available/default  (ubuntu only,其他linux的configuration file请自己google)  的内容改成:
```
server {
    listen 80;

    server_name vps的ip或者绑定的域名;

    location /wechat {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
* 配置完后运行: ``` sudo service nginx restart ```



#### step4: 在测试阶段,我们不直接在ut助手上测试,所以要注册一个测试用的公众号
* 在 http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login 注册和登陆
* 登陆后, 把 测试号信息 这一栏的appID copy下来, paste到 project根目录下的config.js 里的appid
* 在 接口配置信息 这一栏的url这一项, 填上vps的ip或者绑定的域名,加上'/wechat'  (e.g. http://www.mywebsite.com/wechat), token这一项填 config.js里的token,填好后保存

#### step5: 启动后台
* pm2 start app.js
* 扫描测试号的二维码, 然后就可以和后台互动啦!
