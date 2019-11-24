var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;

    else {
        console.log("Connected id: " + connection.threadId);
    }

    runApp();

});

function runApp(){
    inquirer
    .prompt({
        name:"running",
        type:"list",
        message:"Please select one of the choices",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            "EXIT"
        ]
    }).then (function (answerForChoices){
      switch (answerForChoices.running) {
          case "View Products for Sale":
              productForSale();
              break;
         case "View Low Inventory":
             displayLowInventory();
             break;
        case "Add to Inventory":
             addToInventory();
             break;
        case "Add New Product":
            addNewProduct();
            break;
        case "EXIT":
            connection.end();
            break;


      }
    })
}

function displayProducts(){

    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;
        // console.log("Inventory List");
        var table = new Table({
            head: ["Item Id", "Product Name", "Price", "Quantity"],
            colWidths: [15, 20, 18, 10],
            colAligns: ["center", "left", "right", "right"]
        });
    
   
        for(var i =0; i<res.length; i++){
            table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);
    
            console.log(table.toString());
        }
       runApp();
    });

    
};

function productForSale(){
   connection.query("SELECT * FROm products WHERE stock_quantity > 0 ", function(err,res){
       if (err) throw err;
       console.log("Our Store Inventory");

       var table = new Table({
        head: ["Item Id", "Product Name", "Price", "Quantity"],
        colWidths: [15, 20, 18, 10],
        colAligns: ["center", "left", "right", "right"]
    });

    for(var i =0; i<res.length; i++){
        table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);

        console.log(table.toString());
    }
    runApp();
   }) 
};

function displayLowInventory(){
    connection.query("SELECT * FROM products WHERE stock_quantity <=4", function(err, res){
        if (err) throw err;
        console.log("Display Low Inventory!!! You MUST BUY NEW ITEMS!!! ");

        var table = new Table({
            head: ["Item Id", "Product Name", "Price", "Quantity"],
            colWidths: [15, 20, 18, 10],
            colAligns: ["center", "left", "right", "right"]
        });
    
        for(var i =0; i < res.length; i++){
            table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);
    
            console.log(table.toString());
        }
        runApp();
    })
   
};

function addToInventory(){
    inquirer
    .prompt({
        name: "addInventory",
        type: "input",
        message: "What is the ProductID number? ",
        default: Number
    }).then(function(answer){
        var chosenItem = answer.addInventory;
        connection.query("SELECT * FROM products WHERE item_id=?", chosenItem, function(err,res){
            if (err) throw err;
            if(res.length === 0){
                console.log("Sorry!!! We Do not have this Product");
                addToInventory();
            } else {
                inquirer.prompt({
                    name: "units",
                    type: "input",
                    message:"How Many Unit(s) would you like to add to Inventory",
                    default: Number
                }).then(function(answer2){
                    var chosenUnit = answer2.units;
                    if(chosenItem <=0){
                        console.log("Please enter valid number (Bigger than 0)");
                        addToInventory();
                    } else{
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id =?", [chosenItem, res[0].item_id ],
                        function(err, resUpdate){
                            if(err) throw err;
                            // console.log("Unit(s) have been UPDATED");
                            console.log(chosenItem + "unit(s) ADDED to "+ res[0].product_name);
                            // addToInventory();
                           
                        })
                        
                    }
                    runApp();
                })
            }
        })
       
    })
    
}

function addNewProduct(){
    inquirer.prompt([
        {
        name:"productName",
        type:"input",
        message:"What is the Product Name would you like to Add to Inventory?"
        },
        {
            name:"department",
            type:"input",
            message:"What is the Department Name?"
        },
        {
            name:"price",
            type:"input",
            message:"What is the Price of this Item?"
        },
        {
            name:"quantity",
            type:"input",
            message:"How many unit(s) would you like to add to Inventory?",
            default: Number
         }

    ]).then (function(data){
        var productName = data.productName;
        var departmentName = data.department_name;
        var productPrice = data.price;
        var stock = data.stock_quantity;

        connection.query("INSERT INTO products SET?",
        {
            product_name: productName,
            department_name: departmentName,
            price:productPrice,
            stock_quantity: stock
        },
        function(err, ){
            if (err) throw err;
            console.log("New Item " +productName+  " have been added to Inventory" );
            runApp();
        });
        
    })

    
}



