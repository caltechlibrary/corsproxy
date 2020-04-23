#! /bin/bash
## ============================================================================
## File name   : server.sh
## Description : server control script for cors-proxy
## Author(s)   : Michael Hucka <mhucka@caltech.edu>
## Organization: California Institute of Technology
## Date created: 2020-04-23
## ============================================================================

# Preliminary definitions
# .............................................................................

# This definition is used in a pipe command in the main section.
# Don't merge this with the next function definition.
LOG="logger -s -t corsproxy -p daemon.info"

log() {
    $LOG $1 >&2
}


# Read configuration file and set defaults.
# .............................................................................

if [[ -e config.sh ]]; then
    log "Reading configuration file"
    source config.sh
else
    # Default values in case config.sh is missing.
    PID_FILE=/tmp/corsproxy.pid
    RESTART_PAUSE=10
fi


# Main code.
# .............................................................................

case "$1" in
    start)
        log "Starting server process from directory `pwd`"
        # Problem: we need the PID from the first process in the pipe, but if
        # you use $! you'll get the PID of the last process in the pipe.
        # Solution: writes the PID to file descriptor 3, so that it can be
        # read from there on the following line.  Genius idea posted by user
        # John Kugelman, 2014-07-16, https://stackoverflow.com/a/3786955/743730
        TMPFILE=$(mktemp /tmp/corsproxy.XXXXXX)
        trap 'rm -f -- "$TMPFILE"' INT TERM HUP EXIT
        ( node ../server/server.js 2>&1 & echo $! >&3) 3>$TMPFILE | $LOG & >&2
        sleep 2
        PID=$(<$TMPFILE)
        if [[ -z $PID ]]; then
            log "Failed to start server process" >&2
            exit 1
        else
            echo $PID > $PID_FILE
            log "Server started successfully with PID $PID." >&2
        fi
        exit 0
        ;;

    stop)
        if [[ ! -e $PID_FILE ]]; then
            log "PID file $PID_FILE does not exist." >&2
            exit 2
        fi
        PID=$(<$PID_FILE)
        log "Sending kill signal to process $PID" >&2
        if ! kill -TERM  $PID> /dev/null 2>&1 ; then
            # We don't want to start killing processes by name, because the
            # user might have more than one server running.  Just give up.
            if ps -p $PID > /dev/null 2>&1 ; then
                log "Could not terminate process $PID." >&2
                exit 1
            else
                log "Process $PID no longer exists." >&2
                exit 1
            fi
        else
            log "Process $PID killed." >&2
            exit 0
        fi
        ;;

    restart)
        $0 stop
        if [[ $? -eq 0 ]]; then
            log "Pausing for $RESTART_PAUSE s." >&2
            sleep $RESTART_PAUSE
        fi
        log "Restarting server." >&2
        $0 start
        exit $?
        ;;

    status)
        if [[ ! -e $PID_FILE ]]; then
            log "PID file $PID_FILE does not exist." >&2
            exit 2
        fi
        PID=`cat $PID_FILE`
        if ps -p $PID > /dev/null 2>&1 ; then
            log "Process $PID running." >&2
            exit 0
        else
            log "Process $PID no longer exists." >&2
            exit 1
        fi
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status}." >&2
        exit 3
        ;;
esac
