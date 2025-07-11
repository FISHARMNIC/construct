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

using JSvalue = std::variant<js::number, js::string>;

js::string operator+(js::number left, const js::string &right);
js::string operator+(const js::string &left, js::number right);

struct let
{
    JSvalue value;

    let(int n);
    let(js::number n);
    let(js::string s);
    let(const char *s);

    let operator+(let const &other);
};

#define NUMBER(n) static_cast<js::number>(n)
#endif // __JS_H__