
// Compiled with Construct 

#include "include/js.hpp"
let bob_version0__(let a, js::number b);
let bob_version1__(js::string a, js::string b);

int main() {
  bob_version0__(static_cast<let>(static_cast<js::number>(1)),
                 (static_cast<js::number>(2)));
  bob_version1__((js::string("Hello ")), (js::string("World!")));
  return 0;
}

let bob_version0__(let a, js::number b){
  a = static_cast<let>(js::string("aaaaa"));
  let c = ((a + b));
  std::cout << c << std::endl;
}
let bob_version1__(js::string a, js::string b){
  a = (js::string("aaaaa"));
  js::string c = ((a + b));
  std::cout << c << std::endl;
}