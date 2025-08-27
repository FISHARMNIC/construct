/* @expects
1
2
3
4
5

@end
*/

if([1] < 10)
{
    dbgprint(1);
}

if("1" < 1)
{
    dbgprint("F1");
}

if([1] == 1)
{
    dbgprint(2);
}

if('5' < 10)
{
    dbgprint(3);
}

// @todo the negative sign here is a unary expression
if(false > -1)
{
    dbgprint(4);
}

// @todo should be no space
// need to implement String vs .toString
// console log has space, normally no space though
// also should be 1,2 not [1, 2]
if([1, 2] == "[1, 2]")
{
    dbgprint(5);
}