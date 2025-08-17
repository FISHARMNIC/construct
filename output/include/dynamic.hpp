#ifndef __LET_H__
#define __LET_H__

#include "js.hpp"

#include <concepts>

struct Dynamic
{
    JSvalue value;

    explicit Dynamic();
    explicit Dynamic(int n);
    explicit Dynamic(js::number n);
    explicit Dynamic(js::string s);
    explicit Dynamic(const char *s);

    explicit Dynamic(js::array<Dynamic> arr);

    template <typename T>
    requires(!(std::same_as<T, js::array<Dynamic>>))
    explicit Dynamic(js::array<T> arr) {
      std::vector<Dynamic> ref;

      for (T &e : *(arr.reference)) {
        ref.push_back(Dynamic(e));
      }

      value = js::array<Dynamic>(ref);
    }
};

std::ostream &operator<<(std::ostream &os, Dynamic const &me);

#endif // __LET_H__