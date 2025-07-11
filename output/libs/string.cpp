#include "../include/js.hpp"
#include "../include/string.hpp"
#include <fmt/core.h>
/*

String overloads for basic math

*/

js::string operator+(NUM_STR)
{
    js::string formatted = fmt::format("{}", left);
    return formatted + right;
}

js::string operator+(STR_NUM)
{
    js::string formatted = fmt::format("{}", right);
    return left + formatted;
}

js::number operator-(STR_STR)
{
    return std::stod(left) - std::stod(right);
}


js::number operator-(NUM_STR)
{
    return left - std::stod(right);
}

js::number operator-(STR_NUM)
{
    return std::stod(left) - right;
}

js::number operator*(STR_STR)
{
    return std::stod(left) * std::stod(right);
}


js::number operator*(NUM_STR)
{
    return left * std::stod(right);
}

js::number operator*(STR_NUM)
{
    return std::stod(left) * right;
}

js::number operator/(STR_STR)
{
    return std::stod(left) / std::stod(right);
}


js::number operator/(NUM_STR)
{
    return left / std::stod(right);
}

js::number operator/(STR_NUM)
{
    return std::stod(left) / right;
}