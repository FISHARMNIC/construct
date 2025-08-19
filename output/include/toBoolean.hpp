#ifndef __TOBOOLEAN_H__
#define __TOBOOLEAN_H__

#include "js.hpp"

js::boolean toBoolean(js::number value);
js::boolean toBoolean(js::string value);
js::boolean toBoolean(js::boolean value);
js::boolean toBoolean(js::dynamic _value);


template <typename T>
js::boolean toBoolean(js::array<T> value)
{
    return value._toBoolean();
}


#endif // __TOBOOLEAN_H__