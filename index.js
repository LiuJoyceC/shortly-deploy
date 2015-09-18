var app = require('./server.js');

var port = process.env.PORT || 4568;

// console.log(typeof port);
// console.log(app.listen);

app.listen(port);

console.log('Server now listening on port ' + port);

