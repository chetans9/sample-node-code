const express = require('express');
const bodyParser = require('body-parser');
const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const oauth = new OAuth2Server({
    model: require('./model'),
    accessTokenLifetime: 3600,
    allowBearerTokensInQueryString: true,
});

app.post('/oauth/token', (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    oauth
        .token(request, response)
        .then((token) => {
            res.json(token);
        })
        .catch((err) => {
            res.status(err.code || 500).json(err);
        });
});

app.use((req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);

    oauth
        .authenticate(request, response)
        .then((token) => {
            next();
        })
        .catch((err) => {
            res.status(err.code || 500).json(err);
        });
});

app.get('/secure', (req, res) => {
    res.json({ message: 'This is a secure endpoint!' });
});

app.listen(3000, () => {
    console.log('OAuth2 server listening on port 3000');
});
