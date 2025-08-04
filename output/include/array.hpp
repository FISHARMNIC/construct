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
    std::shared_ptr<std::vector<T>> reference;

    Array();

    Array(std::initializer_list<T> list);

    T &operator[](js::number index_dbl);

    T &operator[](let &index_dyn);

    js::string _toString();

    js::number _toNumber();
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