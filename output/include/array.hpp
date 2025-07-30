#ifndef __ARRAY_H__
#define __ARRAY_H__

/*
@todo need to implement special type "undefined"
*/


#include "../include/js.hpp"

#include <inttypes.h>
#include <iostream>
#include <memory>
#include <initializer_list>
#include <vector>
#include <variant>
#include <assert.h>

template <typename T>
struct Array
{
    std::shared_ptr<std::vector<T>> reference;

    Array()
    {
        reference = std::make_shared<std::vector<T>>(std::initializer_list<T>{});
    }
    
    Array(std::initializer_list<T> list)
    {
        reference = std::make_shared<std::vector<T>>(list);
    }

    T& operator[](js::number index_dbl)
    {
        size_t index = static_cast<size_t>(index_dbl);

        return (*reference).at(index);
    }

    T& operator[](let& index_dyn);
};


template <typename T>
std::ostream &operator<<(std::ostream &os, Array<T> const &me)
{
    std::cout << '[';

    size_t i = 0;

    std::vector<T>& vec = *me.reference;

    for(; i < vec.size() - 1; i++)
    {
        std::cout << vec[i] << ", ";
    }
    std::cout << vec[i] << ']';
    return os;
}

#endif // __ARRAY_H__