#include <cstdlib>

#include <util/files.hpp>

int genAST()
{
    int ret = std::system(FNA_AST_GENERATOR);
    return WEXITSTATUS(ret);
}