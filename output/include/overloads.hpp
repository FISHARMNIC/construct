#ifndef __OVERLOADS_H__
#define __OVERLOADS_H__

#include <variant>
#include <concepts>

#include "js.hpp"

// #region DYNAMICS --------

// fake macros for readability
#define NUMBER(N) N
#define STRING(S) S

#define ERR_FAIL_RUNTIME               \
    std::cout << "ERROR" << std::endl; \
    exit(1);
#define ERR_FAIL_STATIC static_assert(!std::is_same_v<OtherT, OtherT>, "Unable to handle types");
#define RULE(otherType, expr, resultType)                                                                                \
    if constexpr (std::same_as<OtherT, otherType>)                                                                       \
    {                                                                                                                    \
        static_assert(std::is_same_v<decltype(expr), resultType>, "Evaluated type does not match expected return type"); \
        return (static_cast<js::dynamic>(expr));                                                                         \
    }
#define ELSE_RULE(otherType, expr, resultType) else RULE(otherType, expr, resultType)
#define ELSE_FAIL       \
    else                \
    {                   \
        ERR_FAIL_STATIC \
    }

// @todo need to add flipped one too

// dynamic + any(!dynamic)
template <typename OtherT>
    requires(!std::same_as<OtherT, js::dynamic>)
js::dynamic operator+(const js::dynamic &first_, OtherT &second)
{
    const JSvalue &first_value = first_.value;
    const size_t index = first_value.index();
    switch (index)
    {
    case JSvalues::number: // first<number> + second<any>
    {
        const js::number first_number = std::get<js::number>(first_value);

        RULE(js::number, first_number + NUMBER(second), js::number)                // first<number> + second<number> ==> MATH(first + second)
        ELSE_RULE(js::string, toString(first_number) + STRING(second), js::string) // first<number> + second<string> ==> CONCAT(STRING(first) + second)
                                                                                   // first<number> + second<arr>    ==> CONCAT(STRING(first) + STRING(second))
        ELSE_RULE(js::array<js::dynamic>, toString(first_number) + toString(second), js::string)
        ELSE_FAIL
    }
    case JSvalues::string: // first<string> + second<any>
    {
        const js::string first_string = std::get<js::string>(first_value);

        RULE(js::number, first_string + toString(second), js::string)                  // first<string> + second<number> ==> CONCAT(first + STRING(second))
        ELSE_RULE(js::string, first_string + STRING(second), js::string)               // first<string> + second<string> ==> CONCAT(first + second)
        ELSE_RULE(js::array<js::dynamic>, first_string + toString(second), js::string) // first<string> + second<arr>    ==> CONCAT(first + STRING(second))
        ELSE_FAIL
    }
    case JSvalues::dynamicArray:
    {
        const js::array<js::dynamic> first_arr = std::get<js::array<js::dynamic>>(first_value);
        js::string first_string = toString(first_arr);

        RULE(js::number, first_string + toString(second), js::string)                  // first<arr> + second<number>    ==> CONCAT(STRING(first) + STRING(second))
        ELSE_RULE(js::string, first_string + second, js::string)                       // first<arr> + second<string>    ==> CONCAT(STRING(first) + second)
        ELSE_RULE(js::array<js::dynamic>, first_string + toString(second), js::string) // first<arr> + second<arr>       ==> CONCAT(STRING(first) + STRING(second))
        ELSE_FAIL
    }
    default:
    {
        ERR_FAIL_RUNTIME
    }
    }
}

#define DYN_OVERLOAD_FOR(_op_)                                                              \
    template <typename firstT, typename secondT>                                            \
        requires(!std::same_as<firstT, js::dynamic> && !std::same_as<secondT, js::dynamic>) \
    js::number operator _op_(const firstT &first, const secondT &second)                    \
    {                                                                                       \
        return toNumber(first) _op_ toNumber(second);                                       \
    }                                                                                       \
    template <typename firstT, typename secondT>                                            \
        requires(std::same_as<firstT, js::dynamic> || std::same_as<secondT, js::dynamic>)   \
    js::dynamic operator _op_(const firstT &first, const secondT &second)                   \
    {                                                                                       \
        return static_cast<js::dynamic>(toNumber(first) _op_ toNumber(second));             \
    }

// All of the other maths attempt to do: toNumber(left) (op) toNumber(right)
// This also creates the overloads for dynamic (op) any which does the same thing as above comment, but returns as a dynamic
DYN_OVERLOAD_FOR(-)
DYN_OVERLOAD_FOR(*)
DYN_OVERLOAD_FOR(/)

js::dynamic operator+(const js::dynamic &first, const js::dynamic &second);

// #endregion --------------------------------

// #region Arrays --------

template <typename T>
concept JSarray = std::same_as<T, js::array<typename T::valueType>>;

template <typename T, typename OtherT>
    requires(JSarray<T> || JSarray<OtherT>)
js::string operator+(T first, OtherT second)
{
    return toString(first) + toString(second);
}

// #endregion --------------------------------

#endif // __OVERLOADS_H__