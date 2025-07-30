#include "../include/js.hpp"
#include "../include/string.hpp"
#include <variant>

let::let(int n) : value(static_cast<js::number>(n)) {}
let::let(js::number n) : value(n) {}
let::let(js::string s) : value(s) {}
let::let(const char *s) : value(js::string(s)) {}

std::ostream &operator<<(std::ostream &os, let const &me)
{
    std::visit(
        [&](auto && v) -> void
        {    
            os << v;
        }, me.value);

    return os;
}

LET_OPOO(+)
LET_OPOO(-)
LET_OPOO(*)
LET_OPOO(/)
