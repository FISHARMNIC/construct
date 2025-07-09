#ifndef __JSON_H__
#define __JSON_H__

#include <fstream>
#include <string>
#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

json json_loadFile(std::string fileName);


#endif // __JSON_H__