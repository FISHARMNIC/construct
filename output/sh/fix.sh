#!/bin/bash

D=$(dirname "$0")

# sometimes it doesn't work fully the first time
CTIDYFLAGS="--header-filter='' --fix --fix-errors --format-style=google -checks=readability-empty-loop-body -- -std=c++20"
echo $CTIDYFLAGS
clang-tidy $D/../out.cpp $CTIDYFLAGS
clang-tidy $D/../out.cpp $CTIDYFLAGS

$D/comp.sh