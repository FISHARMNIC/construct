#!/bin/bash

D=$(dirname "$0")
LIBS_DIR=$D/../libs
BIN_DIR=$D/../bin

CPPFLAGS="-O2 -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"
g++ -ferror-limit=1 -std=c++20 $CPPFLAGS -I/opt/homebrew/include -L/opt/homebrew/lib -lfmt $D/../out.cpp $LIBS_DIR/*.cpp -o $BIN_DIR/a.out