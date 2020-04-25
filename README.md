Corsproxy<img width="18%" align="right" src=".graphics/corsproxy-logo.svg">
=========

This is a a simple CORS proxy server suitable to install as a system service on Linux servers.  It uses [CORS Anywhere](https://github.com/Rob--W/cors-anywhere).

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg?style=flat-square)](https://choosealicense.com/licenses/bsd-3-clause)
[![Latest release](https://img.shields.io/github/v/release/caltechlibrary/corsproxy.svg?style=flat-square&color=b44e88)](https://github.com/caltechlibrary/corsproxy/releases)


Table of contents
-----------------

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#usage)
* [Known issues and limitations](#known-issues-and-limitations)
* [Getting help](#getting-help)
* [License](#license)
* [Authors and history](#authors-and-history)
* [Acknowledgments](#authors-and-acknowledgments)


Introduction
------------

The development of web-based applications, particularly single-page applications written using JavaScript, can be stymied by problems involving [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) security measures enforced by web browsers.  One problem happens when a network server providing a remote API service does not support CORS: if the nature of the network API requires nontrivial types of operations (e.g., HTTP POST requests that contain data payloads), the web browser running the single-page application will enforce CORS requirements, and the API requests will fail when the server does not respond correctly.

A simple solution to this problem is to insert an intermediate proxy server between the web application and the network service.  An example of such a proxy server is [CORS Anywhere](https://cors-anywhere.herokuapp.com/), an open-source proxy server that runs in NodeJS.  CORS&nbsp;Anywhere works well, and only needs some additional elements to make it suitable for running as a standard system service on a Linux server.  This project (Corsproxy) aims to provide those additional elements.  Corsproxy also tries to simplify some of the configuration steps in using CORS Anywhere.


Installation
------------

Detailed installation and configuration instructions are given in the file [admin/README](admin/README).


Usage
-----

Corsproxy is meant to be started and stopped using standard system tools such as `systemctl` on CentOS.  Detailed instructions are given in the file [admin/README](admin/README).


Known issues and limitations
----------------------------

* The way that host restrictions/rate limits are implemented is based primarily on the Origin header in HTTP requests.  This works and has some security advantages, but makes it more difficult to configure in some other situations.
* Whitelists and blacklists are supported by the underlying CORS Anywhere software but no interface is exposed in the basic configuration scheme provided by Corsproxy.  This was done because the rate limit mechanism can subsume the others, but it may prove to be a limitation for some users. 


Getting help
------------

If you find an issue, please submit it in [the GitHub issue tracker](https://github.com/caltechlibrary/corsproxy/issues) for this repository.


License
-------

Software produced by the Caltech Library is Copyright (C) 2020, Caltech.  This software is freely distributed under a BSD/MIT type license.  Please see the [LICENSE](LICENSE) file for more information.


Authors and history
---------------------------

Michael Hucka developed the first version of Corsproxy after running into problems during the implementation of a Vue.js based application that had to interact with a non-CORS enabled network service.


Acknowledgments
---------------

Corsproxy makes use of [CORS Anywhere](https://github.com/Rob--W/cors-anywhere), without which it would have been effectively impossible to develop Corsproxy with the resources we had.

The [vector artwork](https://thenounproject.com/term/subtotal/2820924/) used as a starting point for the logo for this repository was created by [Timofey Rostilov ](https://thenounproject.com/t.rostilov/) for the [Noun Project](https://thenounproject.com).  It is licensed under the Creative Commons [Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/deed.en) license.  The vector graphics was modified by Mike Hucka to change the color and remove text.

This work was funded by the California Institute of Technology Library.

<div align="center">
  <br>
  <a href="https://www.caltech.edu">
    <img width="100" height="100" src=".graphics/caltech-round.png">
  </a>
</div>
