#include "include/js.hpp"
#include "include/string.hpp"
js::number a = NUMBER(1.23);
js::string b = js::string("Hello");
int main() {
  js::number a = NUMBER(3.21);
  js::number b = static_cast<js::number>(
      static_cast<js::string>(js::string("10") + NUMBER(10)) * NUMBER(2));
  std::cout << b << std::endl;
}