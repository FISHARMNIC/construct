/*
@todo compile will just mark things as dynamic 2,3,etc and just let c++ handle exactly what types

*/

#include <variant>
#include <type_traits>

#include "js.hpp"

struct LooseDynamic
{
    std::variant<js::number, js::string, js::boolean> value;
};

static const js::string str_undefined("undefined");
static const js::string str_null("null");

template <typename T1, typename T2>
struct Dynamic2
{
    using DType = Dynamic2<T1, T2>;
    using IType = Dynamic2<T2, T1>;

    std::variant<T1, T2> value;

    explicit Dynamic2(T1 val) : value(val) {}
    explicit Dynamic2(T2 val) : value(val) {}
    explicit Dynamic2(const DType& val) : value(val) {}

    DType& operator=(const DType& other) {
        value = other.value;
        return *this;
    };

    // me<a, b> + other<a | b>
    template <typename U>
        requires(std::is_same_v<U, T1> || std::is_same_v<U, T2>)
    DType operator+(U other)
    {
        return std::visit(
            [other](auto &&a) -> DType
            {
                return DType(a + other);
            },
            value);
    }

    DType operator+(DType other)
    {
        return std::visit(
            [](auto &&a, auto &&b) -> DType
            {
                return DType(a + b);
            },
            value, other.value);
    }

    DType operator+(IType other)
    {
        return std::visit(
            [](auto &&a, auto &&b) -> DType
            {
                return DType(a + b);
            },
            value, other.value);
    }

    template <typename OT1, typename OT2>
        requires(!(std::is_same_v<OT1, T1> && std::is_same_v<OT2, T2>) || 
                 !(std::is_same_v<OT1, T2> && std::is_same_v<OT2, T1>))
    LooseDynamic operator+(Dynamic2<OT1, OT2> other)
    {
        return std::visit(
            [](auto &&a, auto &&b) -> LooseDynamic
            {
                return LooseDynamic(a + b);
            },
            value, other.value);
    }
};

template <typename T1, typename T2>
std::ostream &operator<<(std::ostream &os, Dynamic2<T1,T2> const &me)
{
    std::visit(
        [&](auto && v) -> void
        {    
            os << v;
        }, me.value);

    return os;
}
