var mysql = require('mysql');
var ejs = require('ejs');

var express = require('express');
var bodyParser = require('body-parser');
var dbConfigure = require('./dbConfigure');

var app = express();
var dbDet = {
  host : dbConfigure.host,
  port : dbConfigure.port,
  user : dbConfigure.user,
  password : dbConfigure.password,
  database : dbConfigure.database
};

var conn = mysql.createConnection(dbDet);
conn.connect();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended : false}));
app.use(express.static(__dirname + '/public'));
//app.get('/', function (req, res) {
//  res.sendFile( __dirname + "/" + "login.html" );
//});
app.get('/', function (req,res) {
  res.send('<a href="/login">login</a>');
});

app.get('/login', function(req, res) {
  res.render('login');
});

quizQ = [];
console.log(quizQ);

app.get('/quiz', function(req, res) {
  res.sendFile(__dirname + '/' + 'quiz.html')
  //퀴즈최초받아오기
  var sql = 'SELECT question FROM quiz where quizSet = 1';
  conn.query(sql, function(err, results) {
    quizQ = results;
    //console.log(results[0].question);
    res.render('quiz', {question : results[0].question});

  });
});

app.get('/register', function(req,res) {
  res.sendFile(__dirname + '/' + 'signin.html')
})

app.get('/main', function(req,res) {
  return res.sendFile(__dirname + '/' + 'main.html');
})

app.post('/login', function(req, res) {
  var id = req.body.username;
  var pw = req.body.password;
  var sql = 'SELECT * FROM users WHERE id= ?';
  conn.query(sql, id, function(err, results) {
    if (err)
      console.log(err);

    if (!results[0])
      return res.send('<script type="text/javascript">alert("ID를 다시 확인하세요"); document.location.href="/login";</script>');

    var user = results[0];
      if (err)
        console.log(err);
      if(pw === user.password) {
        return res.sendFile(__dirname + '/' + 'main.html');
      }
      else
        return res.send('<script type="text/javascript">alert("비밀번호를 다시 확인하세요"); document.location.href="/login";</script>');

  });
});

// 회원가입 부분
app.post('/register', function(request, response) {
    var id = request.body.id;
    var password = request.body.password;
    var passworda = request.body.passworda;
    var name = request.body.name;
    var telNum = request.body.telNum;
    var firstScore = 0;
    console.log(id, password, name, telNum);
    if (id && password && passworda && telNum && name) {
        conn.query('SELECT * FROM users WHERE id = ?', [id, password, telNum], function(error, results, fields) {
            if (error) throw error;
            if (results.length <= 0 && password == passworda) {
                conn.query('INSERT INTO users (id, password, name, telNum, totalScore) VALUES(?,?,?,?,0)', [id, password, name, telNum],
                function (error, data) {
                    if (error)
                    console.log(error);
                    else
                    console.log(data);
                });
                  response.send('<script type="text/javascript">alert("회원가입을 환영합니다!"); document.location.href="/login";</script>');
            } else if(password!=passworda){
                response.send('<script type="text/javascript">alert("입력된 비밀번호가 서로 다릅니다."); document.location.href="/register";</script>');
            }
            else {
                response.send('<script type="text/javascript">alert("이미 존재하는 아이디 입니다."); document.location.href="/register";</script>');
            }
            response.end();
        });
    } else {
        response.send('<script type="text/javascript">alert("모든 정보를 입력하세요"); document.location.href="/register";</script>');
        response.end();
    }
});


//문제 등록 부분
app.get('/quizins', function(req, res) {
  res.render('quiz_insert')
});

app.post('/quizins', function(req, res) {
  var quizQ = req.body.quizmain;
  var quizAns = req.body.quizans;
  var quizLink = req.body.anslink;
  var quizDesc = req.body.ansdesc;
  var quizsetNum = req.body.setNum;
  if (quizQ && quizAns && quizDesc && quizsetNum) {
              conn.query('INSERT INTO quiz (question, questionAns, ansLink, ansSum, quizSet) VALUES(?,?,?,?,?)', [quizQ, quizAns, quizLink, quizDesc, quizsetNum],
              function (error, data) {
                  if (error)
                  console.log(error);
                  else
                  console.log(data);
                  res.send('<script type="text/javascript">alert("등록되었습니다"); document.location.href="/login";</script>');
                  res.end();
              });

  } else {
      res.send('<script type="text/javascript">alert("모든 정보를 입력하세요"); document.location.href="/quizins";</script>');
      res.end();
  }
});

app.listen(3000, function() {
  console.log('Server running at 3000');
});

