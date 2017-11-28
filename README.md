# MS3-Backend

https://www.madisons3.com/api/

(Local) http://localhost:3000

## Progress (Iteration 2)

```
Completed: 
  (User Story 1) Sign-up                        POST /api/users
  (User Story 2) Activate Account               GET /api/activate?token=${token}
  (User Story 3) Request Activation             POST /api/reactivate
  (User Story 4) Sign-in                        POST /api/auth
  (User Story 5) Sign-out                       DELETE /api/auth
  (User Story 6) Deactivate Account             PUT /api/users/:id/deactivate
  (User Story 35) Employee - Deactivate User
  (Other) Employee Activate User                GET /api/users/:id/activate
  (Other) Get Employee Token For Testing        GET /api/auth
  (User Story 7) Get Reset Password Email       POST /api/reset-password
  (User Story 7) Reset Password Email           PUT /api/reset-password
  (User Story 8) Change Password                PUT /api/users/:id/password
  (User Story 9) Edit Account Information       PUT /api/users/:id/account-info
  (User Story 10) View Wishlist                 GET /api/users/:id/info
  (User Story 11) Add to Wishlist               POST /api/wishlist
  (User Story 12) Remove from Wishlist          DELETE /api/wishlist/:id
  (User Story 13) Get Vendor Access             POST /api/access
  (User Story 14) Get Customer Access
  (User Story 15) Cancel Access                 PUT /api/access
  (User Story 16) View/Sort Property List       GET /api/properties
  (User Story 17) Search by Keyword
  (User Story 18) Filter Properties
  (User Story 19) Viewing a Property            GET /api/properties/:id
  (User Story 20) Create a listing              POST /api/properties
  (User Story 22) Remove a listing              DELETE /api/properties/:id
  (User Story 30) Employee Sign-in              POST /api/employee-auth
  (User Story 34) Employee - Remove Property
  (User Story 36) Employee - Add Email Blacklist
                                                POST /api/blacklist
  (User Story 37) Employee - Remove email from blacklist
                                                DELETE /api/blacklist/:id
  (User Story 38) SuperAdmin - Add Employee     POST /api/employees
  (User Story 39) SuperAdmin - Remove Employee  DELETE /api/employees/:id
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

### Note: It is not recommended to run the server locally, since Google Datastore requires credentials and Gmail Authentication may fail when running locally.

```
$ .node_modules/pm2/bin/pm2 start app.js
```

## Testing

Please test APIs using Postman.

Download Postman (https://www.getpostman.com/) , then import test collection using file (MS3 Backend Iteartion 2.postman_collection.json), each test in the collection has included correct api URL, Http Method, and sample request.

For more details, please go to Repository Wiki page (https://github.com/CS506-MS3/ms3-node-backend/wiki)
