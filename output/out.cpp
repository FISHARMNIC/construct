
// Compiled with Construct 

#include "include/js.hpp"
js::number a ;
js::number b ;
let c = static_cast<let>(0);
int main() {
  a = static_cast<js::number>(2);
  b = static_cast<js::number>(
      static_cast<js::string>(js::string("10") + static_cast<js::number>(10)) *
      a);
  c = static_cast<let>(static_cast<js::number>(100));
  std::cout << c << std::endl;
  a = static_cast<js::number>(10);
  c = static_cast<let>(b);
  std::cout << c << std::endl;
  c = static_cast<let>(js::string("Hello!"));
  std::cout << c << std::endl;
  return 0;
}
auto bob()
{
  js::number a = static_cast<js::number>(1.23);
  js::string b = static_cast<js::string>(js::string("Hello"));
  std::cout << a << std::endl;
  std::cout << b << std::endl;
}