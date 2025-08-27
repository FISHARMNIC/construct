
// Compiled with Construct 

#include "include/js.hpp"


int main() {
_js_init_();

if(((js::array<js::number>(std::initializer_list<js::number>{(static_cast<js::number>(1))})<static_cast<js::number>(10)))) {
  std::cout << static_cast<js::number>(1) << std::endl;
}
if(((js::string("1")<static_cast<js::number>(1)))) {
  std::cout << static_cast<js::number>(0) << std::endl;
}
if(((js::array<js::number>(std::initializer_list<js::number>{(static_cast<js::number>(1))})==static_cast<js::number>(1)))) {
  std::cout << static_cast<js::number>(0) << std::endl;
}
if(((js::string("5")<static_cast<js::number>(10)))) {
  std::cout << static_cast<js::number>(2) << std::endl;
}
if(((js::array<js::number>(std::initializer_list<js::number>{(static_cast<js::number>(42)),(static_cast<js::number>(43))})==js::string("42,43")))) {
  std::cout << static_cast<js::number>(4) << std::endl;
}
return 0;
}