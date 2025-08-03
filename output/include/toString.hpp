#ifndef __TOSTRING_H__
#define __TOSTRING_H__

#include <variant>
#include <fmt/core.h>

#include "js.hpp"

// @todo move to .cpp

js::string toString(js::number value)
{
    if (std::isnan(value))
        return "NaN";
    else if (value == +INFINITY)
        return "Infinity";
    else if (value == -INFINITY)
        return "-Infinity";
    else 
        return fmt::format("{}", value);
}

js::string toString(js::string value)
{
    return value;
}

js::string toString(js::dynamic _value)
{
    JSvalue value = _value.value;
    if(std::holds_alternative<js::array<js::dynamic>>(value))
    {
        return std::get<js::array<js::dynamic>>(value)._toString();
    }
    else
    {
    return std::visit(
        [](auto &&v) -> js::string
        {
            return toString(v);
        },
        _value.value);
    }
}

#endif // __TOSTRING_H__