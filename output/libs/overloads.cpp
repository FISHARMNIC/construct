#include "../include/js.hpp"

js::dynamic operator+(const js::dynamic& first, const js::dynamic& second)
{
    return std::visit([](auto &&a, auto&& b) -> js::dynamic {
        return js::dynamic(a + b);
    }, first.value, second.value);
}