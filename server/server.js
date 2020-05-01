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

var fs             = require('fs');
var path           = require("path");
var cors_anywhere  = require('./node_modules/cors-anywhere/lib/cors-anywhere');
var checkRateLimit = require('./node_modules/cors-anywhere/lib/rate-limit');


// Environment variables used for run-time configuration.
// ............................................................................
// These are set using a config file associated with our server process
// start/stop/restart script.  More info about the meaning of these variables
// can be found in the CORS Anywhere docs.

// Listen on a specific host via the HOST environment variable.
var host = process.env.HOST || '0.0.0.0';

// Listen on a specific port via the PORT environment variable.
var port = process.env.PORT || 8080;

// HTTPS key file
var key_file = process.env.KEY_FILE || '';

// HTTPS certificate file
var cert_file = process.env.CERT_FILE || '';

// The rate limit sets both the default number of connections allowed from
// unlisted hosts, and a list of hosts that are allowed unlimited connections.
// The value of RATELIMIT must be a list of the form "N X host [host ...]",
// where the first 2 numbers indicate the rate limit for unknown origins, and
// the list of hosts is the whitelist (hosts without limits).  The numbers N
// and X indicate N requests per X minutes for connections that are *not*
// coming from the listed hosts, Hosts can be regular expressions of the
// JavaScript variety, set off by forward slashes.  For example, "0 1
// /.*\.caltech\.edu/" means 0 connections per minute are allowed by default,
// except for conections from *.caltech.edu.  Note that this only affects
// actual CORS proxying; connections to the help page are *not* affected by
// this at all, and are unrestricted.  (Corrolary: don't use connections to
// the help page to judge whether this setting is working as desired.)
var rateLimit = process.env.RATELIMIT || '30 1';

// Header that must be present in HTTP request in order for corsproxy to
// accept it.
var requiredHeader = process.env.REQUIRED_HEADER || '';

// File with text to override the default CORS Anywhere help text.
var helpTextFile = path.join(__dirname, 'help-text.txt');


// Main code.
// ............................................................................

process.on('SIGTERM', () => {
    console.log('Received SIGTERM; exiting.');
    process.exit(0);
});

if (key_file && cert_file) {
    console.log('Using HTTPS certificate', cert_file);
    httpsOptions = {
        key: fs.readFileSync(key_file),
        cert: fs.readFileSync(cert_file)
    };
} else
    httpsOptions = {};


try {
    cors_anywhere.createServer({
        requireHeader      : requiredHeader,
        setHeaders         : {"X-Proxied-by": "CORS Proxy"},
        checkRateLimit     : checkRateLimit(rateLimit),
        redirectSameOrigin : true,
        httpsOptions       : httpsOptions,
        helpFile           : helpTextFile,
    }).listen(port, host, function() {
        console.log('Running CORS Proxy on ' + host + ':' + port);
        console.log('Ratelimit configuration: "' + rateLimit + '"');
        console.log('Required header: ' + requiredHeader);
    });
} catch (err) {
    console.log(err);
    process.exit(1);
}
