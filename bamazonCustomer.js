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

});

function displayAllItems() {
    var sqlQuery = "SELECT * FROM products";
    connection.query(sqlQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(JSON.stringify(res[i], null, 2));
            var table = new Table({
                head: ["Item Id", "Product Name", "Price", "Quantity"],
                colWidths: [15, 20, 18, 10],
                colAligns: ["center", "left", "right", "right"]


            })
        }
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);
        }
        console.log(table.toString());
        productID();

    });


}

function productID() {
    inquirer.prompt({
        name: "item_id",
        type: "input",
        message: "Please enter Product ID would you like to buy",
        filter: Number
    }).then(function (answer) {
        var chosenID = answer.item_id;
        var querySql2 = "SELECT * FROM products WHERE item_id=?";
        connection.query(querySql2, chosenID, function (err, res) {
            if (err) throw err;
            if (res.length === 0) {
                console.log("Please Enter Valid Product ID");

                productID();
            } else {
                inquirer
                    .prompt({
                        name: "howMany",
                        type: "input",
                        message: "How Many Unit would you like to buy?",
                        filter: Number
                    }).then(function (answer2) {
                        var chosenQuantity = answer2.howMany;
                        if (chosenQuantity > res[0].stock_quantity) {
                            console.log("We Are Sorry!!! Please Enter different unit(s)");
                            productID();
                        } else {
                            console.log(res[0].product_name + " purchased");
                            console.log(chosenQuantity + " Unit(s) @ $" + res[0].price);

                            var newQuantity = res[0].stock_quantity - chosenQuantity;
                            connection.query(
                                "UPDATE products SET stock_quantity = ? WHERE item_id =?", [newQuantity, res[0].item_id],
                                function (err, resUpdate) {
                                    if (err) throw err;
                                    console.log(" Your Order has been Processed!!! Thank you for your shopping");
                                    connection.end();
                                }
                            )
                        }

                    })
            }

        })

    })
}

displayAllItems();