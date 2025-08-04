#include "../include/js.hpp"

/*

String overloads for basic math

*/

double stod_noexep(const std::string& s) {
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
    return toString(left) + right;
}

js::string operator+(STR_NUM)
{
    return left + toString(right);
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