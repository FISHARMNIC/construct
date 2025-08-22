
// Compiled with Construct 

#include "include/js.hpp"

js::number a ;

int main() {
  a = (static_cast<js::number>(5));
  if ((a > static_cast<js::number>(6))) {
    std::cout << static_cast<js::number>(123) << std::endl;
}
else {
  std::cout << static_cast<js::number>(456) << std::endl;
}
return 0;
}