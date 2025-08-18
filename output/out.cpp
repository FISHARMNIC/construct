
// Compiled with Construct 

#include "include/js.hpp"

js::number a ;
js::boolean b ;
js::string c ;

int main() {
  a = (static_cast<js::number>(0));
  b = (true);
  c = ((b + js::string("123")));
  std::cout << c << std::endl;
  return 0;
}