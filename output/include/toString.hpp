#ifndef __TOSTRING_H__
#define __TOSTRING_H__

#include "js.hpp"

js::string toString(js::number value);
js::string toString(js::string value);
js::string toString(js::dynamic _value);
js::string toString(js::array<js::dynamic> value);

#endif // __TOSTRING_H__