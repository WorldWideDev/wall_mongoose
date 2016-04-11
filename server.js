var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://localhost/wall')
app.use(bodyParser.urlencoded())
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res){
	Message.find({}).populate('comments').exec(function (err, messages){
		if(err){
			res.json(err)
		}else{
			console.log(messages)
			res.render('index', {messages})
		}
	})
})

//post a wall message
app.post('/message', function (req, res){
	var message = new Message({
		messenger: req.body.name,
		content: req.body.content,
		createdAt: Date.now()
	})
	message.save(function (err){
		if(err){
			console.log('sometings amiss');
			errors = err.errors;
			res.redirect('/')
		}else{
			console.log('succuessfully added')
			res.redirect('/')
		}
	})
})
app.post('/comment/:id', function (req, res){
	Message.findOne({_id: req.params.id}, function (err, message){
		if(err){
			res.json(err)
		}else{
			console.log(message)
			var comment = new Comment ({
				commenter: req.body.name,
				content: req.body.content,
				_message: req.params.id
			});
			comment.save(function (err){
				if(err){
					console.log('somethings amiss');
					res.json(err)
				}else{
					message.comments.push(comment._id)
					message.save(function (err){
						if(err){
							res.json(err)
						}else{
							console.log('successfully added a comment')
							res.redirect('/')
						}
					})
					console.log(res)
				}
			})
		}
	})
})

var server = app.listen(3030, function (){
	console.log('its the year 3030')
})

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	messenger: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	comments: [{
		type: Schema.Types.ObjectId,
		ref: 'Comment'
	}],
	createdAt: {
		type: Date,
		default: new Date
	}
})

mongoose.model('Message', MessageSchema)
var Message = mongoose.model('Message')

var CommentSchema = new Schema({
	_message: {
		type: Schema.Types.ObjectId,
		ref: 'Message'
	},
	commenter: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: new Date
	}
})

mongoose.model('Comment', CommentSchema)
var Comment = mongoose.model('Comment')
