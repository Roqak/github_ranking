module.exports= function (a)
{
    var swapp;
    var n = a.length-1;
    var x=a;
    do {
        swapp = false;
        for (var i=0; i < n; i++)
        {
            if (x[i].b < x[i+1].b)
            {
               var temp = x[i].b;
               x[i].b = x[i+1].b;
               x[i+1].b = temp;
               swapp = true;
            }
        }
        n--;
    } while (swapp);
 return x; 
}