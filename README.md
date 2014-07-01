# novlr-play

## install

run `npm install`  
run `bower install`  
run `grunt build`  
 
For development environment run `grunt dev` (will do the same as grunt build but also watch tasks)

Or run 'grunt rest' to run the webserver after building the app.

## database schema

#### user
```
    {
        "_id" : ObjectId("5336f0e5032870f4fb5ef311"),
        "email" : "bob@email.com",
        "firstname" : "Bob",
        "lastname" : "Smith",
        "password" : "pass",
        "novel" : {
            "title" : "Your first novel",
            "date" : NumberLong(1396552818455)
        }
    }
```    

#### chapter
```
    {
        "_id" : ObjectId("5336f538032870f4fb5ef313"),
        "order" : 2,
        "title" : "Chapter 2",
        "text" : "Etiam sed eleifend tellus, ...",
        "userid" : "5336f0e5032870f4fb5ef311"
    }
```

