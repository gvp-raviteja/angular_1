var express = require("express");
var http = require('http');
var path = require('path');
var fs = require('fs-extra'),
    engines = require('consolidate'),
    _ = require('underscore');
var spawn=require('child_process').spawn;
var mongoose=require("mongoose");
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var tag = require('./toHtml.js');
//connecting to database
mongoose.connect("mongodb://localhost/server");

//creating user schema
var UserSchema;
UserSchema = new mongoose.Schema({
    username:String,
    password:String
});
UserSchema.methods.validPassword=function( pwd ) {
    return ( this.password === pwd );
};

//creating a model with defined user schema
var User = mongoose.model('users', UserSchema);


jsonData=fs.readJsonSync('./programs/programs.json');
json_status={'status':null,'err':null,'output':null};
var clientDir = path.join(__dirname, 'client');
var app = express();

app.configure(function(){
	app.use(express.favicon());
  	app.use(express.logger('dev'));
  	app.use(express.bodyParser());
    app.use(express.cookieParser('sample cookie '));
    app.use(express.session());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
	app.use(express.static(clientDir));
    app.engine('html', engines.underscore);
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
      console.log(username);
      console.log(password);
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    });
  }
));

var auth = function(req, res, next){
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.get('/', function (req, res) {
    console.log(req.session);
    res.sendfile("./client/index.html");
});

/*app.get('/ide',function(req,res){
    res.sendfile("ide.html");
})*/
app.get('/session',function(req,res){
    res.send(req.session);
})
app.get('/list',auth,function(req,res){
	res.json(jsonData);
});

app.get('/list/:id',auth,function(req,res){
	var id = ~~req.params.id;
  	var pgm = _(jsonData).find(function(pgm) { return pgm.id === id });
	
	if (!pgm)
    res.json(null);
  else
	{
        //console.log(pgm);
        var string='./programs/desc'+id+'.json';
        //console.log(string);
        tempjsonData=fs.readJsonSync(string);
        res.json(tempjsonData);
	}
});

app.post('/list/:id',auth,function(req,res){
    var code=req.body;
    var id = ~~req.params.id;
    json_status={'status':0,'err':0,'output':0};
    fs.writeFile('temp.c',code.code,function(err){
        if(err)
        {
            console.log(err);
            json_status.status='unable to submit code';
            res.json(json_status);
        }
        else
        {
            var terminal=spawn('gcc',['-o','temp','temp.c'],function(err){
                console.log(err);
                res.json(err);
            });
            
            /*terminal.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
                json_status.output=data;
            });*/
            
            terminal.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
                json_status.err='compilation error';//compilation error
            });

            
            terminal.on('close',function(code){
                console.log("end of stdin nd stdout"+code);
                if(json_status.err!=0)
                    res.json(json_status);
                else
                {
                    var child=spawn('temp.exe',[],{timeout:1000,maxBuffer: 20*1024, killSignal: 'SIGTERM'});
                    
                    setTimeout(function(){
                        console.log('kill');
                        child.kill();
                        json_status.err='tle'; // time limit exceeded
                        json_status.output=null;
                        res.json(json_status);
                    },1000);
                    
                    child.stdout.on('data', function (data) {
                        console.log('stdout: ' + data);
                        json_status.output=data.toString();
                    });
                    
                    child.stderr.on('data', function (data) {
                        console.log('stderr: ' + data);
                        json_status.err='runtime error';// runtime error
                    });
                    
                    child.on('exit', function (code) {
                        console.log('child process exited with code ' + code); 
                        if(code!=0)
                            json_status.err='runtime error';
                    });
                    
                    child.on('close',function(code){
                        res.json(json_status);
                    });
                    fs.readFile('./programs/input'+id+'.txt',function(err,data){
                        if(err) throw err;
                        child.stdin.write(data);
                        child.stdin.end();
                    });
                    
                    
                }
            });
        }
    });
    
});

app.post('/ide/:state',function(req,res){
         var code=req.body;
        json_status={'status':0,'err':0,'output':0};
        fs.writeFile('temp.c',code.code,function(err){
        if(err)
        {
            console.log(err);
            json_status.err='unable to submit code';
            json_status.status=2;
            res.json(json_status);
        }
        else
        {
            var terminal=spawn('gcc',['-o','temp','temp.c'],function(err){
                console.log(err);
                json_status.err=err;
                json_status.status=2;
                res.json(json_status);
            });
            terminal.stdout.on('data',function(data){
                console.log(data);
            });
            terminal.stderr.on('data', function (data) {
            json_status.err='compilation error';
                json_status.status=2;
             res.json(json_status);
            });
            
            terminal.on('close',function(c){
                if(c!=0){
                    json_status.status='failed';
                    json_status.status=2;
                    res.json(json_status); 
                }
                else if(code.state=="compile"){
                    json_status.status=1;
                    res.json(json_status); 
                }
                else{
                    var child=spawn('temp.exe',[],{timeout:1000,maxBuffer: 20*1024, killSignal: 'SIGTERM'});
                    
                    setTimeout(function(){
                        child.kill();
                        json_status.err='time limit exceeded'; // time limit exceeded
                        json_status.output=null;
                        json_status.status=2;
                        res.json(json_status);
                    },1000);
                    child.stdout.on('data', function (data) {
                        console.log('stdout: ' + data);
                        json_status.output=tag.toHtml(data.toString());
                    });
                    child.stderr.on('data', function (data) {
                        json_status.err='runtime error';// runtime error
                        json_status.status=2;
                        res.json(json_status);
                    });
                    child.on('close',function(c){
                        console.log(c);
                        res.json(json_status);
                        
                    });
                    if(code.input!=null)
                        child.stdin.write(code.input);
                    child.stdin.end();
                }
                
            });
        }
        });
         
});

app.post('/logout', function(req, res){
    req.logOut();
    res.send(200);
});

app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/login',passport.authenticate('local') ,function(req,res){
    console.log("login successful");
    res.send(req.user);
} )

app.post('/signup',function(req,res){

    User.findOne({ username: req.body.username }, function (err, user){
        details={'message':''}
       if(err) 
           res.status(404).send(err);
        else if(!user){
             user1=new User({username:req.body.username,password:req.body.password});
             user1.save(function(err){
                if(err){
                details.message=err;
                res.status(400).json(details);}
               });
             details.message='signup successful';
           res.json(details);
        }
        else{
            details.message='user already exists';
            console.log(details);
            res.status(400).json(details);
        }
        console.log("bondy");
            
    });
})

var server = http.createServer(app);
server.listen(8080);
console.log("server is listening to port 8080");
