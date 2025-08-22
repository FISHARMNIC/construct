
// Compiled with Construct 

#include "include/js.hpp"
js::string scale_version0__(js::number me);
js::dynamic scale_version1__(js::dynamic me);
js::string scale_version2__(js::array<js::number> me);
js::number a ;
js::dynamic b = static_cast<js::dynamic>(0);
js::string q ;
js::dynamic v = static_cast<js::dynamic>(0);
js::number z ;

int main() {
  a = (static_cast<js::number>(123));
  std::cout << (a + static_cast<js::number>(1000)) << std::endl;
  b = static_cast<js::dynamic>(a);
  b = static_cast<js::dynamic>(js::string("Hello"));
  b = static_cast<js::dynamic>(js::array<js::number>(
      {(static_cast<js::number>(1)), (static_cast<js::number>(2)),
       (static_cast<js::number>(3))}));
  scale_version0__((a));
  scale_version1__((b));
  q = (scale_version2__(
      (js::array<js::number>({(static_cast<js::number>(1))}))));
  std::cout << q << std::endl;
  std::cout << (js::array<js::number>({(static_cast<js::number>(8000))}) +
                js::string(" Hello!"))
            << std::endl;
  std::cout << ((js::string("12360.7079633") - static_cast<js::number>(12345)) /
                js::array<js::array<js::array<js::string>>>(
                    {(js::array<js::array<js::string>>(
                        {(js::array<js::string>({(js::string("5.0"))}))}))}))
            << std::endl;
  v = static_cast<js::dynamic>(static_cast<js::number>(123));
  if ((((a / static_cast<js::number>(100)) < static_cast<js::number>(1000)))) {
    std::cout << js::string("yup") << std::endl;
    v = static_cast<js::dynamic>(js::string("321"));
}
else if(((js::string("pie")<js::string("apple")))) {
  std::cout << js::string("hmmm") << std::endl;
  v = static_cast<js::dynamic>(
      js::array<js::number>({(static_cast<js::number>(321))}));
}
else {
  std::cout << js::string("nope") << std::endl;
  v = static_cast<js::dynamic>(false);
}
std::cout << v << std::endl;
z = (static_cast<js::number>(0));
while(((z<static_cast<js::number>(3)))) {
  std::cout << (z + js::string(" bottles")) << std::endl;
  z = ((z + static_cast<js::number>(1)));
}
std::cout << js::array<js::dynamic>(
                 {static_cast<js::dynamic>(static_cast<js::number>(1)),
                  static_cast<js::dynamic>(js::string("hi")),
                  static_cast<js::dynamic>(js::array<js::dynamic>(
                      {static_cast<js::dynamic>(js::string("hello")),
                       static_cast<js::dynamic>((true * false))}))})
          << std::endl;
return 0;
}

js::string scale_version0__(js::number me){
std::cout << (me * static_cast<js::number>(10)) << std::endl;
return (((me + js::string(" dollar(s)"))));
}
js::dynamic scale_version1__(js::dynamic me){
std::cout << (me * static_cast<js::number>(10)) << std::endl;
return (((me + js::string(" dollar(s)"))));
}
js::string scale_version2__(js::array<js::number> me){
std::cout << (me * static_cast<js::number>(10)) << std::endl;
return (((me + js::string(" dollar(s)"))));
}