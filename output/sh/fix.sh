#!/bin/bash

D=$(dirname "$0")

# sometimes it doesn't work fully the first time
clang-tidy $D/../out.cpp --fix --fix-errors --format-style=google -checks=readability-empty-loop-body -- -std=c++17
clang-tidy $D/../out.cpp --fix --fix-errors --format-style=google -checks=readability-empty-loop-body -- -std=c++17

$D/comp.sh