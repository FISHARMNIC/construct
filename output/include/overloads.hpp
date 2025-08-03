#ifndef __OVERLOADS_H__
#define __OVERLOADS_H__

#include <variant>
#include "js.hpp"

// fake macros for readability
#define NUMBER(N) N
#define STRING(S) S

#define RULE(otherType, expr) if constexpr(std::same_as<OtherT, otherType>) { return(expr);}
#define ELSE_RULE(otherType, expr) else RULE(otherType, expr)
#define ELSE_FAIL else { std::cout << "ERROR" << std::endl; process.exit(1);}

template <typename OtherT>
requires(!std::same_as<OtherT, js::dynamic>) // use visit for dynamic + dynamic
js::dynamic operator+(const js::dynamic& first_, OtherT second)
{
    const int index = first.value.index();
    switch(index)
    {
        case JSvalues::number: // first<number> + second<any>
        {
            const js::number first_number = std::get<js::number>(first_);

            RULE     (js::number, first_number + NUMBER(second))           // first<number> + second<number> ==> MATH(first + second)
            ELSE_RULE(js::string, toString(first_number) + STRING(second)) // first<number> + second<string> ==> CONCAT(STRING(first) + second)
            ELSE_FAIL
        }
        case JSvalues::string: // first<string> + second<any>
        {
            const js::string first_string = std::get<js::number>(first_);

            RULE      (js::number, first_string + toString(second)) // first<string> + second<number> ==> CONCAT(first + STRING(second))
            ELSE_RULE (js::string, first_string + second)                   // first<string> + second<string> ==> CONCAT(first + second)
            ELSE_FAIL
        }
    }
}

#endif // __OVERLOADS_H__