#include "../include/js.hpp"
#include "../include/string.hpp"
#include <variant>

let::let(int n) : value(static_cast<js::number>(n)) {}
let::let(js::number n) : value(n) {}
let::let(js::string s) : value(s) {}
let::let(const char *s) : value(js::string(s)) {}

// LET_OPOO(+)

let let::operator+(let const &other)
{
    let result = std::visit([](auto &&x, auto &&y) -> let
                            { let ret = x + y; return ret; }, this->value, other.value);
    return result;
}

LET_OPOO(-)
LET_OPOO(*)
LET_OPOO(/)