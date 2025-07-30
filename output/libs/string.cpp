#include "../include/js.hpp"
#include "../include/string.hpp"
#include <fmt/core.h> 
/*

String overloads for basic math

*/

static double stod_noexep(const std::string& s) {
        const char* cstr = s.c_str();
        char* eptr = nullptr;
        js::number converted = std::strtod(cstr, &eptr);
        if (cstr == eptr) 
        {
            return std::numeric_limits<double>::quiet_NaN();
        }
        else
        {
            return converted;
        }
}

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
    return stod_noexep(left) - stod_noexep(right);
}


js::number operator-(NUM_STR)
{
    return left - stod_noexep(right);
}

js::number operator-(STR_NUM)
{
    return stod_noexep(left) - right;
}

js::number operator*(STR_STR)
{
    return stod_noexep(left) * stod_noexep(right);
}


js::number operator*(NUM_STR)
{
    return left * stod_noexep(right);
}

js::number operator*(STR_NUM)
{
    return stod_noexep(left) * right;
}

js::number operator/(STR_STR)
{
    return stod_noexep(left) / stod_noexep(right);
}


js::number operator/(NUM_STR)
{
    return left / stod_noexep(right);
}

js::number operator/(STR_NUM)
{
    return stod_noexep(left) / right;
}