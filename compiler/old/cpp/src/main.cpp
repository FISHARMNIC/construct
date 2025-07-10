#include <util/genAST.hpp>
#include <util/json.hpp>
#include <util/files.hpp>

int main()
{
    int ec = genAST();
    if(ec != 0)
    {
        std::cerr << "[FATAL] Could not generate AST";
        std::exit(EXIT_FAILURE);
    }

    json ast = json_loadFile(FILE_GETDIR("/../../output/",FNA_JSON_OP));

    json body = ast["body"];
}