#include <variant>
#include <fmt/core.h>

#include "../include/js.hpp"

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

js::string toString(js::boolean value)
{
    return value ? "true" : "false";
}

js::string toString(js::dynamic _value)
{
    JSvalue value = _value.value;
    return std::visit(
        [](auto &&v) -> js::string
        {
            return toString(v);
        },
        _value.value);
}