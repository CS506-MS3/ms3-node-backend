var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var router = express.Router()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

router.route('/users')
	.post(function(req, res) {
		res.json({ message: 'POST to localhost:3000/api/users, will be replaced by node module' })
	})



router.route('/users/:id/activate')
	.post(function(req, res) {
		res.json({ message: 'POST to localhost:3000/api/users/:id/activate', id: req.params.id })
	})

app.use('/api', router)

app.listen(3000)

