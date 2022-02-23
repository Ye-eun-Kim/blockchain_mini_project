let express = require("express");
let app = express(); //express를 이용하여 서버를 돌릴 예정
let router = require("./router/main")(app);
let port = process.env.PORT || 3000; //port 번호 할당
let hostname = "localhost";

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));

var server = app.listen(port, function () {
  console.log(`
        Server is running at http://${hostname}:${port}/ 
        Server hostname ${hostname} is listening on port ${port}!
    `);
});
