const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const url = require('url');
const { resolveSoa } = require('dns');
const fs = require('fs');
const multer = require("multer");
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

mongoose.set("strictQuery", false);

mongoose.connect('mongodb://localhost:27017/dental' , { useNewUrlParser: true } , (err) =>{
    if(err) {
        console.log(err);
    }else {
        console.log('success to connect mongodb');
    }
});

const app = express();
app.set ( "view engine", "ejs" );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname + '/images')));
app.use('./images', express.static('photos'))
app.use('/',router)

const article = new mongoose.Schema ({
    title : String,
    description : String,
    time : Date ,
    image : {
        data: Buffer,
        contentType: String
    }
    
} , {collection : 'blog'});


const DentistModel = mongoose.model('blog', article);

const articleDentist = mongoose.Schema({
    image : {
        data: Buffer,
        contentType: String
    },
    name : String,
    department : String
}, {collection : 'dentist'});

const DentistHModel = mongoose.model('dentist', articleDentist);

const articleQueue = new mongoose.Schema ({
    name : String,
    surname : String,
    mail : String,
    day : Date ,
    time : String , 
    option : String ,
    des : String ,
    phone : String,
    done : String
} , {collection : 'queues'});

const QueueModel = mongoose.model('queues', articleQueue);

router.get('/' , (req , res) => {
    DentistModel.find({}).limit(3)
    .then((data) => {
        res.render ( "index" , {data});
        console.log(data);
    })
});

router.get('/blog' , (req , res ) => {
    DentistModel.find({}).limit(12)
    .then((data) => {
        res.render ( "blog" , {data});
        
    })
});

router.get('/blog/:id' , async (req , res) => {
    const SelectedId = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(SelectedId)) 
        return res.status(404).json({ msg: `No task with id :${SelectedId}` });
    await DentistModel.find({_id : SelectedId})
    .then((data) => {
        res.render ( "content" , {data});
       
    })
});

router.get('/dental-inner' , (req , res ) => {
    QueueModel.find({done : '0'})
    .then((data) => {

        res.render('inner-post-blog' , {data});
    })
    
});

router.get('/dental-inner/:id' , (req , res ) => {
   
    const { id } = req.params;
    QueueModel.findOneAndUpdate({_id : id} , { $set : {done:'1' } } , {new : true} , (err , data) =>{
        
    });
    QueueModel.find({})
    .then((data) => {
       
        res.render('inner-post-blog' , {data});
    })
   
    res.redirect('/dental-inner');
    
});

router.get('/dentist' , (req , res) => {
    DentistHModel.find({}).limit(9)
    .then((data) => {
        res.render ( "dentist" , {data});
        
    })
});

router.get('/content' , (req , res) => {
    DentistModel.find({}).limit(1)
    .then((data) => {
        res.render ( "content" , {data});
        
    })
});

router.get('/booking' , (req , res ) => {
    res.render('booking');
});

router.get('/dentists', (req , res) => {
    DentistModel.find({}).then((users) => res.json(users))
});

router.get('/dentists/:id', (req , res) => {
    const { id } = req.params;
    DentistModel.findById(id).then((users) => res.json(users))
});

router.post('/booking' , (req , res) => {
    let queue = new QueueModel({
        name : req.body.name,
        surname : req.body.surname,
        mail : req.body.mail,
        day : req.body.day ,
        time : req.body.time ,
        option : req.body.option ,
        des : req.body.ps ,
        phone : req.body.phone
    });
    queue.save();
    res.redirect('/');
});



router.post('/loading2' ,upload.single('nameImage') ,(req , res) => {
    
    let Dentist = new DentistHModel({
        name : req.body.nameDentist,
        department : req.body.nameDentistDe,
        image : req.body.nameImage
    });
    
    Dentist.save();
    res.redirect('/dental-inner');
});

app.listen(8080 , () => {
    console.log("run server on localhost");
});