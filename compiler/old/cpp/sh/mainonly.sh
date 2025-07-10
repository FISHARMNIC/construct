clear

D=$(dirname "$0")

SRC_DIR=$D/../src
BIN_DIR=$D/../bin
INC_DIR=$D/../inc

mkdir -p $SRC_DIR
mkdir -p $BIN_DIR

OPTIM=O2

g++ -std=c++17 -I $INC_DIR -D__DIRNAME=\"$dpath\" -Wall -Wextra -Werror -c -$OPTIM $SRC_DIR/main.cpp -o "$BIN_DIR/main.o"

g++ $BIN_DIR/*.o -o $BIN_DIR/main