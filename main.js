/**
 * This is a node.js webservice
 * for tax records. You can use Postman or 
 * other APIs to test your webservice.
 * Please remember that request, if necessary, 
 * have to be in JSON style.
 * 
 */

var express = require('express'); //install via npm
var bodyParser = require("body-parser");//install via npm
var mysql = require("mysql");
var app = express();

/**
 * Allow cross origin headers
 */
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();

});

/**
 * Use body parser to parse post request
 */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/**
 * Init Mysql connection
 * @type void
 */
var con = mysql.createConnection({
    host: "localhost",
    port: "8889", //necessary
    user: "middleware",
    password: "middleware",
    database: "records"
});


/**
 * Get all tax records
 */
app.get("/records", function (req, res) {
    con.connect(function (err) {
        if (err)
            throw err;

        console.log("Connected!");
    });

    con.query("SELECT * from tax_record", function (err, rows, fields) {
        if (!err) {
            
            var result = [];
            rows.forEach(function(entry){
                //create json
                var entry = {
                    
                    id : entry.id,
                    date: entry.create_time,
                    amount: entry.amount,
                    tax: entry.tax,
                    total: entry.total,
                    currency : entry.currency
 
                };
                //append to result array
                result.push(entry);
                
            });
            //send results
            res.send(result);
        } else {
            
            console.log("Error while performing Query.");
        }

        con.end();
    });


});

/**
 * CREATE - Adds a new tax record
 */
app.post("/record", function (req, res) {
    
    var amount = req.body.amount;
    var tax = req.body.tax;
    var currency = req.body.currency;
    var total = amount * ((tax + 100) / 100);
    
    console.log(currency);
    
    con.connect();
    con.query("INSERT INTO tax_record (amount,tax,total,currency)"+
    "VALUES ("+amount+","+
    tax+","+
    total+",'"+
    currency+"')"
    , function (err, row, fields) {
        if(err) throw err;
    });
    
    con.end();
    res.end("done");
});

/**
 * READ - Get a specific tax record by id
 */
app.get("/record/:id", function(req,res){
    var rec_id = req.params.id; //assign get parameter id
    con.connect();
    con.query("SELECT * from tax_record WHERE id="+rec_id, function (err, row, fields) {
        if (!err) {
            if( row.length > 0){
                var record = {
                    
                    id : row[0].id,
                    date: row[0].create_time,
                    amount: row[0].amount,
                    tax: row[0].tax,
                    total: row[0].total,
                    currency : row[0].currency
 
                };
                //send results
                res.send(record);
                res:end();
  
            }else{
                var record = {
                    id : 0,
                    date: "01.01.1970",
                    amount: 0.00,
                    tax: 0.00,
                    total: 0.00,
                    currency : "NONE"
                };
                res.send(record);
                res.end();
            }

        } else {
            
            console.log('Error while performing Query.');
        }

        con.end();
    });

});

/**
 * DELETE - Deletes a specific record
 */
app.delete("/record/:id", function (req, res) {
    var id = req.params.id;
    con.connect();
    con.query("DELETE from tax_record WHERE id="+id, function(err,row,fields){});
    con.end();
    res.end("done");
    
});

/**
 * PUT - Alters the datarecord
 */
app.put("/record/:id", function(req, res){
    var id = req.params.id;
    var amount = req.body.amount;
    var tax = req.body.tax;
    var currency = req.body.currency;
    var total = amount * ((tax + 100) / 100);
    
    con.connect();
    con.query("UPDATE tax_record SET amount="+amount+","
    +"tax="+tax+", "
    +"total="+total+", "
    +"currency='"+currency+"'"        
    +"WHERE id="+id, function(err,row,fields){
        if(err) throw err;
    });
    res.end("done");
    con.end();
    
});

//listens to port 8080
var server = app.listen(8080);


