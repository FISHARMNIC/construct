
// Compiled with Construct 

#include "include/js.hpp"
js::string bob_version0__(js::string a, js::number b);
js::number bob_version1__(js::number a, js::number b);
js::string bob_version2__(js::string a, js::string b);
js::string a ;
js::number b ;
js::string c ;

int main() {
  a = (bob_version0__((js::string("HELLO ")), (static_cast<js::number>(2))));
  b = (bob_version1__((static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  c = (bob_version2__((js::string("Hello ")), (js::string("World!"))));
  std::cout << a << std::endl;
  std::cout << b << std::endl;
  std::cout << c << std::endl;
  return 0;
}

js::string bob_version0__(js::string a, js::number b){
  js::string c = ((a + b));
  js::string d = (c);
  d = ((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}
js::number bob_version1__(js::number a, js::number b){
  js::number c = ((a + b));
  js::dynamic d = static_cast<js::dynamic>(c);
  d = static_cast<js::dynamic>((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}
js::string bob_version2__(js::string a, js::string b){
  js::string c = ((a + b));
  js::string d = (c);
  d = ((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}