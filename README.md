# pinaple1

This is webportal rush.js monorepo prototype.

Portal consist of mesh of following applications:

`apps/api` - core rest api  
`apps/auth_be` - oauth authentification backend server
`apps/auth_fe` - oauth autentification server frontent page in react - nextjs
`apps/app_be` - portal application backend 
`apps/app_fe` - portal application frontend in react - next js 

and of following sahred npm libraries:

`common/types` - common typescript definitions
`common/www` - common www utilities
`common/components` - common react components

To install all dependencie run:

```
rush update
```

To build everything run:

```
rush build
```



To run/develop portal locally start all application (each must be starte in separate shell):

```
cd apps/api
npm run watch
```

```
cd apps/auth_be
npm run watch
```

```
cd apps/auth_fe
npm run dev
```

```
cd apps/app_be
npm run watch
```  

```
cd apps/app_fe
npm run dev
```

Then start locally nginx server using configurartion `common1/nginx/conf/nginx.conf` to reverse proxy over all apps. In your `/etc/hosts` file define server names as follow:

```
127.0.0.1 pinaple-app
127.0.0.1 pinaple-auth
127.0.0.1 pinaple-api
```

Then portal home page shal be available n your locall browser at `https//pinaple-app/`. 
