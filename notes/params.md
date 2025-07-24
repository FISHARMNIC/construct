!HERE! !IMPORTANT! See this

# Parameters

Parameter types are flexible and depend on the caller. This makes it tricky to compile.
Possible solutions:

USING THIS ONE:
1) Compiler templates the functions manually with overloads
    * Functions with parameters aren't evaluated until a call   
        * Essentially templates, but not explicitly creating it as such in c++
        * Template is stored in the compiler
    * When the function is called (bob example) with types A and B
        * Compiler duplicates function template, and gives parameters "a" and "b" their corresponding types
        * Compiler evaluates the function template and appends output to the file
            * Allows the compiler to see what the return type should be

2) All params are casted to iffy

```js
function bob(a,b)
{
    let c = a * b;
    return c;
}
```
===> 
```c++
let bob(let a, let b)
{
    let c = a * b;
    return c;
}
```

3) Functions are templated
```js
function bob(a,b)
{
    let c = a + b;
    return c;
}

bob(123, 456);
bob("Hello", " World");
```
===>
```c++
template<typename T_a, typename T_b>
auto bob(T_a a, T_b b)
{
    auto c = a + b;
    return c;
}

```