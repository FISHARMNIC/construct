#ifndef __OVERLOADS_H__
#define __OVERLOADS_H__

#include <variant>
#include <concepts>

#include "js.hpp"

// fake macros for readability
#define NUMBER(N) N
#define STRING(S) S

#define ERR_FAIL std::cout << "ERROR" << std::endl; exit(1);

#define RULE(otherType, expr) if constexpr(std::same_as<OtherT, otherType>) { return(static_cast<js::dynamic>(expr));}
#define ELSE_RULE(otherType, expr) else RULE(otherType, expr)
#define ELSE_FAIL else { ERR_FAIL }

 // use visit for dynamic + dynamic

template <typename OtherT>
  requires(!std::same_as<OtherT, js::dynamic>)
js::dynamic operator+(const js::dynamic& first_, OtherT second)
{
    const JSvalue& first_value = first_.value;
    const size_t index = first_value.index();
    switch(index)
    {
        case JSvalues::number: // first<number> + second<any>
        {
            const js::number first_number = std::get<js::number>(first_value);

            RULE     (js::number, first_number + NUMBER(second))           // first<number> + second<number> ==> MATH(first + second)
            ELSE_RULE(js::string, toString(first_number) + STRING(second)) // first<number> + second<string> ==> CONCAT(STRING(first) + second)
            ELSE_RULE(js::array<js::dynamic>, toString(first_number) + toString(second))
            ELSE_FAIL
        }
        case JSvalues::string: // first<string> + second<any>
        {
            const js::string first_string = std::get<js::string>(first_value);

            RULE     (js::number, first_string + toString(second))        // first<string> + second<number> ==> CONCAT(first + STRING(second))
            ELSE_RULE(js::string, first_string + second)                  // first<string> + second<string> ==> CONCAT(first + second)
            ELSE_RULE(js::array<js::dynamic>, first_string + toString(second))
            ELSE_FAIL
        }
        case JSvalues::dynamicArray:
        {
            const js::array<js::dynamic> first_arr = std::get<js::array<js::dynamic>>(first_value);
            js::string first_string = toString(first_arr);

            // @ todo some of these are incorrect. deal with correct typeco later
            // some of theme should use equiv of js valueOf
            RULE     (js::number, first_string + toString(second))        // first<string> + second<number> ==> CONCAT(first + STRING(second))
            ELSE_RULE(js::string, first_string + second)                  // first<string> + second<string> ==> CONCAT(first + second)
            ELSE_RULE(js::array<js::dynamic>, first_string + toString(second))
            ELSE_FAIL
        }
        default:
        {
            ERR_FAIL
        }
    }
}

#endif // __OVERLOADS_H__