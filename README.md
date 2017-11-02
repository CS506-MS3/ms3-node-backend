# MS3-Backend

https://www.madisons3.com/api/

(Local) http://localhost:3000

## Set-up
Requires Newest Version of Node

Setup
```
$ (sudo) npm install
```

Ask Backend Team for secret.json file.
Put secret.json file under /secret/secret.json

-app.js\s\s
-controller\s\s
 |-user_controller.js\s\s
 |-activate_controller.js\s\s
 |-reactivate_controller.js\s\s
 |-auth_controller.js\s\s
 |-...\s\s
-node_modules\s\s
 |-...\s\s
-script\s\s
 |-...\s\s
-test\s\s
 |-...\s\s
-secret\s\s
 |-secret.json\s\s
-Testing MS3 Backend.postman_collection.json\s\s
-package-lock.json\s\s
-package.json\s\s


## Build Server

.node_modules/pm2/bin/pm2 start app.js

## Testing

Download Postman, then import test collection using file Testing MS3 Backend.postman_collection.json
