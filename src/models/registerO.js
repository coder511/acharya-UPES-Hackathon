//requiremnets -------------------require



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const async = require('hbs/lib/async');
const jwt =require('jsonwebtoken');
const res = require('express/lib/response');

// schema --------------registration for patient
const RegisterationO = new  mongoose.Schema({
 name : {
     type:String,
     required:true
 },
 type : {
    type:String,
    required:true
},
 
 id : {
    type:String,
    required:true
 },
 email : {
   type:String,
   required:true,
   unique:true
},
phone : {
   type:Number,
   required:true,
   unique:true
},

password : {
   type:String,
   required:true
},

tokens: [{
    token :{
       type:String,
       required:true
    }
 }]
})
//---------------token generation for work modulle for authentication-------
RegisterationO.methods.generateAuthToken = async function(){

   try{
      const token = jwt.sign({_id:this.email}, process.env.SECRET_KEY);
       this.tokens = this.tokens.concat({token:token})
      await this.save();

      return token;
   }
   catch (error){
      res.send('the error part' + error);
      console.log('the error part' + error);

   }
}
//--------------- incription of password---------------
RegisterationO.pre('save', async function(next){
   if(this.isModified('password')){
      console.log(`this password is ${this.password}`);
      this.password = await bcrypt.hash(this.password, 10);
      console.log(`this password is ${this.password}`);
   }
   
   next();
})


// create a collection regarding your patient registration

const registerO = new mongoose.model("Oregister",RegisterationO);

module.exports = registerO;

