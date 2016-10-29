#/usr/bin/env bash

/usr/bin/sox sonata-1.mp3 -c 2 -t wav sonata-1.wav
/usr/bin/sox sonata-1.wav -r 1k sonata-1.dat
/usr/bin/gnuplot a.gnuplot
