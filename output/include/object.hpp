#ifndef __OBJECT_H__
#define __OBJECT_H__

#include <unordered_map>
#include <memory>
#include <concepts>
#include "../include/js.hpp"

class Object // : Prototype
{
    public: 
    using mapType = std::unordered_map<js::string, js::dynamic>;
    using pairType = std::pair<const js::string, js::dynamic>;
    using initListType = std::initializer_list<pairType>;

    private: 
    std::shared_ptr<mapType> properties;

    public: 

    explicit Object();

    explicit Object(initListType list);

    Object& operator=(initListType list);

    template<typename T>
    requires(std::is_same_v<T, js::string> || std::is_same_v<T, js::number>)
    js::dynamic operator[](T index)
    {
        js::string index_str;
        if constexpr(std::is_same_v<T, js::number>)
        {
            index_str = stod_noexep(index);
        }
        else
        {
            index_str = index;
        }

        auto props = *properties;

        if(props.contains(index_str))
        {
            return props[index_str];
        }
        else
        {
            // @todo make actual undefined -> inherited class of dynamic that blocks writes
            return js::dynamic::__globalUndefined;
        }
    }    

    js::string _toString();
};

#endif // __OBJECT_H__