Setup procedure for CentOS/RHEL-flavored Linux
==============================================

Here are the steps I took to install and set up this service on a CentOS 7.7 system.  (Note: all of the following commands are performed as root.)

1. Create a user account for the service on the host system.  (E.g., `corsproxy`.) On a CentOS 7 system, this can be done using the following command; note the use of the `-k` argument to prevent copying default skeleton files to the home directory, because later steps will fill the home directory with something else.

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

Next, configure the CORS proxy server by copying the template configuration file and editing it to set the variable values as needed for your installation.

   ``` shell
   cd /home/corsproxy/admin
   cp config.sh.template config.sh
   # edit config.sh
   ```

Finally, check your firewall settings and make sure they permit connections to the port you configured.  (Specific instructions for doing this cannot be given here, as they depend very much on your firewall scheme.)  Also make sure to _save_ this new configuration (the _how_ again depends on your particular system), so that the new firewall configuration persists across reboots of your computer.

Now, at this point, everything is in place, and what remains is to tell the operating system to install the new service and start it up.

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

Log output should appear in `/var/log/corsproxy/corsproxy.log`.
