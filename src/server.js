//************---------------------requiremants -----------------------------------************
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { stat, truncate } = require('fs');
const app = express()
const http = require('http').createServer(app)
const path = require('path');
const hbs= require('hbs');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');




// ------------------------------connection to database ------------------------
require('./db/connect');

//-----------------------------models to aquire for schema---------------------
const Register = require("./models/register");
const RegisterO = require("./models/registerO");


// ------------------------extended requiremnts------------------
const async = require('hbs/lib/async');
const { append, cookie } = require('express/lib/response');

const { json } =require('express');
const { send } = require('process');
const { Console, error } = require('console');


// ----------------------------port local host--------------------
const PORT = process.env.PORT || 4000;

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
//------------------path finder--------------------------
const static_path =path.join(__dirname,'../public');

const template_path =path.join(__dirname,'../templates/views');

const partial_path =path.join(__dirname,'../templates/partials');


//-----------------------------using express json file 
app.use(express.json());
//cookie parser--
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));

app.use(express.static(__dirname + ''))



//------------------handlebars view engine---------------------------
app.set('view engine','hbs');
app.set('views',template_path);
hbs.registerPartials(partial_path);




//middleware for authentication # serialization work for NGO
const auth = async (req,res,next) =>{
  try {

      const token = req.cookies.jwt;

      const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

      const curruser = await Register.findOne({email:verifyUser._id});

      req.token = token;
      req.NGOuser = curruser;
      
      next();
      
      
  } catch (error) {
    
     res.render('loginO');
  }


}
//middleware for authentication # serialization work for ORGANISATION
const authO = async (req,res,next) =>{
  try {

      const token = req.cookies.jwt;

      const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

      const curruser = await RegisterO.findOne({email:verifyUser._id});

      req.token = token;
      req.Ouser = curruser;
      
      next();
      
      
  } catch (error) {
    
     res.render('loginO');
  }


}
// ------------------server ------register paths ------------------------------
app.get('/', (req,res)=>{
  res.render('loginN')
});
app.get('/loginO', (req,res)=>{
  res.render('loginO')
});

app.get('/registerN', (req,res)=>{
  res.render('registerN')
});
app.get('/registerO', (req,res)=>{
  res.render('registerO')
});
// using auth function for checking seralization
app.get('/index',auth, (req,res)=>{
  res.render('index')
});


// ------------------server ------register paths **end**------------------------------

// creating a new database for  ngo registration===> in database
app.post('/registerN', async(req,res)=>{
  try{
      const registerN = new Register({
       name : req.body.Nname,
       id : req.body.Nid,
       email :req.body.Nemail,
       phone :req.body.Nphone,
       password : req.body.password
      })

      const token =await registerN.generateAuthToken();
      console.log('the token part'+ token);
      
      res.cookie('jwt',token,{
        expires:new Date(Date.now()+6000000),
        httpOnly:true
      });

      console.log(cookie);

    const regiatered = await registerN.save();
    res.status(201).render('loginN');
  }
  catch(error){
      res.status(400).send(error);

  }
})
// creating a new database for  organisation registration===> in database
app.post('/registerO', async(req,res)=>{
  try{
      const registerOrg = new RegisterO({
       name : req.body.Oname,
       type : req.body.Otype,
       id : req.body.Oid,
       email :req.body.Oemail,
       phone :req.body.Ophone,
       password : req.body.password,
      })

      const token =await registerOrg.generateAuthToken();
      console.log('the token part'+ token);
      
      res.cookie('jwt',token,{
        expires:new Date(Date.now()+6000000),
        httpOnly:true
      });

      console.log(cookie);

    const regiatered = await registerOrg.save();
    res.status(201).render('loginO');
  }
  catch(error){
      res.status(400).send(error);

  }
})

// checking NGO login--------------> from database ------------------
app.post('/Nlogin', async(req,res)=>{
   try{
         const email =req.body.email;
         const password =req.body.password;
    const username = await Register.findOne({email:email});

    const isMatch = await bcrypt.compare(password, username.password);
    
    const token =await username.generateAuthToken();
      console.log('the token part'+ token);
    
      res.cookie('jwt',token,{
        expires:new Date(Date.now()+600000),
        httpOnly:true,
        //secure:true
      });



    if(isMatch){
        res.status(202).render('index');
       
             
   }
    else{
       res.send("invalid password details");
   
   }
   }   
   catch(error){
     res.status(404).send("invalid login details");
    }
   });

// checking NGO login--------------> from database ------------------
app.post('/Ologin', async(req,res)=>{
  try{
        const email =req.body.email;
        const password =req.body.password;
   const username = await RegisterO.findOne({email:email});

   const isMatch = await bcrypt.compare(password, username.password);
   
   const token =await username.generateAuthToken();
     console.log('the token part'+ token);
   
     res.cookie('jwt',token,{
       expires:new Date(Date.now()+600000),
       httpOnly:true,
       //secure:true
     });



   if(isMatch){
       res.status(202).render('index');
      
            
  }
   else{
      res.send("invalid password details");
  
  }
  }   
  catch(error){
    res.status(404).send("invalid login details");
   }
  });

