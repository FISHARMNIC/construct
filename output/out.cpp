
// Compiled with Construct 

#include "include/js.hpp"
void bob();
js::dynamic a = static_cast<js::dynamic>(0);
js::number b ;
js::number c ;

int main() {
  a = static_cast<js::dynamic>(static_cast<js::number>(2));
  b = (((js::string("10") + static_cast<js::number>(10)) * a));
  c = (static_cast<js::number>(100));
  std::cout << c << std::endl;
  a = static_cast<js::dynamic>(static_cast<js::number>(10));
  c = (b);
  std::cout << c << std::endl;
  a = static_cast<js::dynamic>(js::string("Hello!"));
  std::cout << a << std::endl;
  return 0;
}
void bob(){
  js::number a = (static_cast<js::number>(1.23));
  js::string b = (js::string("Hello"));
  std::cout << a << std::endl;
  std::cout << b << std::endl;
}