# MS3-Backend

https://www.madisons3.com/api/

(Local) http://localhost:3000

## Set up
Requires Newest Version of Node

Set up
```
$ (sudo) npm install
```

Ask Backend Team for secret.json file.
Put secret.json file under /secret/secret.json

```
- app.js
- controller
  |-user_controller.js
  |-activate_controller.js
  |-reactivate_controller.js
  |-auth_controller.js
  |-...
- node_modules
  |-...
- script
  |-...
- test
  |-...
- secret
  |-secret.json
- Testing MS3 Backend.postman_collection.json
- package-lock.json
- package.json
```

## Run Server

> .node_modules/pm2/bin/pm2 start app.js

## Testing

Download Postman (https://www.getpostman.com/) , then import test collection using file Testing MS3 Backend.postman_collection.json
