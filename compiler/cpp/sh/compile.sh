clear

D=$(dirname "$0")

SRC_DIR=$D/../src
BIN_DIR=$D/../bin
INC_DIR=$D/../inc

C_RED="\033[0;31m"
C_GREEN="\033[0;32m"
C_YLW="\033[0;33m"
C_MAG="\033[0;35m"
C_DONE="\033[0m"

mkdir -p $SRC_DIR
mkdir -p $BIN_DIR

OPTIM=O2

echo -e "$C_MAG------- beginning compilation ------$C_DONE"

find "$SRC_DIR" -type f -name "*.cpp" | while read -r sfile; do
    fname=$(basename "$sfile" .cpp)
    echo -e "[ ${C_YLW}COMPILE$C_DONE   ] : $sfile" 
    dpath=$(dirname "$sfile")

    g++ -std=c++17 -I $INC_DIR -D__DIRNAME=\"$dpath\" -Wall -Wextra -Werror -c -$OPTIM "$sfile" -o "$BIN_DIR/$fname.o"
    if [ $? -eq 0 ]; then
        echo -e "[        ${C_GREEN}OK$C_DONE ]"
    else
        echo -e "[      ${C_RED}FAIL$C_DONE ]"
        echo -e "$C_MAG------ compilation failed on $sfile ------$C_DONE"
        exit 1
    fi
done

echo -e "$C_MAG------ compilation successful ------$C_DONE"

g++ $BIN_DIR/*.o -o $BIN_DIR/main