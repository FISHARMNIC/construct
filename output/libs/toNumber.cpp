#include "../include/js.hpp"

js::number toNumber(js::number value)
{
    return value;
}

js::number toNumber(js::string value)
{
    return stod_noexep(value);
}

js::number toNumber(js::dynamic _value)
{
    JSvalue value = _value.value;
    return std::visit(
        [](auto &&v) -> js::number
        {
            return toNumber(v);
        },
    _value.value);
}

js::number toNumber(js::array<js::dynamic> value)
{
    return value._toNumber();
}
