D=$(dirname "$0")

clang-tidy $D/../out.cpp --fix --fix-errors -- -std=c++17