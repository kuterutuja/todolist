//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
  name: "welcome to do list"
});

const item2=new Item({
  name:"hit + buttom to add new item"
});
const item3=new Item({
  name:"<--- hit this to delete item"
});

const defaultitems =[item1,item2,item3]


const listSchema= {
  name: String,
  items: [itemsSchema]
}
const List= mongoose.model("List",listSchema);




app.get("/", function(req, res) {

const day = date.getDate();

Item.find({},function(err,foundItems){

  if (foundItems.length===0){
    Item.insertMany(defaultitems , function(err){
      if (err){
        console.log(err);
    
      } else{
        console.log("successfully saved list of items to DB")
      }
    });
    res.redirect("/")
} else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  
})

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item= new Item({
    name: itemName
  });
  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
 
 
});
app.post("/delete", function(req,res){
  const checkeditemid = req.body.checkbox;
  const listName= req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkeditemid, function(err){
      if(!err){
        console.log("sucessfully deleted checked item");
      }
      res.redirect("/")
    })

  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id: checkeditemid}}},function(err, FoundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });

  }
  
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultitems
      
        });
        list.save();
        res.redirect("/"+customListName)
      }else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
      }
    }

  })

  

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
