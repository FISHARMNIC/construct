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

/// @todo make `let` part of js namespace
struct let
{
    JSvalue value;

    let(int n);
    let(js::number n);
    let(js::string s);
    let(const char *s);

    let operator+(let const &other);
    let operator-(let const &other);
    let operator*(let const &other);
    let operator/(let const &other);
};

std::ostream &operator<<(std::ostream &os, let const &me);

#define NUMBER(n) static_cast<js::number>(n)

#define LET_OPOO(_o_)                          \
    let let::operator _o_ (let const &other)      \
    {                                          \
        let result = std::visit(               \
            [](auto &&x, auto &&y) -> let {    \
                let ret = x _o_ y;             \
                return ret; },                 \
            this->value, other.value);         \
        return result;                         \
    }
#endif // __JS_H__