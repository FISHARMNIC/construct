#ifndef __JS_H__
#define __JS_H__

#include <string>
#include <variant>
#include <iostream>
#include <string>
#include <inttypes.h>

namespace js
{
    typedef double number;
    typedef std::string string;
}

#include "string.hpp"
#include "let.hpp"

namespace js
{
    typedef let dynamic; // @todo make upper case
}

#include "array.hpp"

namespace js
{
    template <typename T>
    using array = Array<T>;
}

// #define cast__ static_cast
  

#endif // __JS_H__