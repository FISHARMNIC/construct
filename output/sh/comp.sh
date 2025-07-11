#!/bin/bash

D=$(dirname "$0")
LIBS_DIR=$D/../libs
BIN_DIR=$D/../bin

# @todo compile libs indep then just compile out.cpp indep and link 
g++ -std=c++20 -lfmt $D/../out.cpp $LIBS_DIR/*.cpp -o $BIN_DIR/a.out