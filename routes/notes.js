const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes=require('../models/Notes');
const User=require('../models/User');

const { body, validationResult } = require('express-validator');



// ROUTE 1:Get all notes using: GET "/api/notes/fetchallnotes".  login required

router.get('/fetchallnotes',fetchuser, async (req,res)=>{
    try {
        const notes=await Notes.find({user:req.user.id})
        res.json(notes)
        
    } catch (error) {
        res.status(500).json({ error:"Internal Server Error" });
      }
    
})

// ROUTE 2:Add a new note using: POST "/api/notes/addnote". login required

router.post('/addnote',fetchuser,[
    body('title','Enter a valid title').isLength({min:3}),
    body('description','Description must be atleast 5 characters').isLength({min:5})
], async (req,res)=>{
    try {
        const { title ,description ,tag }=req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        userId = req.user.id;
        const user1 = await User.findById(userId).select("-password")
        

        const notes=new Notes({
            title ,description ,tag ,user:req.user.id,username:user1.name

        })
        const savedNote=await notes.save();
    
        res.json(savedNote);
            
    } catch (error) {
        res.status(500).json({ error:"Internal Server Error" });
      }
    
});

// ROUTE 3:Update am existing  note using: PUT "/api/notes/updatenote". login required
router.put('/updatenote/:id',fetchuser, async (req,res)=>{
    try {
        const {title, description, tag}=req.body;
        const newNote={};
        if(title){newNote.title=title};
        if(description){newNote.description=description};
        if(tag){newNote.tag=tag};

        let notes=await Notes.findById(req.params.id);
        if(!notes){
            return res.status(404).send("Not Found");

        }

        if(notes.user.toString()!== req.user.id){
            return res.status(401).send("Not Allowed");

        }
        // console.log(notes.user);
        // console.log(req.user.id);

        notes=await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true});
        res.json({notes});
 
    } catch (error) {
        res.status(500).json({ error:"Internal Server Error" });
      }

});
// ROUTE 4:Delete an existing  note using: DELETE "/api/notes/deletenote". login required
router.delete('/deletenote/:id',fetchuser, async (req,res)=>{
    try {
        
       

        let notes=await Notes.findById(req.params.id);
        if(!notes){
            return res.status(404).send("Not Found");

        }

        if(notes.user.toString()!== req.user.id){
            return res.status(401).send("Not Allowed");

        }
        // console.log(notes.user);
        // console.log(req.user.id);

        notes=await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success":"Note has been deleted"});
 
    } catch (error) {
        res.status(500).json({ error:"Internal Server Error",notes:notes });
      }

});



module.exports=router