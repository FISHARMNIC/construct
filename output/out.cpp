
// Compiled with Construct 

#include "include/js.hpp"

js::number a ;
js::array<js::number> b ;
js::dynamic c = static_cast<js::dynamic>(0);

int main() {
  a = (static_cast<js::number>(123));
  b = (js::array<js::number>({(static_cast<js::number>(1)),
                              (static_cast<js::number>(2)),
                              ((a + static_cast<js::number>(10)))}));
  std::cout << b << std::endl;
  c = static_cast<js::dynamic>(js::string("hello!"));
  c = static_cast<js::dynamic>(static_cast<js::number>(1000));
  if (((a > static_cast<js::number>(100)))) {
    while (((a < static_cast<js::number>(130)))) {
      std::cout << a << std::endl;
      a = ((a + static_cast<js::number>(1)));
    }
    c = static_cast<js::dynamic>((a * static_cast<js::number>(5)));
    std::cout << ((js::array<js::number>({(static_cast<js::number>(10))}) *
                   static_cast<js::number>(10)) +
                  js::string(" chickens"))
              << std::endl;
    std::cout << c << std::endl;
}
else {
  std::cout << js::array<js::dynamic>(
                   {static_cast<js::dynamic>(js::string("whatttttt")),
                    static_cast<js::dynamic>(static_cast<js::number>(2)),
                    static_cast<js::dynamic>(static_cast<js::number>(3))})
            << std::endl;
}
return 0;
}