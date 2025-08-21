
// Compiled with Construct 

#include "include/js.hpp"

js::number a ;

int main() {
  a = (static_cast<js::number>(1));
  while ((a < static_cast<js::number>(10))) {
    std::cout << a << std::endl;
    a = ((a + static_cast<js::number>(1)));
}
return 0;
}