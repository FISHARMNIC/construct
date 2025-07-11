D=$(dirname "$0")

clang-tidy $D/../out.cpp --fix --fix-errors --format-style=google -- -std=c++17