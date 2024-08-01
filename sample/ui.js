import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Button, Box, Tabs, Tab, Paper, Grid, Typography, Divider, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import axios from 'axios';

const HttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const AuthMethods = ['No Auth', 'Basic', 'Bearer', 'OAuth2'];
const GrantTypes = ['Authorization Code', 'Client Credentials', 'Password Credentials', 'Implicit'];

const PostmanLikeUI = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [tabIndex, setTabIndex] = useState(0);
  const [authMethod, setAuthMethod] = useState('No Auth');
  const [basicAuth, setBasicAuth] = useState({ username: '', password: '' });
  const [bearerToken, setBearerToken] = useState('');
  const [oauth2, setOauth2] = useState({
    grantType: 'Authorization Code',
    authUrl: '',
    tokenUrl: '',
    clientId: '',
    clientSecret: '',
    scope: '',
    username: '',
    password: '',
    accessToken: ''
  });
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [response, setResponse] = useState(null);
  const [preRequestScript, setPreRequestScript] = useState('');
  const [testScript, setTestScript] = useState('');

  useEffect(() => {
    if (authMethod === 'Basic') {
      const encodedCredentials = btoa(`${basicAuth.username}:${basicAuth.password}`);
      setHeaders([{ key: 'Authorization', value: `Basic ${encodedCredentials}` }]);
    } else if (authMethod === 'Bearer') {
      setHeaders([{ key: 'Authorization', value: `Bearer ${bearerToken}` }]);
    } else if (authMethod === 'OAuth2' && oauth2.accessToken) {
      setHeaders([{ key: 'Authorization', value: `Bearer ${oauth2.accessToken}` }]);
    } else {
      setHeaders([{ key: '', value: '' }]);
    }
  }, [authMethod, basicAuth, bearerToken, oauth2]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const generateOAuth2Token = async () => {
    try {
      const response = await axios.post(oauth2.tokenUrl, null, {
        params: {
          grant_type: oauth2.grantType === 'Authorization Code' ? 'authorization_code' : 
                      oauth2.grantType === 'Client Credentials' ? 'client_credentials' : 
                      oauth2.grantType === 'Password Credentials' ? 'password' : 
                      'implicit',
          client_id: oauth2.clientId,
          client_secret: oauth2.clientSecret,
          scope: oauth2.scope,
          code: oauth2.grantType === 'Authorization Code' ? oauth2.authCode : undefined,
          username: oauth2.grantType === 'Password Credentials' ? oauth2.username : undefined,
          password: oauth2.grantType === 'Password Credentials' ? oauth2.password : undefined,
        }
      });
      const accessToken = response.data.access_token;
      setOauth2({ ...oauth2, accessToken });
    } catch (error) {
      console.error('Error generating OAuth2 token:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (authMethod === 'OAuth2' && !oauth2.accessToken) {
        await generateOAuth2Token();
      }

      const axiosConfig = {
        method,
        url,
        headers: headers.reduce((acc, header) => {
          if (header.key) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {})
      };

      const response = await axios(axiosConfig);
      setResponse(response);
    } catch (error) {
      console.error('Error making request:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          select
          label="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ mr: 2, width: '150px' }}
        >
          {HttpMethods.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{ flexGrow: 1, mr: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Send
        </Button>
      </Box>
      <Paper>
        <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Authorization" />
          <Tab label="Headers" />
          <Tab label="Scripts" />
        </Tabs>
        {tabIndex === 0 && (
          <Box p={2}>
            <TextField
              select
              label="Auth Method"
              value={authMethod}
              onChange={(e) => setAuthMethod(e.target.value)}
              sx={{ width: '300px' }}
            >
              {AuthMethods.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            {authMethod === 'Basic' && (
              <Box mt={2}>
                <TextField
                  label="Username"
                  variant="outlined"
                  value={basicAuth.username}
                  onChange={(e) => setBasicAuth({ ...basicAuth, username: e.target.value })}
                  sx={{ mr: 2 }}
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  value={basicAuth.password}
                  onChange={(e) => setBasicAuth({ ...basicAuth, password: e.target.value })}
                  type="password"
                />
              </Box>
            )}
            {authMethod === 'Bearer' && (
              <Box mt={2}>
                <TextField
                  label="Token"
                  variant="outlined"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  fullWidth
                />
              </Box>
            )}
            {authMethod === 'OAuth2' && (
              <Box mt={2}>
                <TextField
                  select
                  label="Grant Type"
                  value={oauth2.grantType}
                  onChange={(e) => setOauth2({ ...oauth2, grantType: e.target.value })}
                  sx={{ width: '300px', mb: 2 }}
                >
                  {GrantTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                {['Authorization Code', 'Password Credentials', 'Implicit'].includes(oauth2.grantType) && (
                  <TextField
                    label="Auth URL"
                    variant="outlined"
                    value={oauth2.authUrl}
                    onChange={(e) => setOauth2({ ...oauth2, authUrl: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                )}
                <TextField
                  label="Token URL"
                  variant="outlined"
                  value={oauth2.tokenUrl}
                  onChange={(e) => setOauth2({ ...oauth2, tokenUrl: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Client ID"
                  variant="outlined"
                  value={oauth2.clientId}
                  onChange={(e) => setOauth2({ ...oauth2, clientId: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Client Secret"
                  variant="outlined"
                  value={oauth2.clientSecret}
                  onChange={(e) => setOauth2({ ...oauth2, clientSecret: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                {oauth2.grantType === 'Password Credentials' && (
                  <>
                    <TextField
                      label="Username"
                      variant="outlined"
                      value={oauth2.username}
                      onChange={(e) => setOauth2({ ...oauth2, username: e.target.value })}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Password"
                      variant="outlined"
                      value={oauth2.password}
                      onChange={(e) => setOauth2({ ...oauth2, password: e.target.value })}
                      type="password"
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
                <TextField
                  label="Scope"
                  variant="outlined"
                  value={oauth2.scope}
                  onChange={(e) => setOauth2({ ...oauth2, scope: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary" onClick={generateOAuth2Token}>
                  Generate Token
                </Button>
              </Box>
            )}
          </Box>
        )}
        {tabIndex === 1 && (
          <Box p={2}>
            <Grid container spacing={2}>
              {headers.map((header, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={5}>
                    <TextField
                      label="Name"
                      variant="outlined"
                      value={header.key}
                      onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="Value"
                      variant="outlined"
                      value={header.value}
                      onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={2}>
                <IconButton onClick={addHeader} color="primary">
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        )}
        {tabIndex === 2 && (
          <Box p={2}>
            <Typography variant="h6">Pre-request Script</Typography>
            <MonacoEditor
              height="200px"
              defaultLanguage="javascript"
              defaultValue={preRequestScript}
              onChange={(value) => setPreRequestScript(value)}
              theme="vs-light"
            />
            <Typography variant="h6" mt={2}>Test Script</Typography>
            <MonacoEditor
              height="200px"
              defaultLanguage="javascript"
              defaultValue={testScript}
              onChange={(value) => setTestScript(value)}
              theme="vs-light"
            />
          </Box>
        )}
      </Paper>
      {response && (
        <Box mt={4} p={2} component={Paper}>
          <Typography variant="h6">Response</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1">
            <strong>Status:</strong> {response.status} {response.statusText}
          </Typography>
          <Typography variant="body1">
            <strong>Headers:</strong>
          </Typography>
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', p: 1, bgcolor: '#f5f5f5' }}>
            {JSON.stringify(response.headers, null, 2)}
          </Box>
          <Typography variant="body1">
            <strong>Data:</strong>
          </Typography>
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', p: 1, bgcolor: '#f5f5f5' }}>
            {JSON.stringify(response.data, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PostmanLikeUI;
