// @todo boolean is autocasted to number in c++ with plus. Just remove toNumber for bool + bool

#ifndef __OVERLOADS_H__
#define __OVERLOADS_H__

#include <variant>
#include <concepts>

#include "js.hpp"

// #region DYNAMICS --------

// fake macros for readability
#define NUMBER(N) N
#define STRING(S) S

// @todo switch to overloaded variant
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

// dynamic + any(!dynamic)
// dynamic + dynamic is defined later in overloads.cpp
template <typename OtherT>
    requires(!std::same_as<OtherT, js::dynamic>)
js::dynamic operator+(const js::dynamic &first_, const OtherT &second)
{
    const JSvalue &first_value = first_.value;
    const size_t index = first_value.index();
    switch (index)
    {
    case JSvalues::number: // first<number> + second<any>
    {
        const js::number first_number = std::get<js::number>(first_value);

        RULE(js::number, first_number + NUMBER(second), js::number)                // first<number> + second<number>  ==> MATH(first + second)
        ELSE_RULE(js::string, toString(first_number) + STRING(second), js::string) // first<number> + second<string>  ==> CONCAT(STRING(first) + second)
                                                                                   // first<number> + second<arr>     ==> CONCAT(STRING(first) + STRING(second))
        ELSE_RULE(js::array<js::dynamic>, toString(first_number) + toString(second), js::string)
        ELSE_RULE(js::boolean, first_number + toNumber(second), js::number)        // first<number> + second<boolean> ==> MATH(first + NUMBER(second))
        ELSE_FAIL
    }
    case JSvalues::string: // first<string> + second<any>
    {
        const js::string first_string = std::get<js::string>(first_value);

        // @todo Always concats to string so dont need this. Just do toString()
        RULE(js::number, first_string + toString(second), js::string)                  // first<string> + second<number>  ==> CONCAT(first + STRING(second))
        ELSE_RULE(js::string, first_string + STRING(second), js::string)               // first<string> + second<string>  ==> CONCAT(first + second)
        ELSE_RULE(js::array<js::dynamic>, first_string + toString(second), js::string) // first<string> + second<arr>     ==> CONCAT(first + STRING(second))
        ELSE_RULE(js::boolean, first_string + toString(second), js::string)            // first<string> + second<boolean> ==> CONCAT(first + STRING(second))
        ELSE_FAIL
    }
    case JSvalues::dynamicArray: // first<array> + second<any>
    {
        const js::array<js::dynamic> first_arr = std::get<js::array<js::dynamic>>(first_value);
        js::string first_string = toString(first_arr);

        // @todo same as above. just use toString()
        RULE(js::number, first_string + toString(second), js::string)                  // first<arr> + second<number>    ==> CONCAT(STRING(first) + STRING(second))
        ELSE_RULE(js::string, first_string + STRING(second), js::string)               // first<arr> + second<string>    ==> CONCAT(STRING(first) + second)
        ELSE_RULE(js::array<js::dynamic>, first_string + toString(second), js::string) // first<arr> + second<arr>       ==> CONCAT(STRING(first) + STRING(second))
        ELSE_RULE(js::boolean, first_string + toString(second), js::string)            // first<arr> + second<boolean>   ==> CONCAT(STRING(first) + STRING(second))
        ELSE_FAIL
    }
    case JSvalues::boolean: // first<boolean> + second<any>
    {
        RULE(js::number, toNumber(first_) + NUMBER(second), js::number)                   // first<boolean> + second<number>  ==> MATH(first + second)
        ELSE_RULE(js::string, toString(first_) + STRING(second), js::string)               // first<boolean> + second<string>  ==> CONCAT(STRING(first) + second)
        ELSE_RULE(js::array<js::dynamic>, toString(first_) + toString(second), js::string) // first<boolean> + second<arr>     ==> CONCAT(STRING(first) + STRING(second))
        ELSE_RULE(js::boolean, toNumber(first_) + toNumber(second), js::string)            // first<boolean> + second<boolean> ==> CONCAT(first + second)
        ELSE_FAIL
    }
    default:
    {
        ERR_FAIL_RUNTIME
    }
    }
}

template <typename OtherT>
    requires(!std::same_as<OtherT, js::dynamic>)
js::dynamic operator+(const OtherT &first, const js::dynamic &second_)
{
    const JSvalue &second_value = second_.value;
    const size_t index = second_value.index();
    switch (index)
    {
    case JSvalues::number:
    {
        const js::number second_number = std::get<js::number>(second_value);

        RULE(js::number, NUMBER(first) + second_number, js::number)               
        ELSE_RULE(js::string, STRING(first) + toString(second_number), js::string) 
                                                                                   
        ELSE_RULE(js::array<js::dynamic>, toString(first) + toString(second_number), js::string)
        ELSE_FAIL
    }
    case JSvalues::string:
    {
        const js::string second_string = std::get<js::string>(second_value);

        RULE(js::number, toString(first) + second_string, js::string)                  
        ELSE_RULE(js::string, STRING(first) + second_string, js::string)           
        ELSE_RULE(js::array<js::dynamic>, toString(first) + second_string, js::string)
        ELSE_FAIL
    }
    case JSvalues::dynamicArray:
    {
        const js::array<js::dynamic> second_arr = std::get<js::array<js::dynamic>>(second_value);
        js::string second_string = toString(second_arr);

        RULE(js::number, toString(first) + second_string, js::string)                 
        ELSE_RULE(js::string, STRING(first) + second_string, js::string)              
        ELSE_RULE(js::array<js::dynamic>, toString(first) + second_string, js::string)
        ELSE_FAIL
    }
    case JSvalues::boolean:
    {
        RULE(js::number, NUMBER(first) + toNumber(second_), js::number)                  
        ELSE_RULE(js::string, STRING(first) + toString(second_), js::string)              
        ELSE_RULE(js::array<js::dynamic>, toString(first) + toString(second_), js::string)
        ELSE_RULE(js::boolean, toNumber(first) + toNumber(second_), js::string)   
        ELSE_FAIL
    }
    default:
    {
        ERR_FAIL_RUNTIME
    }
    }
}

// @todo enforce types only in js namespace
#define DYN_OVERLOAD_FOR(_op_)                                                                                                                                                     \
    template <typename firstT, typename secondT>                                                                                                                                   \
        requires(!(std::same_as<firstT, js::number> && std::same_as<secondT, js::number>)) /*requires(!std::same_as<firstT, js::dynamic> && !std::same_as<secondT, js::dynamic>)*/ \
    js::number operator _op_(const firstT &first, const secondT &second)                                                                                                           \
    {                                                                                                                                                                              \
        return toNumber(first) _op_ toNumber(second);                                                                                                                              \
    }

// template <typename firstT, typename secondT>
//     requires(std::same_as<firstT, js::dynamic> || std::same_as<secondT, js::dynamic>)
// js::dynamic operator _op_(const firstT &first, const secondT &second)
// {
//     return static_cast<js::dynamic>(toNumber(first) _op_ toNumber(second));
// }

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

// @todo dont think i need a concept for this. just do normal template and mark param type as js::array<T>
template <typename T, typename OtherT>
    requires(JSarray<T> || JSarray<OtherT>)
js::string operator+(T first, OtherT second)
{
    return toString(first) + toString(second);
}

// #endregion --------------------------------

#endif // __OVERLOADS_H__