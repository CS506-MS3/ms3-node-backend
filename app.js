var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO /api/users
var userController = require('./controller/user_controller'); // import user controller module (user_controller.js) from controller dir
router.use('/users', userController); // mount /api/users to user controller module

// TODO /api/authenticate
// TODO /api/access
// TODO /api/employee
// TODO /api/
// TODO /api/blacklist

app.get('/', function(req, res){
	res.send('Hello');
});

app.use('/api', router)

app.listen(3000)

