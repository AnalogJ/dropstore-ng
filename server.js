var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(process.env.PORT||8080);