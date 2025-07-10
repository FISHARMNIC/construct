# Iffy variables

* Variables are marked as iffy if their type changes at all throughout the program
* If a variable is marked iffy, it poisons every other variable that relies on it
    * Similar to what NaN does with floats
* Iffy variables are represented with variants, and read with visit (see iffy.cpp)
* Iffy variables should emit a warning, that they drastically slow performance
    * Note that they can also snowball into making everything iffy