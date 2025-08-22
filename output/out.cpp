
// Compiled with Construct 

#include "include/js.hpp"

js::number a ;
js::dynamic q = static_cast<js::dynamic>(0);

int main() {
  a = (static_cast<js::number>(5));
  q = static_cast<js::dynamic>(static_cast<js::number>(123));
  if (((a > static_cast<js::number>(6)))) {
    std::cout << static_cast<js::number>(123) << std::endl;
}
else if(((a>static_cast<js::number>(0)))) {
if((false)) {
  std::cout << js::string("wait whattttt") << std::endl;
}
else {
  q = static_cast<js::dynamic>(js::string("hello!"));
  std::cout << static_cast<js::number>(456) << std::endl;
}
}
else {
q = static_cast<js::dynamic>(js::array<js::number>(
    {(static_cast<js::number>(1)), (static_cast<js::number>(2)),
     (static_cast<js::number>(3))}));
}
std::cout << q << std::endl;
return 0;
}