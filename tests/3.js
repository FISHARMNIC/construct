/*
Tests:
    * Variable encountered before declaration (in terms of top-to-bottom evaluation)
    * Function re-evaluation when ready
*/

function bob()
{
    a = 10;
}

let a = 5;
dbgprint(a);