#ifndef __ARRAYREFERENCE_H__
#define __ARRAYREFERENCE_H__

#include "js.hpp"

// note that for now, the type of the array must be known

// is this really needed? js::array::reference is already managed
template<typename T>
struct ArrayReference
{
    std::shared_ptr<js::array<T>> reference;

    ArrayReference(js::array<T> arr)
    {
        reference = std::make_shared<js::array<T>>(arr);
    }
};

#endif // __ARRAYREFERENCE_H__