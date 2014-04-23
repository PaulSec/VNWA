// Example using HTTP POST operation

var page = require('webpage').create(),
    server = 'http://127.0.0.1:8081/login',
    data = 'username=admin&password=password';

page.open(server, 'post', data, function (status) {
    if (status !== 'success') {
        console.log('Unable to post!');
    } else {
        // console.log(page.content);
        page.open('http://127.0.0.1:8081/messages', function (){
            console.log(page.content);
            phantom.exit();
        });
    }
});

