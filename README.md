# Javascript ==> C++ compiler
### Highly WIP
---

### Running
* (optional) run tester first to make sure it works properly on your computer
  * cd in `/tester`
  * run `tsx test.ts`
* cd into `/compiler`
* run `tsx main.ts <file in /tests directory>`
* Example: `tsx main.ts 6b.js`

### Currently implemented:
* Produces semi-readable c++
* Variables
    * assignment and reassignment
    * current types allowed:
        * `string`
        * `number`
        * `any`
        * `array<number | string | any>`
    * `any` supports all listed types above
    * dynamic re-typing
    * Muti-types arrays
* four function math with proper JS type coercion
* functions
    * parameters
    * returning values
    * calling

### Dependencies
* npm
    * NodeJS
    * tsx or just ts and compile to js
    * Babel traverse and types
    * ESlint
    * chalk
* system
    * clang-tidy and g++
    * c++20

## Example conversion
#### Input:
```JS
function bob(a,b)
{
    let c = a + b;
    let d = c;
    d = "returning: " + c;
    dbgprint(d);

    return c;
}

let x = bob("HELLO ",2);
let y = bob(1,2);
let z = bob("Hello ", "World!");

dbgprint(x);
dbgprint(y);
dbgprint(z);
```
#### Becomes:
```C++
// Compiled with Construct 

#include "include/js.hpp"
js::string bob_version0__(js::string a, js::number b);
js::number bob_version1__(js::number a, js::number b);
js::string bob_version2__(js::string a, js::string b);
js::string x ;
js::number y ;
js::string z ;

int main() {
  x = (bob_version0__((js::string("HELLO ")), (static_cast<js::number>(2))));
  y = (bob_version1__((static_cast<js::number>(1)),
                      (static_cast<js::number>(2))));
  z = (bob_version2__((js::string("Hello ")), (js::string("World!"))));
  std::cout << x << std::endl;
  std::cout << y << std::endl;
  std::cout << z << std::endl;
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