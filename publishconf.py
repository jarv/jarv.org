#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *
# Take advantage of the following defaults
# STATIC_SAVE_AS = '{path}'
# STATIC_URL = '{path}'
SITEURL = 'https://jarv.org'
RELATIVE_URLS = True
#
FEED_ALL_ATOM = 'feeds/all.atom.xml'
CATEGORY_FEED_ATOM = 'feeds/%s.atom.xml'
# LOAD_CONTENT_CACHE = True
DELETE_OUTPUT_DIRECTORY = True
GOOGLE_ANALYTICS_ID = 'UA-78464-7'
