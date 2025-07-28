
// Compiled with Construct 

#include "include/js.hpp"
js::number bob_version0__(js::number a, js::number b);
js::number y ;

int main() {
  y = (bob_version0__((static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  std::cout << y << std::endl;
  return 0;
}

js::number bob_version0__(js::number a, js::number b){
  js::number c = ((a + b));
  js::number d = (c);
  d = static_cast<js::dynamic>((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}