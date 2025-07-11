#include "include/js.hpp"
#include "include/string.hpp"
js::number a = NUMBER(1.23);
js::string b = js::string("Hello");
int main() {
  js::number a = NUMBER(2);
  js::number b = static_cast<js::number>(
      static_cast<js::string>(js::string("10") + NUMBER(10)) * a);
  js::number c = NUMBER(100);
  std::cout << c << std::endl;
  a = NUMBER(10);
  c = b;
  std::cout << b << std::endl;
}