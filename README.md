# Javascript ==> C++ compiler
### Highly WIP
---
* To run use `tsx main.ts` in compiler dir
* Produces semi-readable c++
* Currently implemented:
    * string and number variables
        * Simple variable assignment + reassignment
        * reassignment is limited and will often fallback to `lets` for now (see below)
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
// Global variables
let a = 1.23;
let b = "Hello";

// Functions (no params no return yet)
function main()
{
    // Proper scope handling (this a != global a) 
    let a = 2;

    // Proper JS type coercion (only for 4-main math for now)
    // note that flipping these two decs causes lookahead issues since c is reassigned to b, which won't be declared
    // still works but forces c to be a "let" instead
    let b = ("10" + 10) * a;
    let c = 100;

    // 100
    dbgprint(c);

    // Reassignment
    a = 10;
    c = b;

    // c = b = ("10" + 10) * 2 = "1010" * 2 = number 2020
    dbgprint(c);

    // Re-typing
    c = "Hello!";

    dbgprint(c);
}
```
#### Becomes:
```C++

// Compiled with Construct 

#include "include/js.hpp"
js::number a = static_cast<js::number>(1.23);
js::string b = static_cast<js::string>(js::string("Hello"));
int main() {
  js::number a = static_cast<js::number>(2);
  js::number b = static_cast<js::number>(static_cast<js::string>(js::string("10") + static_cast<js::number>(10)) * a);
  let c = static_cast<let>(static_cast<js::number>(100));
  std::cout << c << std::endl;
  a = static_cast<js::number>(10);
  c = static_cast<let>(b);
  std::cout << c << std::endl;
  c = static_cast<let>(js::string("Hello!"));
  std::cout << c << std::endl;
}
```
`js::number` = alias for `double`  
`js::string` = alias for `std::string`  
`let` = WIP abuse of `std::variant` with overloads  