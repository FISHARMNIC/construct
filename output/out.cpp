
// Compiled with Construct 

#include "include/js.hpp"

js::array<js::dynamic> a ;
js::array<js::dynamic> b ;

int main() {
  a = js::array<js::dynamic>(js::array<js::number>(
      {(static_cast<js::number>(1)), (static_cast<js::number>(2)),
       (static_cast<js::number>(3))}));
  b = (js::array<js::dynamic>(
      {static_cast<js::dynamic>(static_cast<js::number>(100)),
       static_cast<js::dynamic>(js::string("Hi")),
       static_cast<js::dynamic>(a)}));
  a[static_cast<js::number>(2)] =
      static_cast<js::dynamic>(static_cast<js::number>(4));
  std::cout << b << std::endl;
  return 0;
}