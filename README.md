# Javascript ==> C++ compiler
### Highly WIP
---
* To run use `tsx main.ts` in compiler dir
* Produces semi-readable c++
* Currently implemented:
    * string and number variables
        * only single assignment right now
    * four-function math with proper JS type coercion
    * function declaration (no calling nor parameters, so essentially `main` is the only thing you can do with this)
    * cout placeholder `dbgprint()`

### Dependencies
* npm
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
let a = 1.23;
let b = "Hello";

function main()
{
    let a = 3.21;
    let b = ("10" + 10) * 2;

    dbgprint(b);
}
```
#### Becomes:
```C++
#include "include/js.hpp"
#include "include/string.hpp"

/* 
js::number and js::string are just aliases
of double and std:string accordingly
*/
js::number a = NUMBER(1.23);
js::string b = js::string("Hello");

int main() {
  js::number a = NUMBER(3.21);
  js::number b = static_cast<js::number>(
      static_cast<js::string>(js::string("10") + NUMBER(10)) * NUMBER(2));
  std::cout << b << std::endl;
}
```