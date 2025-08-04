
// Compiled with Construct 

#include "include/js.hpp"
js::dynamic bob_version0__(js::dynamic a, js::number b);
js::string bob_version1__(js::string a, js::string b);
js::dynamic y = static_cast<js::dynamic>(0);
js::string z ;

int main() {
  y = (bob_version0__(static_cast<js::dynamic>(static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  z = (bob_version1__((js::string("Hello ")), (js::string("World!"))));
  std::cout << y << std::endl;
  std::cout << z << std::endl;
  return 0;
}

js::dynamic bob_version0__(js::dynamic a, js::number b){
  a = static_cast<js::dynamic>(js::string("aaaaa"));
  js::dynamic c = ((a + b));
  return ((c));
}
js::string bob_version1__(js::string a, js::string b){
  a = (js::string("aaaaa"));
  js::string c = ((a + b));
  return ((c));
}