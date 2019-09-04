var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var gravatar = require('gravatar');
var moment = require('moment');

var async = require('async')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var Lead = require('./models/leads')
var Count = require('./models/counts')
const deadline='2019-12-22 17:00:00'



const  subscriberGoal = 100
const shareGoal = 100

mongoose.connect('mongodb://localhost/lead-generator', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we\'re connected!')
});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/',function(req,res,next){
    const { success } = req.query


 
    async.parallel({
      leadsCount:(next) =>{
          Lead.count({}).exec(next)
      },
      leads:(next)=>{
          Lead.find({})
          .sort({_id:-1  })
          .limit(25)           
          .exec(next)
      }, 
      clickCounts: (next) => {
          Count.find({}).exec(next)
      },
    },
    (err ,results)=>{

      const {clickCounts,leads,leadsCount} = results

      leads.forEach((lead)=>{
          lead.gravatar = gravatar.url(lead.email);
      })

      clicks = {}
      let totalClick = 0
      clickCounts.forEach((clickCount)=>{
          clicks[clickCount.name]=clickCount.count
          totalClick += clickCount.count
      })

      res.render('index',{
        clickCounts: clicks,
        count: leadsCount,
        deadline,
        goal: subscriberGoal,
        leads:leads ,
        moment,
        shareGoal,
        success ,
        title: 'welcome to my test page',
        totalClick, 
        })
})


})

app.post('/api/v1/counts',(req,res,next)=>{
  const {body}= req
  if (body.name){
      Count.findOneAndUpdate({name: body.name},{$inc:{count:1}},{new:true ,upsert:true}).then((item)=>{
        res.json({succes:true,name:item.name ,count:item.count})
      })
    }else{
      res.json({success:false,error:'please pass a name.'})
    }
})


app.post('/subscribe' , (req,res,next) => {
	const body = req.body
	const {name,email} = body


  var newLead = new Lead({
    name: name,
    email: email,
  })

  newLead.save()

  res.redirect('/?success=true')
})



app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
