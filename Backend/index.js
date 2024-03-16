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

app.post("/creat/category",(req,res)=>{
    const name = req.body.catName;
    const img = req.body.img;
    const order = req.body.order;

    if(name.length>0 && img.length > 0 && order.length >0){
        console.log(name + img+ order)
        db.query("INSERT INTO category_db (cat_name, cat_image, cat_order) VALUES ($1, $2, $3) RETURNING cat_id", [name, img, order])
        .then(result => {
            
            res.status(200).json({
                message: "Inserted new category",
                payload: result.rows[0].cat_id
                })
        })
        .catch(error => {
            console.error("Error inserting new category:", error);
            res.status(400).json({
                message: "Error inserted new category",
                payload: "insert_Fail"
                })
        });
    
    }else{ 
        res.status(400).json({
            message: "Text input empty",
            payload: "Text input empty"
            })
    }
   
});


app.patch("/update/category/:catid", (req, res) => {
    const { catName, img, order } = req.body;
    const catid = parseInt(req.params.catid);

    const updates = [];
    const values = [];

    let numOrder = 1;

    if (catName) {
        
        updates.push(`cat_name = $${numOrder++}`);
        values.push(catName);
       
    }
    if (img) {
        updates.push(`cat_image = $${numOrder++}`);
        values.push(img);
    }
    if (order) {
        updates.push(`cat_order = $${numOrder++}`);
        values.push(order);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            message: "Missing or invalid data",
            payload: null
        });
    }

    values.push(catid);

    const query = `UPDATE category_db SET ${updates.join(', ')} WHERE cat_id = $${values.length}`;

    db.query(query, values)
        .then(result => {
            if (result.rowCount > 0) {
                res.status(200).json({
                    message: "Updated category",
                    payload: catid
                });
            } else {
                res.status(404).json({
                    message: "Category not found",
                    payload: null
                });
            }
        })
        .catch(error => {
            console.error("Error updating category:", error);
            res.status(400).json({
                message: "Error updating category",
                payload: "update_Fail"
            });
        });
});


app.delete("/delete/category/:catid", (req, res) => {
    const catid = parseInt(req.params.catid);
    db.query("DELETE FROM category_db WHERE cat_id = $1", [catid])
        .then(result => {
            res.status(200).json({
                message: "Deleted category",
                payload: catid // Return the deleted category ID
            });
        })
        .catch(error => {
            console.error("Error Deleting category:", error);
            res.status(400).json({
                message: "Error deleting category",
                payload: "delete_Fail"
            });
        });
});



app.post("/create/quiz", (req, res) => {
    const { quiz_name, quiz_image, quiz_desc, quiz_aun_count, quiz_order, quiz_cate_id } = req.body;

    if (quiz_name && quiz_image && quiz_desc && quiz_aun_count && quiz_cate_id && quiz_order) {
        db.query('INSERT INTO quiz_db (quiz_name, quiz_image, quiz_desc, quiz_aun_count,quiz_order, quiz_cate_id) VALUES ($1, $2, $3, $4, $5,$6) RETURNING quiz_id,quiz_aun_count', [quiz_name, quiz_image, quiz_desc, quiz_aun_count, quiz_order, quiz_cate_id])
            .then(result => {
               
                // Create Questioner table --------------------------------------------

            const aunCount = result.rows[0].quiz_aun_count;
            const aunArr = [];

            for (let i = 1; i <= aunCount; i++) {
                aunArr.push(`aun_${i} varchar(255)`);
            }

            const query = `CREATE TABLE ${quiz_name.replace(/\s+/g, '_')+"_"+result.rows[0].quiz_id} (question_id BIGSERIAL PRIMARY KEY, question text, ${aunArr.join(', ')}, correct_aun varchar(255), question_quiz_id int REFERENCES quiz_db(quiz_id))`;

            db.query(query)
                .then(() => {
                   
                    console.log("Table created successfully"); 
                    res.status(200).json({
                        message: "Inserted new questioner",
                        payload: {
                            quiz_id : result.rows[0].quiz_id,
                            quiz_name,
                            table_name : quiz_name.replace(/\s+/g, '_')+"_"+result.rows[0].quiz_id
                        }
                    });
                })
                .catch(error => {
                    console.error("Error creating questioner:", error);
                    res.status(400).json({
                        message: "Error creating questioner",
                        payload: "insert_Fail"
                    });
                });



            })
            .catch(error => {
                console.error("Error inserting new quiz:", error);
                res.status(400).json({
                    message: "Error inserting new quiz",
                    payload: "insert_Fail"
                });
            });


    } else {
        res.status(400).json({
            message: "Missing input data",
            payload: null
        });
    }
});


app.patch("/update/quiz/:quiz_id",(req,res)=>{

    const quiz_id = req.params.quiz_id;
    const { quiz_name, quiz_image, quiz_desc,quiz_order} = req.body;

    let numOrder = 1;
    const updates =[];
    const value =[];

    if(quiz_name){
        updates.push(`quiz_name = $${numOrder++}`);
        value.push(quiz_name);
    }
    if(quiz_image){
        updates.push(`quiz_image = $${numOrder++}`);
        value.push(quiz_image);
    }
    if(quiz_desc){
        updates.push(`quiz_desc = $${numOrder++}`);
        value.push(quiz_desc);
    }
    if(quiz_order){
        updates.push(`quiz_order = $${numOrder++}`);
        value.push(quiz_order);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            message: "Missing or invalid data",
            payload: null
        });
    }

    value.push(quiz_id);

    const query = `UPDATE quiz_db SET ${updates.join(', ')} WHERE quiz_id = $${value.length}`;
    
    db.query(query,value)
    .then(result =>{
        if(result.rowCount > 0){
            res.status (200).json({
                message : "Updated quiz",
                payload: quiz_id
            });
        }else{
            res.status (404).json({
                message : "Quiz not found",
                payload: quiz_id
            });
        }
    })
    .catch(error => {
        console.error("Error updating quiz:", error);
        res.status(400).json({
            message: "Error updating quiz",
            payload: "update_Fail"
        });
    });

});


//// need to implement quiz delete////




//////////////////////////////////////


app.post ("/add/question/:quiz_name",(req,res)=>{

    const quiz_name = req.params.quiz_name

    const {question,aun_count,correct_aun,question_quiz_id} = req.body;
    
    
    const auns = [];
    const collom = [];
    for(let i = 1; i<= aun_count; i++){
        let newd = "req.body.aun_"+i;
        
        auns.push(eval(newd));

        let aun = "aun_"+i

        collom.push(aun);
    }
    console.log(collom.join(', '));
    const formData = [question].concat(auns.map(res=>{return res}),[correct_aun,question_quiz_id]);
 
   // const daraaa= auns.join(', ')
   var myJsonString = JSON.stringify(auns);
    console.log(Number(aun_count)+3);

    const quaryValues = []
    for (let g = 1; g<=(Number(aun_count)+3); g++){
        quaryValues.push('$'+g);
    }

    console.log(formData);
    const quary = `INSERT INTO ${quiz_name} (question,${collom.join(', ')},correct_aun,question_quiz_id) VALUES(${quaryValues.join(', ')}) RETURNING question_id`

    
    db.query(quary,formData)
    .then((result) => {
                   
        res.status(200).json({
            message: "Inserted new question",
            payload: {
                message: "Inserted new question",
                question_id : result.rows[0].question_id,
            }
        });
    })
    .catch(error => {
        console.error("Error creating question:", error);
        res.status(400).json({
            message: "Error creating question",
            payload: "insert_Fail"
        });
    });
    
});

app.patch("/update/question/:quiz_name/:question_id/:aun_count",(req,res)=>{
    
    const quiz_name = req.params.quiz_name;
    const {question,correct_aun} = req.body;

    const question_id = req.params.question_id;
    const aun_count = req.params.aun_count;

    const auns = [];
    const results = [];
    let numOrder =1;  

    if(question){
        auns.push(`question = $${numOrder++}`);
        results.push(req.body.question)
    }

    for(let i =1; i<=aun_count; i++){

        let aun = eval("req.body."+`${"aun_"+i}`);
        
      if(aun){
          
        auns.push(`aun_${i} = $${numOrder++}`);
        results.push(aun);
        }

    }

    if(correct_aun){
        auns.push(`correct_aun = $${numOrder++}`);
        results.push(req.body.correct_aun)
    }
    
console.log(auns)

console.log(question_id)

results.push(question_id);
console.log(results)
const quary = `UPDATE ${quiz_name} SET ${auns.join(', ')} where question_id = $${results.length}`;

console.log(quary)

db.query(quary,results)
.then(result =>{
    if(result.rowCount > 0){
        res.status (200).json({
            message : "Question updated",
            payload: question_id
        });
    }else{
        res.status (404).json({
            message : "Question not found",
            payload: question_id
        });
    }
})
.catch(error => {
    console.error("Error updating question:", error);
    res.status(400).json({
        message: "Error updating question",
        payload: "update_Fail"
    });
});

});


app.delete("/delete/question/:quiz_name/:question_id",(req,res)=>{

    const quiz_name = req.params.quiz_name;
    const question_id = req.params.question_id;

    db.query(`DELETE FROM ${quiz_name} WHERE question_id = $1`, [question_id])
        .then(result => {
            res.status(200).json({
                message: "Question deleted",
                payload: question_id 
            });
        })
        .catch(error => {
            console.error("Error Deleting question:", error);
            res.status(400).json({
                message: "Error deleting question",
                payload: "delete_Fail"
            });
        });


})




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  