#include "../include/js.hpp"
#include "../include/string.hpp"
#include <variant>

let::let() : value(static_cast<js::number>(0)) {}
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
