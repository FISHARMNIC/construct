#!/bin/bash

D=$(cd "$(dirname "$0")" && pwd)
LIBS_DIR="$D/../libs"

CTIDYFLAGS=(
  --fix
  --fix-errors
  --format-style=google
  -checks=readability-*
  --header-filter=''
)

COMPFLAGS=(
  --
  -std=c++20
  -lfmt
  -I/opt/homebrew/include
  -L/opt/homebrew/lib
)

# sometimes it doesn't work fully the first time
clang-tidy "${CTIDYFLAGS[@]}" "$D/../../output/out.cpp" $LIBS_DIR/*.cpp "${COMPFLAGS[@]}"
clang-tidy "${CTIDYFLAGS[@]}" "$D/../../output/out.cpp" $LIBS_DIR/*.cpp "${COMPFLAGS[@]}"
clang-tidy "${CTIDYFLAGS[@]}" "$D/../../output/out.cpp" $LIBS_DIR/*.cpp "${COMPFLAGS[@]}"

echo "RUNNING COMPILER" 
"$D/comp.sh"
