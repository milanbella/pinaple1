# pinaple1

This is webportal rush.js monorepo prototype.

The portal consists of the mesh of following applications:

- `apps/api` - core rest api  
- `apps/auth_be` - oauth authentification backend server
- `apps/auth_fe` - oauth autentification server frontent page in react - nextjs
- `apps/app_be` - portal application backend 
- `apps/app_fe` - portal application frontend in react - nextjs 

and of following sahred npm libraries:

- `common/types` - common typescript definitions
- `common/www` - common www utilities as well as sahred sass
- `common/components` - common react components library

To install all dependencie run:

```
rush update
```

To build everything run:

```
rush build
```

To run/develop portal locally start each application (each app must be run in separate shell, e.g you may use `tmux` terminal multiplexer):

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

Then the portal home page shall be available in your locall browser at `https//pinaple-app/`. 

What's working and has been tested so far:

- oauth code grant
- user registration
- login
