const express = require('express');
const User=require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs')
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET="WhySoSerious$8";

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','Enter a valid password').isLength({min:5})], async(req,res)=>{
        // console.log(req.body);
        // const user=User(req.body);
        // user.save();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        try {
            const salt=await bcrypt.genSalt(10);
            const secPass=await bcrypt.hash( req.body.password,salt)

            const user = await User.create({
              name: req.body.name,
              email: req.body.email,
              password: secPass
            });

            const data={
              user:{
                id:user.id
              }
            }
            const authToken= jwt.sign(data, JWT_SECRET)
            

            res.json({authToken});
            
          } catch (error) {
            if (error.code === 11000) {
              // Duplicate key error
              return res.status(400).json({ error: 'Email already exists',message:error.message });
            }
            console.error(error);
            res.status(500).json({ error: error.message });
          }
        });

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login',[
          body('email','Enter a valid email').isEmail(),
          body('password','Password cannot be blank').exists()], async(req,res)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }
            const {email,password}=req.body;
            try {
              let user=await User.findOne({email});
              if(!user){
                return req.status(400).json({error: 'Please try to login with correct Information'})
              }

              const comparePass=await bcrypt.compare(password,user.password);
              if(!comparePass){
                return req.status(400).json({error: 'Please try to login with correct Information'})

              }
              const data={
                user:{
                  id:user.id
                }
              }
              const authToken= jwt.sign(data, JWT_SECRET)
  
              res.json({authToken});


              // console.log(user);
            }catch (error) {
              res.status(500).json({ error:"Internal Server Error" });
            }

          });

          // ROUTE 3: Get logged in User Details using: POST "/api/auth/getuser". Login required
          router.post('/getuser', fetchuser,  async (req, res) => {

            try {
              userId = req.user.id;
              const user = await User.findById(userId).select("-password")
              
              res.send(user)
            } catch (error) {
              console.error(error.message);
              res.status(500).send("Internal Server Error");
            }
          })

        

   


module.exports=router 