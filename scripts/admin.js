// Example using HTTP POST operation
var page = require('webpage').create();

var data = 'username=spiderman&password=CrazyPassword!';

var matches_array = []

page.open('http://127.0.0.1:8081/login', 'post', data, status => {
    if (status !== 'success') {
        console.log('Unable to post!');
    } else {
        page.open('http://127.0.0.1:8081/messages', () => {
            var table = page.evaluate(() => document.getElementsByTagName('table')[0]);
            matches_array = table.innerHTML.match(/(http:\/\/[-\/\.\w:0-9\?&]+)/gi);
            console.log(matches_array);
            process();
        });
    }
});

function process() {
    if (matches_array != null && matches_array.length > 0) {
        var res = matches_array[0];
        matches_array.splice(0, 1);
        accessPage(res, process);
    } else {
        phantom.exit();
    }
}

function accessPage(url, process) {
    console.log('Accessing: '+ url);
    page.open(url, () => {
        setTimeout(() => {
            process();
        }, 10000);
    });
}