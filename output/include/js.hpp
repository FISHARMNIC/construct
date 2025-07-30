#ifndef __JS_H__
#define __JS_H__

#include <string>
#include <variant>
#include <iostream>
#include <string>
#include <inttypes.h>

struct let;

namespace js
{
    typedef double number;
    typedef std::string string;
}

#include "string.hpp"
#include "array.hpp"

namespace js
{
    template <typename T>
    using array = Array<T>;
}

using JSvalue = std::variant<js::number, js::string /*,js::array<let>*/>;


#include "let.hpp"

namespace js
{
    typedef let dynamic; // @todo make upper case
}

#include "array2.hpp"


#endif // __JS_H__