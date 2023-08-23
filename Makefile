BASEDIR=$(CURDIR)
THEMEDIR=$(BASEDIR)/themes/one-post-a-year
PUBLICDIR=$(BASEDIR)/public

serve:
	hugo server -D -F

update-theme:
	rm -rf "$(THEMEDIR)/"
	git clone --quiet --depth 1 https://github.com/jarv/one-post-a-year.git "$(THEMEDIR)"
	rm -rf "$(THEME_DIR)/.git"
