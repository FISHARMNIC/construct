
// Compiled with Construct 

#include "include/js.hpp"

js::dynamic a = static_cast<js::dynamic>(0);
js::dynamic b = static_cast<js::dynamic>(0);

int main() {
  a = static_cast<js::dynamic>(static_cast<js::number>(10));
  a = static_cast<js::dynamic>(js::string("hello"));
  b = static_cast<js::dynamic>(static_cast<js::number>(123));
  b = static_cast<js::dynamic>(js::string(" world"));
  a = ((a + js::string(" bananas")));
  return 0;
}