//npm install express mongoose body-parser cors jsonwebtoken bcryptjs --save

require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var app = express();
const port = 3002;

var app = express();
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true,useUnifiedTopology: true }, () => {
	console.log("połączono z bazą mongo!");
	app.listen(port, () => console.log("Serwer pracuje na porcie: " + port));
	console.log("test serwera: http://localhost:" + port + "/hello");
	console.log("link do listy zadań: http://localhost:" + port + "/");
	console.log("link do login Page: http://localhost:" + port + "/loginPage");
	console.log("link do login Page: http://localhost:" + port + "/register");
});

var schema = mongoose.Schema({
	nazwa:{type:String, required:true},
	zakonczone:{type:Boolean, default:false},
	data:{type:Date, default:Date.now}
}); 

var userSchema = mongoose.Schema({
	user:{type:String, required:true},
	email:{type:String, required:true},
	pass:{type:String, required:true},
	active:{type:Boolean, default:false},
	dataUtworzenia:{type:Date, default:Date.now}
}); 

var task = mongoose.model('myToDoList',schema);
var userModel = mongoose.model('userList',userSchema);

// pokaż login page
app.get('/loginPage', function(req, res) {
	res.render('loginPage');
	console.log('Login Page');				  
});

// pokaż register page
app.get('/register', function(req, res) {
	res.render('register');
	console.log('Register Page');				  
});

// loguj page
app.get('/login', function(req, res) {
	var userName = req.body.user;
	var userPass = req.body.pass;

	var foundUser = userModel.findOne(userName, (err,user) => {
		console.log("znalezionu user + ", user);
	});

	if(userName==foundUser.user 
		&& bcrypt.compare(userPass,foundUser.pass ) ){
		res.redirect('/');
	}else{
		console.log(err);
	}
});

	//const findUser = userModel.find( user {req.body.user});
	//console.log(findUser);

    // if (user && bcrypt.compareSync(req.body.pass, user.pass)) {
    //     const token = jwt.sign({ sub: user.id }, process.env.SECRET, { expiresIn: '7d' });
    //     return {
    //         ...user.toJSON(),
    //         token
    //     };
    // }
	//res.render('/');
	//console.log('zalogowano');				  


// dodaj usera
app.post('/addUser', function(req, res) {
	var newUser = new userModel();
	newUser.user = req.body.user;
	//newUser.pass = req.body.pass
	newUser.pass = bcrypt.hashSync(req.body.pass, 10);
	newUser.email = req.body.email;
	newUser.save();
	res.redirect('/loginPage');
	console.log('user dodany');
});

// dodaj usera
// app.post('/login', function(req, res) {
// 	var newUser = new userModel();
// 	newUser.user = req.body.user;
// 	console.log("po " + req.body) ;
// 	newUser.save();
// 	res.redirect('/');
// 	console.log('user dodany');
// });


// pokaż tasks
app.get('/', function(req, res) {
	task.find({},(err, tasks)=>{
		console.log('lista tasków');//,tasks);
		res.render('myToDoView', {tasks:tasks || [] })
		if (err) return console.log(err);
	});					  
});

// dodaj zadanie
app.post('/', function(req, res) {
	var zadanie = new task();
	zadanie.nazwa = req.body.nazwa
	zadanie.save();
	res.redirect('/');
	console.log('dodaj task');
});

// usuń
app.post('/:id/usun', function(req, res) {
	task.deleteOne({_id: req.params.id}, (err, tasks)=>
		{
			res.redirect('/')
			console.log('usuń');
			if (err) return console.log(err);
		});
});

// usuń zakończone
app.post('/usunWszystkie', function(req, res) {
	task.deleteMany({'zakonczone':true}, (err, tasks)=>
		{
			res.redirect('/')
			console.log('usuńWszystkie');
			if (err) return console.log(err);
		});
});

// zakończ zadanie
app.post('/:id/zakoncz', function(req, res) {
	task.findById({_id: req.params.id}, (err, tasks)=>
		{
			tasks.zakonczone = true;
			tasks.save();
			setTimeout(() => {  console.log("wait!"); }, 2000);
			res.redirect('/')
			console.log('zakoncz');
			if (err) return console.log(err);
		});
});

// test serwera
app.get('/hello', (req, res) => {
  res.send('hey hi hello!!!')
});