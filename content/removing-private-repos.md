Title: Removing all of my private repos from GitHub
Date: 2018-05-31
Slug: removing-private-repos

Today I decided to remove all private repositories from GitHub.
Why? Interesting that having private repositories generally meant that
I was not being as careful about managing secrets properly. Checking in
API tokens, keys and especially cloud tokens into git _never_ a good idea
and looking through some of my old private repos I was doing exactly that.
So for others who are interested in going from a _developer_ GitHub account
back to free I highly recommend doing it! Granted it's only $5 a month savings
but I definitely feel a bit more transparent than I did 15 minutes ago. :)
For finding secrets you can use something like [trufflehog](https://github.com/dxa4481/truffleHog)
to ensure that there no sensitive bits in your git history.
