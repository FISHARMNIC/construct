# Javascript ==> C++ compiler
```JS
// This code can be compiled by Construct!
// The result is a little long though. See below for the compiled code of another example.

let a = 123;
dbgprint(a + 1000); // math

let b = a;
b = "Hello";
b = [1, 2, 3]; // dynamic types

function scale(me)
{
    dbgprint(me * 10);

    return me + " dollar(s)";
}

// templated functions
scale(a);           // a is a number    : 123 * 10 = 1230
scale(b);           // b is a dynamic   :  [1,2,3] * 10 = NaN
let q = scale([1]); // this is an array : [1] * 10 = 10
dbgprint(q);

// proper JS coercion
dbgprint([8000] + " Hello!");
dbgprint(("12360.7079633" - 12345) / [[["5.0"]]]);

let v = 123

// branching
if((a / 100) < 1000)
{
    dbgprint("yup");
    v = "321";
}
else if("pie" < "apple")
{
    dbgprint("hmmm");
    v = [321];
}
else
{
    dbgprint("nope");
    v = false;
}

// branch-dependent types
dbgprint(v);

// loops
let z = 0;
while(z < 3)
{
    dbgprint(z + " bottles");
    z = z + 1;
}

// funky arrays
dbgprint([1, "hi", ["hello", true * false]]);
```

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
      * `boolean`
      * `any`
      * `array<number | string | boolean |any>`
  * `any` supports all listed types above
  * dynamic re-typing
  * arrays with mixed element types
* four function math with proper JS type coercion
* binary comparisons
  * Currently only support number<=>number or string<=>string
* functions
  * parameters
  * returning values
  * calling
* control flow
  * `if` + `else if` + `else`
  * `while` statements

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