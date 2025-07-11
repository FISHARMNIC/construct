
#include "include/js.hpp"
js::number a = NUMBER(1.23);
js::string b = js::string("Hello");
int main() {
  js::number a = NUMBER(3.21);
  js::number b = ((NUMBER(5) + NUMBER(10)) * NUMBER(2));
}