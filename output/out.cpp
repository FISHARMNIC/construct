
// Compiled with Construct 

#include "include/js.hpp"
void bob_version0__(js::array<js::number> a, js::number b);
void bob_version1__(js::string a, js::number b);

int main() {
  bob_version0__((js::array<js::number>({(static_cast<js::number>(2))})),
                 (static_cast<js::number>(10)));
  bob_version1__((js::string("5")), (static_cast<js::number>(2)));
  return 0;
}

void bob_version0__(js::array<js::number> a, js::number b){
  js::number c = ((a * b));
  std::cout << c << std::endl;
}
void bob_version1__(js::string a, js::number b){
  js::number c = ((a * b));
  std::cout << c << std::endl;
}