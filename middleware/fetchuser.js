var jwt = require('jsonwebtoken');
const JWT_SECRET="WhySoSerious$8";

const fetchuser=(req,res,next)=>{
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please try with valid Token"})
    }
    try {
        // const data = jwt.verify(token, JWT_SECRET);
        // req.user = data.user;
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data)
        

        
        req.user = data.user;
        next();
        
                
    } catch (error) {
        res.status(401).send({error:"Please try with valid Token"})

    }
    
}

module.exports=fetchuser;