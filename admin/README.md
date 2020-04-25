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


## Additional notes and considerations

The following are notes about some lessons learned.


### The implication of local files on the resulting HTTP `Origin` headers

A frustrating gotcha' in testing Javascript programs embedded in web pages is how web browsers handle CORS requests.  In particular, suppose that you have some combination of Javascript and HTML in a web page (such as for a single-page application, perhaps one using [vue.js](https://vuejs.org)), and the Javascript code makes requests to remote services with data payloads in the requests.  These are the kind of requests that trigger CORS protections and probably the reason why you are interested in this CORS proxy.

Loading a local file is probably the most common way of developing and testing your application.  Here is the catch: some (maybe all) **browsers set the HTTP header `Origin` to `null` if you opened your HTML+JavaScript page from a local file**.  In other words, if the URL in your browser location bar begins with `file://`, HTTP requests generated by JavasCript code in that pager will have `Origin: null`.

`corsproxy`'s `RATELIMIT` setting uses the value of the `Origin` header, so in this situation, the setting will not work or will end up causing the server to block your access.  If you are developing and testing your application by working from a local file, you will need to adjust the `RATELIMIT` setting in the `corsproxy` configuration so that it does not block your access.  Perhaps the easiest way to do this is to rely on the rate limit for other origins.  Set the value to something low but high enough that it does not impede your development workflow.


### The implication of loading your application into a local web server

Suppose that you are clever and work around the `file://` limitation discussed above by starting a local HTTP server, perhaps using the one-line Python command

``` shell
python3 -m http.server
```

and then opening a web browser window on `http://localhost:8000/yourfilename.html`.  Well done, you!  This avoids `Origin: null` in the HTTP headers; unfortunately, the resulting header will then be `Origin: http://localhost:8000`, which is again not a good basis for setting the `RATELIMIT` configuration variable in your CORS proxy server.  As with the local file approach described above, perhaps the easiest way to do this is to rely on the default values (i.e., not use host names).  Set the value to something low but high enough that it does not impede your development workflow.


### Additional protection against abuses of the proxy

The `REQUIRED_HEADER` setting in the configuration file can be used to identify a header that must be present in HTTP requests in order for proxy accesses to succeed.  It should be a single header name, without a value.
For example,

``` shell
REQUIRED_HEADER="x-proxy-cors"
```

The header string will be compared in a case-insensitive manner.
