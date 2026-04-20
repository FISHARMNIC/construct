#include "../include/js.hpp"
#include "../include/string.hpp"
#include <variant>

Dynamic::Dynamic() : value(static_cast<js::number>(0)) {}

Dynamic::Dynamic(js::boolean n) : value(n) {}
Dynamic::Dynamic(int n) : value(static_cast<js::number>(n)) {}
Dynamic::Dynamic(js::number n) : value(n) {}
Dynamic::Dynamic(js::string s) : value(s) {}
Dynamic::Dynamic(const char *s) : value(js::string(s)) {}

Dynamic::Dynamic(js::array<Dynamic> arr) : value(arr) {}

std::ostream &operator<<(std::ostream &os, Dynamic const &me)
{
    std::visit(
        [&](auto && v) -> void
        {    
            os << v;
        }, me.value);

    return os;
}

Dynamic Dynamic::__globalUndefined = Dynamic(0.0);