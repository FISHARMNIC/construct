#ifndef __STRING_H__
#define __STRING_H__

#include <concepts>
#include <type_traits>

#include "js.hpp"

#define NUM_STR js::number left, const js::string &right
#define STR_NUM const js::string &left, js::number right
#define STR_STR const js::string &left, const js::string &right

double stod_noexep(const std::string& s);

template <typename T>
concept JSNumeric = std::is_same_v<T, js::number> || std::is_same_v<T, js::boolean>;
               /*|| std::is_same_v<T, js::string>  */;


template <JSNumeric A>
js::string operator+(const A& left, const js::string& right);

template <JSNumeric A>
js::string operator+(const js::string& left, const A& right);

js::number operator-(STR_STR);

template <JSNumeric A>
js::number operator-(const A& left, const js::string& right);

template <JSNumeric A>
js::number operator-(const js::string& left, const A& right);

js::number operator*(STR_STR);

template <JSNumeric A>
js::number operator*(const A& left, const js::string& right);

template <JSNumeric A>
js::number operator*(const js::string& left, const A& right);

js::number operator/(STR_STR);

template <JSNumeric A>
js::number operator/(const A& left, const js::string& right);

template <JSNumeric A>
js::number operator/(const js::string& left, const A& right);

#endif // __STRING_H__