
// Compiled with Construct 

#include "include/js.hpp"

js::array<js::number> a ;
js::string b ;

int main() {
  a = (js::array<js::number>({(static_cast<js::number>(1)),
                              (static_cast<js::number>(2)),
                              (static_cast<js::number>(3))}));
  a[static_cast<js::number>(1)] = a[static_cast<js::number>(0)];
  b = ((a + js::string("HI")));
  std::cout << b << std::endl;
  return 0;
}