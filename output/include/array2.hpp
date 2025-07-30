#ifndef __ARRAY2_H__
#define __ARRAY2_H__

#include "js.hpp"

template <typename T>
T& Array<T>::operator[](let& index_dyn)
  {
        const JSvalue value = index_dyn.value;
        assert(std::holds_alternative<js::number>(value));

        return std::get<js::number>(value);
    }

#endif // __ARRAY2_H__