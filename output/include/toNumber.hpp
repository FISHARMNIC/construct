#ifndef __TONUMBER_H__
#define __TONUMBER_H__

#include "js.hpp"

js::number toNumber(js::number value);
js::number toNumber(js::string value);
js::number toNumber(js::dynamic _value);

template <typename T>
js::number toNumber(js::array<T> value)
{
    return value._toNumber();
}


#endif // __TONUMBER_H__