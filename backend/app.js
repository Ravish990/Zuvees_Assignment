const http = require(http);

const server = http.CreateServer((req, res) => {
    if (req.method === 'GET'&& req.url === '/admin') {
        // we will get admin data
    }

    else if(req.method === 'GET'&& req.url === '/user') {
        // we will get user data
    }

    else if (req.method === 'GET' && req.url === '/rider') {
        // we will get rider data
    }
    else if (req.method === 'POST' && req.url === '/admin') {
        // admin can post data to the web  
    }
   else if (req.method === 'PUT' && req.url === '/admin') {
    // admin can update the data on the web
   }
})

