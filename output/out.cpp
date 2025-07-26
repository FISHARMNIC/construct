
// Compiled with Construct 

#include "include/js.hpp"
void bob_version0__(js::number a, js::number b);
js::number a ;
js::number b ;

int main() {
  bob_version0__(static_cast<js::number>(1), static_cast<js::number>(2));
  return 0;
}

void bob_version0__(js::number a, js::number b){
  js::number c = static_cast<js::number>(a + b);
  std::cout << c << std::endl;
}