# MS3-Backend

https://www.madisons3.com/api/

(Local) http://localhost:3000

## Progress

```
Completed: 
  (User Story 1) Sign-up                        POST /api/users
  (User Story 2) Activate Account               GET /api/activate?token=${token}
  (User Story 3) Request Activation             POST /api/reactivate
  (User Story 4) Sign-in                        POST /api/auth
  (User Story 5) Sign-out                       DELETE /api/auth
  (User Story 6) Deactivate Account             PUT /api/users/:id/deactivate
  (Other) Employee Activate User                GET /api/users/:id/activate
  (Other) Get Employee Token For Testing        GET /api/auth
```
  

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

```
$ .node_modules/pm2/bin/pm2 start app.js
```

## Testing

Note: It is not recommended to run the server locally, since Google Datastore requires credentials and Gmail Authentication may fail when running locally.

Please test APIs using https://www.madisons3.com/api/

Download Postman (https://www.getpostman.com/) , then import test collection using file Testing MS3 Backend.postman_collection.json, each test in the collection has included correct api URL, Http Method, and sample request.

For more details, please go to Repository Wiki page (https://github.com/CS506-MS3/ms3-node-backend/wiki)
