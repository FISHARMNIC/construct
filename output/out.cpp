
// Compiled with Construct 

#include "include/js.hpp"

js::array<js::number> a ;

int main() {
  a = (js::array<js::number>({(static_cast<js::number>(1)),
                              (static_cast<js::number>(2)),
                              (static_cast<js::number>(3))}));
  std::cout << a << std::endl;
  return 0;
}