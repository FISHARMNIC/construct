#ifndef __TONUMBER_H__
#define __TONUMBER_H__

#include "js.hpp"

js::number toNumber(js::number value);
js::number toNumber(js::string value);
js::number toNumber(js::dynamic _value);
js::number toNumber(js::array<js::dynamic> value);

#endif // __TONUMBER_H__