#include <util/genAST.hpp>

#include <iostream>

int genAST()
{
    int ret = std::system(FILE_GETDIR("/../../",FNA_AST_GENERATOR));
    return WEXITSTATUS(ret);
}