
// Compiled with Construct 

#include "include/js.hpp"
js::number a;
auto bob() { a = static_cast<js::number>(10); }
a = static_cast<js::number>(5);
int main() { std::cout << a << std::endl; }