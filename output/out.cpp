
// Compiled with Construct 

#include "include/js.hpp"
js::number a = static_cast<js::number>(NUMBER(1.23));
js::string b = static_cast<js::string>(js::string("Hello"));
int main() {
  js::number a = static_cast<js::number>(NUMBER(2));
  js::number b = static_cast<js::number>(static_cast<js::number>(
      static_cast<js::string>(js::string("10") + NUMBER(10)) * a));
  let c = static_cast<let>(NUMBER(100));
  std::cout << c << std::endl;
  a = static_cast<js::number>(NUMBER(10));
  c = static_cast<let>(b);
  std::cout << c << std::endl;
  c = static_cast<let>(js::string("Hello!"));
  std::cout << c << std::endl;
}