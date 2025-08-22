#ifndef __LET_H__
#define __LET_H__

#include "js.hpp"
#include "toNumber.hpp"

#include <concepts>

struct Dynamic
{
    JSvalue value;

    static Dynamic __globalUndefined; // @todo make inherited class that doesnt allow setting (just does nothing)
    static Dynamic __globalPit; // meant to be set to, never read from

    explicit Dynamic();
    explicit Dynamic(int n);
    explicit Dynamic(js::boolean n);
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

    template <typename T>
    Dynamic operator[](T i)
    {
        const js::number index_flt = toNumber(i);
        const size_t index = static_cast<size_t>(index_flt);

        if(index == std::numeric_limits<double>::quiet_NaN() || index < 0)
        {
            return __globalUndefined;
        }
        else if(std::holds_alternative<js::array<Dynamic>>(value))
        {
            const auto& arr = std::get<js::array<Dynamic>>(value).reference;
            const size_t size = arr->size();

            return index < size? arr->at(index) : __globalUndefined;
        }
        else if(std::holds_alternative<js::string>(value))
        {
            const js::string& str = std::get<js::string>(value);
            const size_t size = str.length();

            // note that this wont be the same reference
            // In js strings are immutable anyways
            return index < size? Dynamic(js::string(1, str.at(index))) : __globalUndefined;
        }
        else
        {
            return __globalUndefined;
        }
    }

    /*
    template <typename T, typename O>
    Dynamic set(T i, O v)
    {
        const js::number index_flt = toNumber(i);
        const size_t index = static_cast<size_t>(index_flt);

        if(index == std::numeric_limits<double>::quiet_NaN() || index < 0)
        {
            return __globalUndefined; // @todo should be undefined
        }
        else if(std::holds_alternative<js::array<Dynamic>>(value))
        {
            std::vector<Dynamic> arr = *(std::get<js::array<Dynamic>>(value).reference);
            const size_t size = arr.size();

            if(index < size) 
            {
                if constexpr(std::same_as<Dynamic, O>)
                {
                    arr[index] = v;
                }
                else
                {
                    arr[index] = Dynamic(v);
                }

                return arr[index];

            }
            else
            {
                return __globalUndefined;
            }
        }
        else if(std::holds_alternative<js::string>(value))
        {
            js::string& str = std::get<js::string>(value);
            const size_t size = str.length();

            if(index < size)
            {

            }
            else
            {
                return __globalUndefined;
            }

            return index < size? Dynamic(str.at(index)) : __globalUndefined;
        }
        else
        {
            return __globalUndefined;
        }
    }
    */
};

std::ostream &operator<<(std::ostream &os, Dynamic const &me);

#endif // __LET_H__