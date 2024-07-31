const clients = [
    {
        id: 'client_id',
        secret: 'client_secret',
        grants: ['authorization_code', 'client_credentials'],
        redirectUris: ['http://localhost:3000/callback'],
    },
];

const tokens = [];
const authorizationCodes = [];

module.exports = {
    getClient: (clientId, clientSecret, callback) => {

        console.log("clientSecret", clientSecret)
        
        const client = clients.find(
            (client) => client.id === clientId && client.secret === clientSecret
        );

        console.log("client", client)
        callback(null, client);
    },
    saveToken: (token, client, user, callback) => {
        const accessToken = {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            client: client,
            user: user,
        };
        tokens.push(accessToken);
        callback(null, accessToken);
    },
    getAccessToken: (bearerToken, callback) => {
        const token = tokens.find((token) => token.accessToken === bearerToken);
        callback(null, token);
    },
    getRefreshToken: (refreshToken, callback) => {
        const token = tokens.find((token) => token.refreshToken === refreshToken);
        callback(null, token);
    },
    revokeToken: (token, callback) => {
        const tokenIndex = tokens.findIndex((t) => t.refreshToken === token.refreshToken);
        if (tokenIndex !== -1) {
            tokens.splice(tokenIndex, 1);
        }
        callback(null, true);
    },
    getUser: (username, password, callback) => {
        const user = { id: 'user_id', username: username }; // Replace with real user lookup
        callback(null, user);
    },
    saveAuthorizationCode: (code, client, user, callback) => {
        const authCode = {
            authorizationCode: code.authorizationCode,
            expiresAt: code.expiresAt,
            redirectUri: code.redirectUri,
            client: client,
            user: user,
        };
        authorizationCodes.push(authCode);
        callback(null, authCode);
    },
    getAuthorizationCode: (authorizationCode, callback) => {
        const code = authorizationCodes.find((code) => code.authorizationCode === authorizationCode);
        callback(null, code);
    },
    revokeAuthorizationCode: (authorizationCode, callback) => {
        const codeIndex = authorizationCodes.findIndex((code) => code.authorizationCode === authorizationCode.authorizationCode);
        if (codeIndex !== -1) {
            authorizationCodes.splice(codeIndex, 1);
        }
        callback(null, true);
    },
    verifyScope: (token, scope, callback) => {
        callback(null, true);
    },
    getUserFromClient: (client, callback) => {
        const foundClient = clients.find(
            (storedClient) => storedClient.id === client.id && storedClient.secret === client.secret
        );
        if (foundClient) {
            callback(null, {});
        } else {
            callback(null, false);
        }
    },
};
