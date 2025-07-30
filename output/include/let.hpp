#ifndef __LET_H__
#define __LET_H__

#include "js.hpp"

/// @todo make `let` part of js namespace
struct let
{
    JSvalue value;

    explicit let(int n);
    explicit let(js::number n);
    explicit let(js::string s);
    explicit let(const char *s);

    let operator+(let const &other);
    let operator-(let const &other);
    let operator*(let const &other);
    let operator/(let const &other);

    template <typename T>
    let operator+(T const &other);

    template <typename T>
    let operator-(T const &other);

    template <typename T>
    let operator*(T const &other);

    template <typename T>
    let operator/(T const &other);

    template <typename T>
    friend let operator+(T const &other, let const &me);

    template <typename T>
    friend let operator-(T const &other, let const &me);

    template <typename T>
    friend let operator*(T const &other, let const &me);

    template <typename T>
    friend let operator/(T const &other, let const &me);
};

std::ostream &operator<<(std::ostream &os, let const &me);

#define NUMBER(n) static_cast<js::number>(n)

// macro for operator overloafs with: "let <operatorr> let"
#define LET_OPOO(_o_)                          \
    let let::operator _o_(let const &other)    \
    {                                          \
        let result = std::visit(               \
            [](auto &&x, auto &&y) -> let {    \
                let ret = static_cast<let>(x _o_ y);             \
                return ret; }, \
            this->value, other.value);         \
        return result;                         \
    }

// macro for operator overloads with: "let <operator> <other value>"
#define LET_OPOO_OT(_o_)                  \
    template <typename T>                 \
    let let::operator _o_(T const &other) \
    {                                     \
        let result = std::visit(          \
            [other](auto &&x) -> let {    \
                let ret = static_cast<let>(x _o_ other);             \
                return ret; }, \
            this->value);                 \
        return result;                    \
    }

#define LET_OPOO_OT_FLP(_o_)                        \
    template <typename T>                           \
    let operator _o_(T const &other, let const &me) \
    {                                               \
        let result = std::visit(                    \
            [other](auto &&x) -> let {    \
                let ret = static_cast<let>(other _o_ x);             \
                return ret; },           \
            me.value);                              \
        return result;                              \
    }

LET_OPOO_OT(+)

LET_OPOO_OT(-)

LET_OPOO_OT(*)

LET_OPOO_OT(/)

LET_OPOO_OT_FLP(+)

LET_OPOO_OT_FLP(-)

LET_OPOO_OT_FLP(*)

LET_OPOO_OT_FLP(/)

#endif // __LET_H__