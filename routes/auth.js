const express = require('express');
const User=require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs')
var jwt = require('jsonwebtoken');

const JWT_SECRET="WhySoSerious$8";

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
            console.log(data)
          } catch (error) {
            if (error.code === 11000) {
              // Duplicate key error
              return res.status(400).json({ error: 'Email already exists',message:error.message });
            }
            console.error(error);
            res.status(500).json({ error: error.message });
          }
        });
        

   


module.exports=router 