
// Compiled with Construct 

#include "include/js.hpp"

js::dynamic a = static_cast<js::dynamic>(0);
js::dynamic b = static_cast<js::dynamic>(0);
js::dynamic c = static_cast<js::dynamic>(0);

int main() {
  a = static_cast<js::dynamic>(static_cast<js::number>(2));
  b = (((js::string("10") + static_cast<js::number>(10)) * a));
  c = static_cast<js::dynamic>(static_cast<js::number>(100));
  std::cout << c << std::endl;
  a = static_cast<js::dynamic>(static_cast<js::number>(10));
  c = (b);
  std::cout << c << std::endl;
  a = static_cast<js::dynamic>(js::string("Hello!"));
  std::cout << a << std::endl;
  return 0;
}