
// Compiled with Construct 

#include "include/js.hpp"

js::object bob ;

int main() {
_js_init_();

bob = (static_cast<js::object>(Object::initListType(
    {Object::pairType(
         {("a"), static_cast<js::dynamic>(static_cast<js::number>(123))}),
     Object::pairType(
         {("b"), static_cast<js::dynamic>(static_cast<js::number>(456))})})));
bob[js::string("a")] = static_cast<js::dynamic>(static_cast<js::number>(765));
return 0;
}