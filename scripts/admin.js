// Example using HTTP POST operation
var page = require('webpage').create(),
    server = 'http://127.0.0.1:8081/login',
    data = 'username=admin&password=password';

var matches_array = []

page.open(server, 'post', data, function (status) {
    if (status !== 'success') {
        console.log('Unable to post!');
    } else {
        page.open('http://127.0.0.1:8081/messages', function (){
            var table = page.evaluate(function () {
                return document.getElementsByTagName('table')[0];
            });
            // console.log(table);
            matches_array = table.innerHTML.match(/(http:\/\/[-\/\.\w:0-9\?&]+)/gi);
            console.log(matches_array);
            if (matches_array.length > 0) {
                sleep(4000);
                process();
            }

            // phantom.exit(); ?????
        });
    }
});

function process() {
    if (matches_array.length > 0) {
        var res = matches_array[0];
        matches_array.splice(0, 1);
        accessPage(res, process);
    } else {
        phantom.exit();
    }
}

function accessPage(url, process) {
    console.log('Accessing: '+ url);
    page.open(url, function (){
        process();
    });
}


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
       if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

