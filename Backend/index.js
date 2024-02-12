import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "timetoquiz",
    password: "shanaka",
    port: 5432,
  });
  db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// ---------- User Home page requests ---------------------

app.get("/getcategory",(req,res)=>{
   
        db.query('SELECT * FROM category_db',(err,resp)=>{
            if(err){
                res.status(400).json({
                    message: "All Categorys are going wrong"
                    })
            }else{
             res.status(200).json({
                 message: "All Categorys",
                 payload: resp.rows
                 })
            }    
         })
});

app.get("/getcategory/quiz/:catName",(req,res)=>{
    const catName = req.params.catName;
    db.query("SELECT cat_name, cat_order,quiz_name,quiz_image,quiz_desc,quiz_aun_count FROM category_db c join quiz_db q on c.cat_id = q.quiz_cate_id where c.cat_name = $1",[catName,],(err,resp)=>{
        
             if(err){
                res.status(400).json({
                    message: "All Categorys are going wrong"
                    })
            }else{
                res.status(200).json({
                    message: catName + " Quizes",
                    payload: resp.rows
                    })
            }
    })
});





app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  