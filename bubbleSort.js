module.exports= function (a){
    var swapp;
    var n = a.length-1;
    var x=a;
    // let   = total_count
    do {
        swapp = false;
        for (var i=0; i < n; i++)
        {
            if (x[i].total_count < x[i+1].total_count)
            {
               var temp = x[i];
               x[i] = x[i+1];
               x[i+1] = temp;
               swapp = true;
            }
        }
        n--;
    } while (swapp);
 return x; 
}