// ============================================================================
// File name   : server.js
// Description : CORS proxy server main entry point.
// Author(s)   : Michael Hucka <mhucka@caltech.edu>
// Organization: California Institute of Technology
// Date created: 2020-04-23
//
// This is a significantly modified version of server.js from cors-anywhere,
// originally obtained from https://github.com/Rob--W/cors-anywhere
// ============================================================================

// Requirements.
// ............................................................................

var path = require("path");
var cors_anywhere = require('cors-anywhere');


// Environment variables used for run-time configuration.
// ............................................................................
// These are set using a config file associated with our server process
// start/stop/restart script.  More info about the meaning of these variables
// can be found in the CORS Anywhere docs.

// Listen on a specific host via the HOST environment variable.
var host = process.env.HOST || '0.0.0.0';

// Listen on a specific port via the PORT environment variable.
var port = process.env.PORT || 8080;

// If set, only origins listed in this array are permitted.
var originWhitelist = parseEnvList(process.env.WHITELIST);

// Array of blocked origins.  E.g: ['https://bad.foo.com', 'http://bad.foo.com']
var originBlacklist = parseEnvList(process.env.BLACKLIST);

// List of headers that must be present in HTTP request.
var requiredHeaders = parseEnvList(process.env.REQUIRED_HEADER);

// If set, add Access-Control-Max-Age request header with this value (in sec).
var corsMaxAge = process.env.CORS_MAX_AGE;

// File with text to override the default CORS Anywhere help text.
var helpTextFile = path.join(__dirname, 'help-text.txt');


// Main code.
// ............................................................................

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

cors_anywhere.createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: requiredHeaders,     // Note the difference in spellings.
    setHeaders: {"X-Proxied-by": "CORS Proxy"},
    redirectSameOrigin: true,
    corsMaxAge: corsMaxAge,
    helpFile: helpTextFile
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
