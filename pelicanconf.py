#!/usr/bin/env python
# -*- coding: utf-8 -*- #
FEED_RSS = 'rss.xml'
FEED_DOMAIN = ''
THEME = 'jarvican'
AUTHOR = u'jarv'
SITENAME = u'jarv'
SITEURL = 'http://localhost:8080'
TIMEZONE = 'US/Eastern'
PLUGIN_PATHS = ['pelican-plugins']
PLUGINS = []

DEFAULT_LANG = u'en'
PYGMENTS_RST_OPTIONS = {'classprefix': 'pgcss', 'linenos': 'table'}
# Blogroll
LINKS =  (('Pelican', 'http://docs.notmyidea.org/alexis/pelican/'),
          ('Python.org', 'http://python.org'),
          ('Jinja2', 'http://jinja.pocoo.org'),
          ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)
MENUITEMS = [
    ('home', '/'),
    ('archives', '/archives.html'),
    ('about', '/pages/about.html'),
]
DEFAULT_PAGINATION = 5
STATIC_PATHS = ['extra', 'static']
ARTICLE_EXCLUDES = ['extra', 'static']
EXTRA_PATH_METADATA = {
    'extra/robots.txt': {'path': 'robots.txt'},
    'extra/jarv.json': {'path': 'jarv.json'},
    'extra/profile.jpg': {'path': 'profile.jpg'},
    'extra/reddit.webm': {'path': 'reddit.webm'},
    }
GITHUB_URL = 'http://github.com/jarv'
EMAIL = 'john@jarv.org'
SOCIAL = [
        ('github', 'http://github.com/jarv'),
        ('twitter', 'https://twitter.com/__jarv__'),
        ]
SUMMARY_MAX_LENGTH = 1000
GOOGLE_ANALYTICS_ID = None
LOAD_CONTENT_CACHE = False
RESPONSIVE_IMAGES = True
