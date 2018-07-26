function f() {
    let n = 0;
    let moving = 0.367;
    let alpha = 0.2;
    let inv_alpha = 1-alpha;
    for(;;) {
        n++;
        let xs = new Array(n);
        for(let i=0; i<n; i++) {
            xs[i]=0
        }
        for(let i=0; i<n; i++) {
            let x = Math.round(Math.random()*(n-1));
            xs[x] ++;
        }
        let acc=0;
        for(let i=0; i<n; i++) {
            if(xs[i]==0) {
                acc++
            }
        }
        let c=acc/n;
        moving = moving * inv_alpha + c * alpha;
 //       console.log({moving,c});
        print_2(moving+'',c+'',n)
        continue;
        let p = Math.round(acc/n*100*100)/100;
        let [a,b] = fac(acc/n);
        let s=a+'/'+b;
        for(; s.length<10;) {
            if(s.length%2==0) {
                s=' '+s;
            } else {
                s+=' ';
            }
        }
        console.log(`${acc}/${n} (${p}%) ${s}`);
    }
}
function print_2(a,b,n){
  for(;a.length<19;a+=' ');
  for(;b.length<19;b+=' ');
  console.log('moving: '+a+' c: '+b+' n: '+n);
}
function rough(x){
  return Math.round(x*100)/100;
}
function fac(x) {
    let a=1;
    let b=1;
    for(;;) {
        let r = a/b;
        let diff = r - x;
//        console.log({diff})
        if(Math.abs(diff) < 0.00001) {
            return [a,b];
        }
        if(diff > 0) {
            b++
        } else {
            a++
        }
    }
}
f();
