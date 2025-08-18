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
#include <assert.h>

template <typename T>
struct Array
{
    using valueType = T;
    std::shared_ptr<std::vector<T>> reference;

    Array();

    Array(std::initializer_list<T> list);
    
    Array(std::vector<T> list);

    template <typename O>
    explicit Array(Array<O> arr);

    T &operator[](js::number index_dbl);

    T &operator[](Dynamic &index_dyn);

    js::string _toString();

    js::number _toNumber();

    js::boolean _toBoolean();
};

template <typename T>
std::ostream &operator<<(std::ostream &os, Array<T> const &me)
{
    std::cout << '[';

    size_t i = 0;

    std::vector<T> &vec = *me.reference;

    for (; i < vec.size() - 1; i++)
    {
        std::cout << vec[i] << ", ";
    }
    std::cout << vec[i] << ']';
    return os;
}

#endif // __ARRAY_H__