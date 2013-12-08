var mongoose=require("mongoose");
mongoose.connect('mongodb://localhost/server');

var cat=mongoose.model('cat',{name: String});
var kitty = new cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
else
console.log("success");
}); 