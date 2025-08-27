/* @expects
1
2
3
4

@end
*/

if([1] < 10)
{
    dbgprint(1);
}

if("1" < 1)
{
    dbgprint(0);
}

if([1] == 1)
{
    dbgprint(0);
}

if('5' < 10)
{
    dbgprint(2);
}

// @todo the negative sign here is a unary expression
// if(false > -1)
// {
//     dbgprint(3);
// }

if([42, 43] == "42,43")
{
    dbgprint(4);
}