#ifndef __JS_H__
#define __JS_H__

#include <string>
#include <variant>
#include <iostream>
#include <inttypes.h>

namespace js
{
    typedef double number;
    typedef std::string string;
    typedef bool boolean;
}

/*
This can all be done later... dont really want to handle it for now

struct _Null {
    // null + number = number
    js::number operator+(js::number other);
    // null + string = "null<conts>"
    js::string operator+(js::string& other);
    // string + null = "<conts>null"
    friend js::string operator+(const js::string& a, const _Null&);
    // null + bool = number<1|0>
    js::number operator+(js::boolean other);
};

struct _Undefined {
    // undefined + number = NaN
    js::number operator+(js::number other);
    // undefined + string = "undefined<conts>"
    js::string operator+(js::string& other);
    // string + undefined = "<conts>undefined"
    friend js::string operator+(const js::string& a, const _Undefined&);
    // undefined + bool = NaN
    js::number operator+(js::boolean other);
};

*/

#include "string.hpp"
#include "dynamic.hpp"

namespace js
{
    // typedef _Undefined undefined;
    // typedef _Null null;
    template<typename T1, typename T2>
    using dynamic2 = Dynamic2<T1,T2>;
}


#endif // __JS_H__