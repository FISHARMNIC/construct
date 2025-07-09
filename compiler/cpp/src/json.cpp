#include <fstream>
#include <string>
#include <iostream>

#include <nlohmann/json.hpp>
using json = nlohmann::json;

json loadFile(std::string fileName)
{
    std::ifstream jsonStream(fileName);

    if(!jsonStream.is_open())
    {
        std::cerr << "[FATAL] Could not open file '" << fileName << "'" << std::endl;
        std::exit(EXIT_FAILURE);
    }
    
    json data = json::parse(jsonStream);

    return data;
}
