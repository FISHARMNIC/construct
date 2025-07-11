D=$(dirname "$0")
LIBS_DIR=$D/../libs
BIN_DIR=$D/../bin

g++ -std=c++20 -lfmt $D/../out.cpp $LIBS_DIR/*.cpp -o $BIN_DIR/a.out