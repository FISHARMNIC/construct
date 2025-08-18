#include <cmath>

#include "../include/js.hpp"

js::boolean toBoolean(js::number value)
{
    return (!std::isnan(value) && static_cast<bool>(value));
}

js::boolean toBoolean(js::string value)
{
    return value.length() != 0;
}

js::boolean toBoolean(js::boolean value)
{
    return value;
}

js::boolean toBoolean(js::dynamic _value)
{
    JSvalue value = _value.value;
    return std::visit(
        [](auto &&v) -> js::boolean
        {
            return toBoolean(v);
        },
    _value.value);
}