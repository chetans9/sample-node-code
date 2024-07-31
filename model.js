const clients = [
    {
        id: 'chetan',
        secret: 'chetan123',
        grants: ['client_credentials'],
    },
];

const tokens = [];

module.exports = {
    getClient: (clientId, clientSecret, callback) => {
        const client = clients.find(
            (client) => client.id === clientId && client.secret === clientSecret
        );
        callback(null, client);
    },
    saveToken: (token, client, user, callback) => {
        const accessToken = {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
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
    // The following methods are required by oauth2-server but not used in client_credentials grant
    getAuthorizationCode: (authorizationCode, callback) => callback(null, false),
    saveAuthorizationCode: (code, client, user, callback) => callback(null),
    revokeAuthorizationCode: (authorizationCode, callback) => callback(null),
    getRefreshToken: (refreshToken, callback) => callback(null, false),
    revokeToken: (token, callback) => callback(null, true),
    verifyScope: (token, scope, callback) => callback(null, true),
};
