
// Compiled with Construct 

#include "include/js.hpp"
js::number bob();
js::number a ;
js::number q ;

int main() {
  a = (static_cast<js::number>(10));
  q = (bob());
  std::cout << q << std::endl;
  return 0;
}
js::number bob(){
  js::number c = (a);
  return c;
}