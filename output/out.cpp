
// Compiled with Construct 

#include "include/js.hpp"
js::string bob_version0__(js::string a, js::number b);
js::number bob_version1__(js::number a, js::number b);
js::string bob_version2__(js::string a, js::string b);
js::string w ;
js::number y ;
js::string z ;

int main() {
  w = (bob_version0__((js::string("HELLO ")), (static_cast<js::number>(2))));
  y = (bob_version1__((static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  z = (bob_version2__((js::string("Hello ")), (js::string("World!"))));
  std::cout << w << std::endl;
  std::cout << y << std::endl;
  std::cout << z << std::endl;
  return 0;
}

js::string bob_version0__(js::string a, js::number b){
  js::string c = ((a + b));
  return ((c));
}
js::number bob_version1__(js::number a, js::number b){
  js::number c = ((a + b));
  return ((c));
}
js::string bob_version2__(js::string a, js::string b){
  js::string c = ((a + b));
  return ((c));
}