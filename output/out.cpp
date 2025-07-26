
// Compiled with Construct 

#include "include/js.hpp"
void bob_version0__(js::number a, js::number b);
void bob_version1__(js::string a, js::string b);

int main() {
  bob_version0__(static_cast<js::number>(1), static_cast<js::number>(2));
  bob_version1__(js::string("Hello "), js::string("World!"));
  return 0; 
}

void bob_version0__(js::number a, js::number b){
  js::number c = static_cast<js::number>(a + b);
  std::cout << c << std::endl;
}
void bob_version1__(js::string a, js::string b){
  js::string c = static_cast<js::string>(a + b);
  std::cout << c << std::endl;
}