
// Compiled with Construct 

#include "include/js.hpp"
let bob_version0__(let a, js::number b);
js::string bob_version1__(js::string a, js::string b);
let y = static_cast<let>(0);
js::string z ;

int main() {
  y = (bob_version0__(static_cast<let>(static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  z = (bob_version1__((js::string("Hello ")), (js::string("World!"))));
  std::cout << y << std::endl;
  std::cout << z << std::endl;
  return 0;
}

let bob_version0__(let a, js::number b){
  a = static_cast<let>(js::string("aaaaa"));
  let c = ((a + b));
  return ((c));
}
js::string bob_version1__(js::string a, js::string b){
  a = (js::string("aaaaa"));
  js::string c = ((a + b));
  return ((c));
}