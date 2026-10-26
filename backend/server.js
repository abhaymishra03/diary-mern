const app = require("./src/app");
const {PORT} = require("./src/configs/config");
const {connectDB} = require("./src/configs/db");
const dns = require("dns");

dns.setServers(["8.8.8.8"]);



connectDB().then(
    app.listen(PORT,()=>{

    console.log("Server is running on the port " + process.env.PORT);

})
);










