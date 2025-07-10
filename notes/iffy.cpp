// g++ -std=c++20 iffy.cpp -lfmt

/*

Note that * and / have type coercion but + and - dont
    -> like "10" * 10 == 100

*/
#include <variant>
#include <iostream>
#include <string>
#include <cmath>
#include <inttypes.h>
#include <fmt/core.h>

using number = double;
using JSvalue = std::variant<number, std::string>;

std::string operator+(number left, const std::string &right)
{
    std::string formatted = fmt::format("{}", left);
    return formatted + right;
}

std::string operator+(const std::string &left, number right)
{
    std::string formatted = fmt::format("{}", right);
    return left + formatted;
}

struct let
{
    JSvalue value;

    let(int n) : value(static_cast<number>(n)) {}
    let(number n) : value(n) {}
    let(std::string s) : value(s) {}
    let(const char *s) : value(std::string(s)) {}

    let operator+(let const &other)
    {
        let result = std::visit([](auto &&x, auto &&y) -> let
        {
            let ret = x + y;
            return ret; 
        }, 
        this->value, other.value);

        return result;
    }
};

int main()
{
    let a = 5.0;
    let b = "hi";

    let sum = a + b;

    std::cout << std::get<std::string>(sum.value) << std::endl;

    a = "bob";
    b = 100;

    sum = a + b;

    std::cout << std::get<std::string>(sum.value) << std::endl;
}