#ifndef __COMPARISONOVERLOADS_H__
#define __COMPARISONOVERLOADS_H__

#include <concepts>
#include <compare>

#include "js.hpp"

template <typename T>
concept JSType = std::is_same_v<T, js::number> || 
                 std::is_same_v<T, js::boolean> || 
                 std::is_same_v<T, js::dynamic> ||
                 std::is_same_v<T, js::string> ||
                 JSarray<T>;

#define CHECKBOTH_CONCEPT(macro) (macro<A> && macro<B>)
#define CHECKBOTH_SAME(as) (std::is_same_v<A, as> && std::is_same_v<B, as>)

// @todo dynamic <=> dynamic should have values read with nested visit and call according overload

template<typename A, typename B>
requires(JSType<A> && JSType<B> && 
    !CHECKBOTH_CONCEPT(JSNumeric) && 
    !CHECKBOTH_SAME(js::string)) &&
    !CHECKBOTH_SAME(js::dynamic)
std::strong_ordering operator<=>(A left, B right)
{
    const js::number left_num = toNumber(left);
    const js::number right_num = toNumber(right);

    if(std::isnan(left_num) || std::isnan(right_num))
    {
        return false
    }
    else 
    {
        return left_num <=> right_num;
    }
}

#endif // __COMPARISONOVERLOADS_H__