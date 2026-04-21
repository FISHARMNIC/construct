let primeCount = 0;
let n = 2;

while(n < 100000) {
    let isPrime = 1;
    let d = 2;
    
    while(d * d <= n) {
        // let dStr = d + "";
        // let dCoerced = dStr * 1;
        // let remainder = n % dCoerced;
        // let remStr = remainder + "";
        // let remNum = remStr * 1;
        // if(remNum == 0) {
        //     isPrime = 0;
        // }
        let remainder = n % d;
        if(remainder == 0)
        {
            isPrime = 0;
        }
        
        d = d + 1;
    }
    
    if(isPrime == 1) {
        primeCount = primeCount + 1;
    }
    
    n = n + 1;
}

// const dbgprint = console.log;

dbgprint(primeCount);