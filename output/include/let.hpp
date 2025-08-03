#ifndef __LET_H__
#define __LET_H__

#include "js.hpp"

/// @todo make `let` part of js namespace
struct let
{
    JSvalue value;
    
    explicit let();
    explicit let(js::number n);
    explicit let(js::string s);
    explicit let(const char *s);
};

std::ostream &operator<<(std::ostream &os, let const &me);

#endif // __LET_H__