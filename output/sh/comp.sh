#!/bin/bash

D=$(dirname "$0")
LIBS_DIR=$D/../libs
BIN_DIR=$D/../bin

# -fsanitize=undefined -fno-sanitize-recover // for reporting undefined behavior (inserts extra code)
CPPFLAGS="-O2 -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"
# @todo compile libs indep then just compile out.cpp indep and link 
g++ -std=c++20 $CPPFLAGS -lfmt $D/../out.cpp $LIBS_DIR/*.cpp -o $BIN_DIR/a.out

# g++ -std=c++20 $D/../out.cpp $LIBS_DIR/*.cpp -S