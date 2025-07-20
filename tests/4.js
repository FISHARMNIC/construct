/*
Tests:
    * No side-effects in dummy mode (function eval fails first try, shouldn't create 'q')
    * Function re-evalutation

*/

function bob()
{
    let q = 10;
    a = 2;
}

let a = 1;