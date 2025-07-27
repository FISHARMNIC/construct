
// Compiled with Construct 

#include "include/js.hpp"
js::number bob_version0__(js::number a, js::number b);
js::string bob_version1__(js::string a, js::string b);
js::number y ;
js::string z ;

int main() {
  y = static_cast<js::number>(
      bob_version0__(static_cast<js::number>(1), static_cast<js::number>(2)));
  z = static_cast<js::string>(
      bob_version1__(js::string("Hello "), js::string("World!")));
  std::cout << y << std::endl;
  std::cout << z << std::endl;
  return 0;
}

js::number bob_version0__(js::number a, js::number b){
  js::number c = static_cast<js::number>(a + b);
  return (static_cast<js::number>(c));
}
js::string bob_version1__(js::string a, js::string b){
  js::string c = static_cast<js::string>(a + b);
  return (static_cast<js::string>(c));
}