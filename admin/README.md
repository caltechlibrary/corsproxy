Installation and setup for CentOS/RHEL-flavored Linux
=====================================================

## Detailed installation and configuration steps.

Here are the steps I took to install and set up this service on a CentOS 7.7 system.  (Note: all of the following commands are performed as root.)

### &#9312; Copy and install the files

1. Create a user account for the service on the host system.  (E.g., `corsproxy`.) On a CentOS 7 system, this can be done using the following command; note the use of the `-k` argument to prevent copying default skeleton files to the home directory, because we will fill the home directory with something else in the next step.

    ``` shell
    useradd -r -m -c "CORS proxy server" -k /dev/null corsproxy
    ```

2. Clone this git repository into the account directory on the host system:

    ``` shell
    cd /home/corsproxy
    git clone --recursive https://github.com/caltechlibrary/corsproxy.git .
    ```

3. Install the NodeJS dependencies in the `server` subdirectory:

    ``` shell
    cd /home/corsproxy/server
    npm install cors-anywhere
    ```

4. Change the user and group of everything to match the proxy user:

    ``` shell
    cd /home/corsproxy
    chown -R corsproxy:corsproxy .
    ```

5. Create a directory in `/var/run` where the proxy user can write the process id file:

    ``` shell
    mkdir /var/run/corsproxy
    chown corsproxy:corsproxy /var/run/corsproxy
    ```

6. Install the `rsyslogd` configuration file, and tell `rsyslogd` to load it:

    ``` shell
    cd /home/corsproxy/admin/system
    cp corsproxy-rsyslog.conf /etc/rsyslog.d/corsproxy.conf
    mkdir /var/log/corsproxy
    chown corsproxy:corsproxy /var/log/corsproxy
    systemctl restart rsyslog
    ```

7. Install the `systemd` script and tell `systemd` about it:

    ``` shell
    cp corsproxy.service /etc/systemd/system/
    systemctl daemon-reload
    ```

8. Install the `logrotate` script:

    ``` shell
    cp corsproxy-logrotate.txt /etc/logrotate.d/corsproxy
    ```


### &#9313; Configure the proxy

Configure the CORS proxy server by copying the template configuration file and editing it to set the variable values as needed for your installation.

   ``` shell
   cd /home/corsproxy/admin
   cp config.sh.template config.sh
   # edit config.sh
   ```

The value of the variables `RATELIMIT` and `REQUIRED_HEADER` are the most important to set in order to help prevent abuse of the service.  Information about them can be found in the `config.sh.template` file.  Note: the way that the restrictions on origins works is currently limited, in that hosts are restricted based on the value of the `Origin` header in the HTTP request, _not the actual host or IP address_ of source of the request.  To block hosts by IP address ranges, configure your system's firewall appropriately (see next steps).  See the discussion later below for more on this topic.


### &#9314; Configure your firewall

Check your firewall settings and make sure they permit connections to the port you configured.  Specific instructions for doing this cannot be given here, as they depend very much on your firewall scheme.  Also make sure to _save_ this new configuration (the _how_ again depends on your particular system), so that the new firewall configuration persists across reboots of your computer.


### &#9315; Start the service

Now, at this point, everything is in place, and what remains is to tell the operating system to install the new service and start it up.  Before going further, it may be helpful to open another window and do a `tail -f /var/log/messages` to keep an eye for system messages.

1. Enable the new service:

    ``` shell
    systemctl enable corsproxy.service
    ```

2. Start the service:

    ``` shell
    systemctl start corsproxy.service
    ```

3. Check the status:

    ``` shell
    systemctl status corsproxy.service
    ```

If all goes well, a `node` process should be running under the user credentials of `corsproxy`.  Log output should also appear in a new log file located at `/var/log/corsproxy/corsproxy.log`, but it will also get printed to `/var/log/messages`.  If log output is _only_ printed in `/var/log/messages`, something has gone wrong.


### &#9316; Check that the service is running

Here are some suggested steps to take to verify that the service is running:

1. On the host computer running the proxy, after starting the proxy service, check that the proxy process is running (look for a `node` process owned by user `corsproxy` in the output of `ps auxww`) and also check that something is listening on the desired port (for example, look at the output of `netstat -at`).
2. Next, open a new terminal window, `ssh` into the server running the proxy, and run `tail -f` on `/var/log/messages`.  Do the same for `/var/log/corsproxy/corsproxy.log` in another window.
3. Now, try to connect to the proxy's landing page from a browser on your local computer, by visiting the top-level page on the host and port.  For example, if your proxy is running on port 8080 of the computer responding to `x.org`, the proxy page would be `http://x.org:8080`.  This landing page is not limited by the setting of `RATELIMIT` in the configuration file, so if you cannot access it, something else is wrong &ndash; perhaps the firewall settings on the server prevent access to that port from the outside.


## Additional notes and considerations

The following are notes about some lessons learned.


### The implication of local files on the resulting HTTP `Origin` headers

A frustrating gotcha in testing JavaScript programs embedded in web pages is how web browsers handle CORS requests.  In particular, suppose that you have some combination of JavaScript and HTML in a web page (such as for a single-page application, perhaps one using [vue.js](https://vuejs.org)), and the JavaScript code makes requests to remote services with data payloads in the requests.  These are the kind of requests that trigger CORS protections and probably the reason why you are interested in this CORS proxy.

Loading a local file is probably the most common way of testing your application during development.  Here is the catch: **browsers set the HTTP header `Origin` to `null` when HTTP requests come from HTML+JavaScript pages loaded from a local file**.  In other words, if the URL in your browser location bar begins with `file://`, HTTP requests generated by JavaScript code in that pager will have `Origin: null` when they reach the CORS proxy server.  Since `corsproxy`'s `RATELIMIT` setting uses the value of the `Origin` header, the `RATELIMIT` setting will not work in this situation or will end up causing the server to block your access.

Here are some suggestions for working around this:

* One approach is to set up a private copy of the proxy running on a computer that you control; then you can configure the firewall on the host computer to block access to the proxy port from any source other than your client computer.
* If you are the only one using the proxy during your development work, one solution is to adjust the firewall settings on the server running `corsproxy` to block access from anything other than your client computer.
* Another approach, if you need to share the proxy server with other people or can't change the firewall for some reason, is to adjust the `RATELIMIT` setting in the `corsproxy` configuration so that it does not completely block access to unrecognized hosts.  One way to do this is to rely on the rate limit for other origins (i.e., those controlled by the first two numbers in the `RATELIMIT` value).  Set it to something high enough that it does not impede your development workflow, but still low enough to prevent abuse by wannabe hackers doing port scans on your organization's computers.


### The implication of loading your application into a local web server

Suppose that you are clever and work around the `file://` limitation discussed above by starting a local HTTP server, perhaps using the one-line Python command

``` shell
python3 -m http.server
```

and then opening a web browser window on `http://localhost:8000/yourfilename.html`.  Well done!  This avoids `Origin: null` in the HTTP headers.  However, the resulting `Origin` header will then have the value `http://localhost:8000`, which is again not a good basis for setting the `RATELIMIT` configuration variable in your CORS proxy server.  As with the local file approach described above, solutions include adjusting the firewall configuration on the host computer to block anything other than the IP address of your client, or to set `RATELIMIT` such that the default values (i.e., from hosts without designated `Origin` values) allow _some_ access from any client.


### Additional protection against abuses of the proxy

The `REQUIRED_HEADER` setting in the configuration file can be used to identify a header that must be present in HTTP requests in order for proxy accesses to succeed.  It should be a single header name, without a value.
For example,

``` shell
REQUIRED_HEADER="x-proxy-cors"
```

The header string will be compared in a case-insensitive manner.  Proxy requests that lack this HTTP header will be rejected.  Add the header to the requests made by the network code in the client software you control.

It should be clear that this is a kind of _security by obscurity_ approach. It is meant to limit proxying to software only you control.  It has benefit only as long as you do not advertise the fact that your proxy looks for the header. (And note that revealing the nature of the header can happen accidentally via the _client_ software that you write.  Do not do things like hard-wire the header value into open-source software you put on GitHub, where sooner or later someone will find it.)
