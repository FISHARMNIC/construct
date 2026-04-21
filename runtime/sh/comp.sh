#!/bin/bash

D=$(dirname "$0")
LIBS_DIR=$D/../libs
BIN_DIR=$D/../../output/bin

# OLD
# CPPFLAGS="-O2 -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"
# CPPFLAGS="-O3 -march=native -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"



# O3
CPPFLAGS="-O3 -march=native -funroll-loops -fprefetch-loop-arrays -fomit-frame-pointer -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"
g++ -ferror-limit=1 -std=c++20 $CPPFLAGS -I/opt/homebrew/include -L/opt/homebrew/lib -lfmt $D/../../output/out.cpp $LIBS_DIR/*.cpp -o $BIN_DIR/a.out

# Polly
# POLLYFLAGS="-mllvm -polly -mllvm -polly-vectorizer=stripmine"
# CPPFLAGS="-O3 -march=native -funroll-loops -fomit-frame-pointer -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"
# clang++ -ferror-limit=1 -std=c++20 $CPPFLAGS $POLLYFLAGS -I/opt/homebrew/include -L/opt/homebrew/lib -lfmt $D/../../output/out.cpp $LIBS_DIR/*.cpp -o $BIN_DIR/a.out

# PGO
# CPPFLAGS="-O3 -march=native -funroll-loops -fomit-frame-pointer -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion -Wundef -Wuninitialized"
# SOURCES="$D/../../output/out.cpp $LIBS_DIR/*.cpp"
# INCLUDES="-I/opt/homebrew/include -L/opt/homebrew/lib -lfmt"
# clang++ -ferror-limit=1 -std=c++20 $CPPFLAGS -fprofile-instr-generate $INCLUDES $SOURCES -o $BIN_DIR/a.out.profiling
# LLVM_PROFILE_FILE="$BIN_DIR/a.out.profraw" $BIN_DIR/a.out.profiling
# llvm-profdata merge -sparse $BIN_DIR/a.out.profraw -o $BIN_DIR/a.out.profdata
# clang++ -ferror-limit=1 -std=c++20 $CPPFLAGS -fprofile-instr-use=$BIN_DIR/a.out.profdata $INCLUDES $SOURCES -o $BIN_DIR/a.out