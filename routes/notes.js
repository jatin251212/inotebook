const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    obj={
        "name":"Jatin"
    }
    res.json(obj)
})
module.exports=router