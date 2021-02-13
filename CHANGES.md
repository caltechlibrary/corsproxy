Change log for REPOSITORY
=========================

Version 1.1.0
-------------

* Merge PR #1 from [Erik Demaine](https://github.com/edemaine) to add support for black lists and white lists.
* Fix [security vulnerability in `http-proxy` module](https://github.com/advisories/GHSA-6x33-pw7p-hmpq) by updating dependency to version 1.18.1.
* Fix out-of-date links in supporting info files.


Version 1.0.1
-------------

The only change in this release is to rename the main JavaScript program file to corsproxy.js, instead of server.js, to make it more obvious and easier to find in a process list.


Version 1.0.0
-------------

This release adds support for HTTPS. The bump in version number also represents the fact that this software has been running without problems on a live server used for internal Caltech Library work, and thus it seems stable enough to call this a proper 1.0.0 release.
