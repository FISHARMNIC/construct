#ifndef __STRING2_H__
#define __STRING2_H__

#include <concepts>
#include <type_traits>

#include "js.hpp"

template <JSNumeric A>
js::string operator+(const A& left, const js::string& right)
{
    return toString(left) + right;
}

template <JSNumeric A>
js::string operator+(const js::string& left, const A& right)
{
    return left + toString(right);
}

template <JSNumeric A>
js::number operator-(const A& left, const js::string& right)
{
    return left - stod_noexep(right);
}

template <JSNumeric A>
js::number operator-(const js::string& left, const A& right)
{
    return stod_noexep(left) - right;
}

template <JSNumeric A>
js::number operator*(const A& left, const js::string& right)
{
    return left * stod_noexep(right);
}

template <JSNumeric A>
js::number operator*(const js::string& left, const A& right)
{
    return stod_noexep(left) * right;
}

template <JSNumeric A>
js::number operator/(const A& left, const js::string& right)
{
    return left / stod_noexep(right);
}

template <JSNumeric A>
js::number operator/(const js::string& left, const A& right)
{
    return stod_noexep(left) / right;
}

#endif // __STRING_H__