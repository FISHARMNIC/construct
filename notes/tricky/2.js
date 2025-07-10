function random() {}

function joe()
{
    if(random() > 5)
    {
        a = "hello";
    }
    {
        a = 123;
    }
}

let a = 10;

/*
Solution is just to make a program that looks for the same identifier being modified
-> need to be careful, dont look at just any "a", becuase their could be params, etc 