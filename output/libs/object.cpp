#include <unordered_map>
#include <memory>
#include "../include/js.hpp"

Object::Object() : properties(std::make_shared<Object::mapType>())
{
}

Object::Object(Object::initListType list)
{
    properties = std::make_shared<Object::mapType>(list);
}

Object& Object::operator=(Object::initListType list)
{
    properties = std::make_shared<Object::mapType>(list);

    return *this;
}

// todo take object from other object. dont make shared just read ptr

js::string Object::_toString()
{
    // Object::mapType& props = *properties;
    // @todo 
    // if(props.contains("toString"))
    // {

    // }
    // else
    // {
    return "[Object object]";
    // }
}

// js::number Object::_toNumber()
// {
//     // if contains valueOf
// }

// @todo toNumber should call value off
// might need to rework the system of toNumber string vs bool