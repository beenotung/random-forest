function f(){
  let n = 1000000;
  let acc=0;
  let count=0;
  let xs = new Array(n);
  for(;;){
    count++;
    for(let i=0;i<n;i++){
      xs[i]=1;
    }
    for(let i=0;i<n;i++){
      xs[Math.round(Math.random()*(n-1))]=0;
    }
    let c=0;
    for(let i=0;i<n;i++){
      c+=xs[i];
    }
    acc+=c;
    console.log('avg:',format(acc/n/count),'acc:',format(c/n),'count:',count);
  }
}
function format(x){
  for(x+='';x.length<19;x+=' ');
  return x;
}
f();
