#ifndef __ARRAY2_H__
#define __ARRAY2_H__

#include <variant>
#include <initializer_list>
#include <limits>

#include "js.hpp"

template <typename T>
Array<T>::Array()
{
    reference = std::make_shared<std::vector<T>>(std::initializer_list<T>{});
}

template <typename T>
Array<T>::Array(std::initializer_list<T> list)
{
    reference = std::make_shared<std::vector<T>>(list);
}

template <typename T>
T &Array<T>::operator[](js::number index_dbl)
{
    size_t index = static_cast<size_t>(index_dbl);

    return (*reference).at(index);
}

template <typename T>
T &Array<T>::operator[](let &index_dyn)
{
    const JSvalue& value = index_dyn.value;
    assert(std::holds_alternative<js::number>(value));

    return std::get<js::number>(value);
}

template <typename T>
js::string Array<T>::_toString()
{
    std::string output = "";
    std::vector<T> arr = *reference;
    size_t size = arr.size();

    if(size == 0)
    {
        return output;
    }

    size_t i = 0;
    for(; i < size - 1; i++)
    {
        output += toString(arr[i]) + ",";
    }

    return output + toString(arr[i]);
}

template <typename T>
js::number Array<T>::_toNumber()
{
    const auto& list = *reference;
    const size_t size = list.size();
    if(size == 1)
    {
        return toNumber(list[0]);
    }
    else
    {
        return std::numeric_limits<double>::quiet_NaN();
    }

}

#endif // __ARRAY2_H__