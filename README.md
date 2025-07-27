# Javascript ==> C++ compiler
### Highly WIP
---
* To run use `tsx main.ts` in compiler dir
* Produces semi-readable c++
### Currently implemented:
* Variables
    * assignment + reassignment
    * current types allowed:
        * `string`
        * `number`
    * dynamic re-typing
* four-function math with proper JS type coercion
* functions
    * parameters
    * returning values
    * calling

### Dependencies
* npm
    * tsx or just ts and compile to js
    * Babel traverse and types
    * ESlint
    * chalk
* system
    * clang-tidy and g++
    * c++20

### Running
* `tsx main` in compiler
* modify `INPUTFILE` in that same file


## Example conversion
#### Input:
```JS
function bob(a,b)
{
    let c = a + b;
    return c;
}

let a = bob("HELLO ", 2);
let b = bob(1, 2);
let c = bob("Hello ", "World!");

dbgprint(a);
dbgprint(b);
dbgprint(c);
```
#### Becomes:
```C++
// Compiled with Construct 

#include "include/js.hpp"
js::string bob_version0__(js::string a, js::number b);
js::number bob_version1__(js::number a, js::number b);
js::string bob_version2__(js::string a, js::string b);
js::string a ;
js::number b ;
js::string c ;

int main() {
  a = (bob_version0__((js::string("HELLO ")), (static_cast<js::number>(2))));
  b = (bob_version1__((static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  c = (bob_version2__((js::string("Hello ")), (js::string("World!"))));
  std::cout << a << std::endl;
  std::cout << b << std::endl;
  std::cout << c << std::endl;
  return 0;
}

js::string bob_version0__(js::string a, js::number b){
  js::string c = ((a + b));
  js::string d = (c);
  d = ((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}
js::number bob_version1__(js::number a, js::number b){
  js::number c = ((a + b));
  js::dynamic d = static_cast<js::dynamic>(c);
  d = static_cast<js::dynamic>((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}
js::string bob_version2__(js::string a, js::string b){
  js::string c = ((a + b));
  js::string d = (c);
  d = ((js::string("returning: ") + c));
  std::cout << d << std::endl;
  return ((c));
}
```
`js::number`  = alias for `double`  
`js::string`  = alias for `std::string`  
`js::dynamic` = WIP abuse of `std::variant` with overloads  