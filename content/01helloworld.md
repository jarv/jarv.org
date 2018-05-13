Title: 191 ways to echo hello world on the command line
Date: 2017-02-08
Slug: 191-hello-worlds

It's been about 12 days since the launch of [cmdchallenge](https://cmdchallenge.com), a weekend project
to create some common command-line tasks that can be done in a single line of bash.
One common request has been to share user-submitted solutions. Or to put it another way,
you may be wondering *what do random people on the internet and hackernews type if you give them
some basic command-line tasks and a shell prompt?*  Well lucky for me this is no longer a mystery!

Starting off with Challenge #1:

[CMD Challenge #1](https://cmdchallenge.com/#/hello_world): **print "hello world" at the bash prompt**

There has been a lot of diverse input for such a simple task. I really love how people do weird stuff even when it is totally unnecessary.

Here are some of my favorites:

```
:::bash
( for i in h e l l o \  w o r l d ; do echo "$i" |awk -F, ' {print $NR}'; done ) |tr -d \\n; echo
echo ifmmp xpsme |tr bcdefghijklmnopqrstuvwxyza abcdefghijklmnopqrstuvwxyz
touch helloworld && echo "hello world" > helloworld && cat helloworld
sed 's.\.\...;yhHh\hh;ywWw\ww;2,$d' README
```

A few things to note that may clarify some of the more interesting submissions:

* There is a `README` in each challenge directory, in this case it contains the string "hello world" so some people took advantage of that.
* The directory itself was named `hello world`.


Here are all of the correct submissions for the first challenge as of yesterday:

```
:::bash
a=(d e h l o r w X \");s=(2 1 3 3 4 7 6 4 5 3 0);for i in ${s[@]} ; do echo -n ${a[$i]}|tr X\n ' ' ; done ; echo ""
( for i in h e l l o \  w o r l d ; do echo "$i" |awk -F, ' {print $NR}'; done ) |tr -d \\n; echo
for i in h e l l o; do echo -n $i; done; echo -n " "; for j in w o r l d; do echo -n $j; done
cat README | head -n 4 | tail -n 1 | awk '{ print $3 " " $4 }' | sed -e 's/\"//g;s/\.//g'
echo ifmmp xpsme |tr bcdefghijklmnopqrstuvwxyza abcdefghijklmnopqrstuvwxyz
< README grep hello | tr -d '#' | cut -f3- -d' ' | tr -d '"' | tr -d '.'
touch helloworld && echo "hello world" > helloworld && cat helloworld
letters=(h e l l o \  w o r l d); printf '%s' "${letters[@]}"
touch test.txt ; echo "hello world" > test.txt ; cat test.txt
grep "hello world" README | sed -E 's/.*(hello world).*/\1/'
cat README | grep Print | sed -E 's/^.+"([^"]+)".+$/\1/'
echo "hello world" > ./hiworld.txt && cat ./hiworld.txt
head -n 1 < README  | sed 's/# //' | tr '[A-Z]' '[a-z]'
cat $0|cut -d\; -f4;echo ";hello world;" > /dev/null
touch file && echo "hello world" > file && cat file
cat README | sed -e 's/.*/hello world/' | head -1
touch "hello world"; ls *hell*; rm "hello world"
head -1 README | cut -c3- | tr '[A-Z]' '[a-z]'
echo "hello world" > hello.txt | cat hello.txt
awk 'BEGIN {print "hello world"}' < /dev/null
echo "hello world" > hello.txt; cat hello.txt
echo "hello world" > testfile; cat testfile
echo "hello world" > test.txt; cat test.txt
grep hello README | awk -F\" '{ print $2 }'
for n in 'hello world' ; do echo ${n}; done
sed 's.\.\...;yhHh\hh;ywWw\ww;2,$d' README
echo "hello world" > foo.txt; cat foo.txt
echo -n "h""e""l""l""o"" ""w""o""r""l""d"
touch 'hello world' && ls h*| xargs echo
msg="hello world"; printf '%s\n' "$msg"
cat README| grep hello | cut -d '"' -f2
echo " " | awk '{print "hello world"}'
echo "hello world">hello | tail hello
awk ' BEGIN { print "hello world" } '
export HAHA="hello world";echo $HAHA
echo 'hello world' > henk | cat henk
echo "hello world" > test & cat test
awk 'BEGIN { print "hello world"; }'
echo "$(echo hello)" "$(echo world)"
perl -e 'printf "%s", "hello world"'
mkdir "hello world" && ls | tail -1
awk 'BEGIN { print "hello world" }'
pwd | cut -d'/' -f4 | sed 's/_/ /g'
touch "hello world"; ls | grep ello
printf '%s%s%s%s\n' hel lo\  wor ld
cat README | grep -o "hello world"
echo "hello world" | sed 's/b/h/g'
echo | awk '{print "hello world"}'
echo "hello world" > tmp; cat tmp
echo hello world > henk; cat henk
cat >/dev/stdout <<<"hello world"
awk 'BEGIN{print "hello world";}'
awk 'BEGIN{print("hello world")}'
cat >/dev/stderr <<<"hello world"
awk 'BEGIN {print "hello world"}'
echo "hello world">algo;cat algo
hello="hello world"; echo $hello
perl -e 'print "hello world\n";'
GGG="hello world" ; cat <<< $GGG
echo|awk '{print "hello world"}'
echo 'hello world' > /dev/stdout
awk 'BEGIN{print "hello world"}'
ls .. | grep hel | sed 's/_/ /g'
printf "%s %s\n" "hello" "world"
perl -e 'print "hello world\n"'
echo s | sed 's/s/hello world/'
echo -n "hello"; echo " world";
#!/bin/bash\necho "hello world"
printf -- '%s\n' 'hello world'
printf '%s %s' 'hello' 'world'
printf "%s %s" "hello" "world"
perl -le 'print "hello world"'
text='hello world'; echo $text
perl -e 'print "hello world";'
perl -e "print 'hello world';"
echo "hello world" > a ; cat a
echo -n hello ; echo " world"
perl -e 'print "hello world"'
perl -e "print 'hello world'"
STR="hello world"; echo $STR
perl -E 'say "hello world";'
grep hello <<< "hello world"
perl -e'print "hello world"'
printf "%s\\n" "hello world"
perl -E 'say q[hello world]'
touch "hello world"; ls *\ *
printf '%s %s\n' hello world
printf "hello world" | cat -
VAR="hello world";echo $VAR
cat < <(echo "hello world")
perl -E 'say "hello world"'
date|sed s/.*/hello\ world/
touch 'hello world'; ls he*
echo  "hello world" | cat -
printf '%s\n' 'hello world'
perl -e'print"hello world"'
printf '%s\n' "hello world"
printf "%s\n" "hello world"
printf "hello %s\n" "world"
printf "%b\n" "hello world"
echo|sed -n "i hello world"
touch 'hello world'; ls h*
echo "hello world" | cat -
printf %s\\n "hello world"
printf 'dlrow olleh' | rev
printf '%s %s' hello world
true && echo "hello world"
printf "%s %s" hello world
i='hello world'; echo $i;
printf '%s' "hello world"
cat <<EOF\nhello world\nEOF
printf -- 'hello world\n'
cat <(echo "hello world")
echo `echo "hello world"`
printf 'hello %s' "world"
printf "hello %s" "world"
printf "%s" "hello world"
printf '%s' 'hello world'
printf -- "hello world\n"
echo "dlrow olleh" | rev
echo 'hello world' | cat
echo ${PWD##*/}|tr _ ' '
printf "hello world\013"
printf '%s ' hello world
echo "hello world" | cat
/bin/echo 'hello world'
/bin/echo "hello world"
printf %s 'hello world'
cat - <<< 'hello world'
echo -e "hello world\n"
a='hello world';echo $a
printf -- "hello world"
printf "hello world" \n
printf %s "hello world"
cat - <<< "hello world"
cat - <<<"hello world"
printf "hello world\n"
echo -ne "hello world"
echo 'hello world'|cat
printf 'hello world\n'
echo hello world | cat
echo """hello world"""
echo -n  "hello world"
cat <<< "hello world"
/bin/echo hello world
echo -e "hello world"
printf "hello world";
echo -n 'hello world'
echo -e 'hello world'
echo -n "hello world"
cat <<< 'hello world'
echo dlrow olleh|rev
(echo "hello world")
cat <<<"hello world"
echo "hello world" ;
'echo' 'hello world'
echo   "hello world"
printf "hello world"
echo ''hello world''
printf 'hello world'
cat <<<'hello world'
echo ""hello world""
echo -n hello world
echo  "hello world"
printf hello\ world
echo 'hello world'\
echo $"hello world"
echo 'hello world';
echo 'hello world '
echo "hello world "
echo $'hello world'
echo  'hello world'
echo -e hello world
echo "hello world";
echo "hello world"\
echo hello world""
echo ""hello world
echo "hello world"
echo hello\ world;
echo 'hello world'
echo hello   world
'echo' hello world
echo hello world \
echo hello' 'world
echo hello world\
echo hello world;
echo hello \world
echo hello  world
echo hello\ world
echo  hello world
echo hello world
```
<br />

Of course there are a lot of quoting and space variations here as well. I will make a
data-dump available soon with the responses for all challenges.

On the building and hosting side of things this is getting more than the usual tiny trickle of side-project internet traffic.
So far I have tried to contain the entire thing in an AWS free tier account, it has worked out OK so far with a
few hiccups here and there. Since several people have asked, I will share more details about how the site is put
together in a future post, follow [cmdchallenge on twitter](https://twitter.com/thecmdchallenge) or
use [rss](/rss.xml).
