
// Compiled with Construct 

#include "include/js.hpp"

auto a = js::dynamic2<js::number, js::string>(123);
auto b = js::dynamic2<js::number, js::string>(123);

int main() {
  a + b;
  // std::cout << a << std::endl;
}