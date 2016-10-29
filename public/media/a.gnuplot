#set terminal pngcairo size 2500,150 enhanced
#set output "output.png"

set terminal svg size 600,50
set output "sonate-1.svg"

set lmargin 0
set rmargin 0
set tmargin 0
set bmargin 0

set style data histogram
set style fill solid noborder

#set size 2,0.5

set logscale y
unset border
unset xtics
unset ytics
unset key

set xrange [0:210.729]
set boxwidth 0.75

set datafile commentschars ";"

plot "sonata-1.dat" every 1000 using 1:(abs($2)) lt rgb "#B29C85" with boxes
