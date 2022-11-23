var mysql = require('mysql');
var ejs = require('ejs');
var jsdom = require('jsdom');
var{JSDOM} = jsdom;

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



var qus_index = 0;
var score = 0;
var ans_arr = [];
var sum_arr = [];
var qus_arr = [];
var qus_ans_arr = [];
const rrr = function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
app.post('/quiz', function(req, res) {

  //퀴즈최초받아오기
  var ttt = rrr(1,9);
  var sql = 'SELECT * FROM quiz where quizSet = ?';
  conn.query(sql, ttt, function(err, results) {
    if(qus_index <= 4) {
      res.render('quiz', {question : results[qus_index].question});
      ans_arr[qus_index] = results[qus_index].questionAns;
      sum_arr[qus_index] = results[qus_index].ansSum;
      qus_arr[qus_index] = results[qus_index].question;
      qus_ans_arr[qus_index] = req.body.ans_text;
      console.log(sum_arr)
      console.log(ans_arr);
      console.log(qus_ans_arr);
      qus_index++;
    }
    else{
      qus_ans_arr[qus_index] = req.body.ans_text;
      console.log(sum_arr)
      console.log(ans_arr);
      console.log(qus_ans_arr);
      for (let ga =0 ; ga<5 ; ga++) {
        if(qus_ans_arr[ga+1] == ans_arr[ga])
          score++;
      }
      console.log(score);
      qus_index=0;
      res.render('qus_results', {ansSumm : sum_arr, qAns : ans_arr, ques : qus_arr, mScore : score});
      ans_arr = [];
      sum_arr = [];
      qus_arr = [];
      qus_ans_arr = [];
    }
app.post('/ansCheck', function(req, res) {

})

  });

});
//ans_arr = [];
//sum_arr = [];
//qus_arr = [];


/*
app.post('/quizsub', function(req, res) {
  var sql = 'SELECT questionAns FROM quiz where quizSet = 1';
  conn.query(sql, function(err, results) {
    var a = 0;
    if(results[a] == req.body.ans_text)
  })
})
*/


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
