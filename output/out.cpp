
// Compiled with Construct 

#include "include/js.hpp"
void bob();
js::number a ;
js::number b ;
js::dynamic c = static_cast<js::dynamic>(0);

int main() {
  a = (static_cast<js::number>(2));
  b = (((js::string("10") + static_cast<js::number>(10)) * a));
  c = static_cast<js::dynamic>(static_cast<js::number>(100));
  std::cout << c << std::endl;
  a = (static_cast<js::number>(10));
  c = static_cast<js::dynamic>(b);
  std::cout << c << std::endl;
  c = static_cast<js::dynamic>(js::string("Hello!"));
  std::cout << c << std::endl;
  return 0;
}
void bob(){
  js::number a = (static_cast<js::number>(1.23));
  js::string b = (js::string("Hello"));
  std::cout << a << std::endl;
  std::cout << b << std::endl;
}