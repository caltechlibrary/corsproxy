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

// We only only allow connections from whitelisted origins, and we use CORS
// Anywhere's "rate limit" facility to implement it. The value of the
// RATELIMIT environment variable needs to be a list of the form
// "N X host [host ...]", where N and X indicate N requests per X minutes
// is the rate limit for connections that are *not* coming from the listed
// hosts, and the list of hosts are hosts that are not restricted.
// Hosts can be regular expressions of the JavaScript variety.
// For example, "0 1 /.*\.caltech\.edu/" means 0 connections per minute are
// allowed by default (i.e., block connections) except for conections from
// *.caltech.edu.
var rateLimit = parseEnvList(process.env.RATELIMIT);

// List of headers that must be present in HTTP request.
var requiredHeaders = parseEnvList(process.env.REQUIRED_HEADERS);

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
    requireHeader      : requiredHeaders,     // Note different spellings.
    setHeaders         : {"X-Proxied-by": "CORS Proxy"},
    checkRateLimit     : rateLimit,
    redirectSameOrigin : true,
    corsMaxAge         : corsMaxAge,
    helpFile           : helpTextFile
}).listen(port, host, function() {
    console.log('Running CORS Proxy on ' + host + ':' + port);
});
