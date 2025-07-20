/*
Tests:
    * No side-effects in dummy mode - Shouldn't re-type "a"
    * Function re-evalutation

!HERE! !IMPORTANT! This test fails
    -> Pushing to bottom level doesn't work
    -> Need to implement better variable type evluation
*/

let a = 1;

function bob()
{
    let q = 123;
    a = q;
}