#ifndef __JS_H__
#define __JS_H__

#include <string>
#include <variant>
#include <iostream>
#include <string>
#include <inttypes.h>

struct Dynamic;

namespace js
{
    typedef double number;
    typedef std::string string;
    typedef bool boolean;
}

#include "string.hpp"
#include "array.hpp"

namespace js
{
    template <typename T>
    using array = Array<T>;
}

// must match order below
// @todo horrible system. use templates later
enum JSvalues
{
    number,
    string,
    dynamicArray,
    boolean
};

using JSvalue = std::variant<js::number, js::string,js::array<Dynamic>, js::boolean>;


#include "dynamic.hpp"

namespace js
{
    typedef Dynamic dynamic; // @todo make upper case
}

#include "toString.hpp"
#include "toNumber.hpp"
#include "toBoolean.hpp"

#include "array2.hpp"

#include "overloads.hpp"

#include "string2.hpp"

#endif // __JS_H__