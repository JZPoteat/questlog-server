 # QuestLog

 ### live app: https://questlog.vercel.app
 ### link to client repo:  https://github.com/JZPoteat/questlog-client
 
 ## Hello Adventurer!

Ever feel overwhelemed by your continuously growing backlog of games?

Are you a PC gamer that plays numerous launchers, or do you game on multiple consoles?

Do you ever forget where your games are stored, or do you get sidetracked spending time on games you don't actually want to spend time with? 

Tired of reading meaningless reviews that don't actually tell you anything about games you want?


If you answered yes (or no..) to any of these questions, then you should try QuestLog!

With QuestLog, you'll be able to track all of your current games you are playing.  You can log all sorts of additional information about your game too, such as estimated time remaining to finish the game, and adding the location of the game.  But that's not all!

QuestLog tracks reviews differently than most review sites.  Instead of using an arbitrary point system, we score games based on their worth/quality in dollars.  Now you can feel like your solid 5-10 hour games can compete on a fair and balanced scale with AAA title video games.  

 
 ### API Endpoint: 'https://evening-brushlands-02534.herokuapp.com/api'
 
 All paths requires headers: { 
        "Authorization": "bearer (user auth token)" 
        }
 
 
 path('/games')
 
    GET returns all games by user_name
    
    POST request body: { 
        "title": text, 
        "priority": integer, 
        "est_time": integer, 
        "loc": text, 
        "notes": text, 
        "user_id": integer foreign key references user id
        }

path('/games/:id')
    GET returns the game specified by id to the user

    DELETE deletes the game specified by id.  Can only be deleted if the user has access to game.id, which is granted by the unique user auth token.

    PATCH updates the game specified by id. Update must contain at least one of the following:  

        "title": text, 
        "priority": integer, 
        "est_time": integer, 
        "loc": text, 
        "notes": text, 


path('/reviews')
 
    GET returns all reviews by user_name
    
    POST request body: { 
        "title": text, 
        "rating": integer, 
        "time_played": integer, 
        "review": text, 
        "user_id": integer foreign key references user id
        }

path('/reviews/:id')
    GET returns the reviews specified by id to the user

    DELETE deletes the review specified by id.  Can only be deleted if the user has access to review.id, which is granted by the unique user auth token.

    PATCH updates the game specified by id. Update must contain at least one of the following:  

        "title": text, 
        "rating": integer, 
        "time_played": integer, 
        "review": text, 

path('/auth/login')
    POST validated login credentials sent from the user with the stored user credentials in the database.
    
        body{
            "user_name": text,
            "password": text  
        }

path('/users')
    POST registers a new account in the database.  The user_name must be unique.  Full_name is the user's full name.  The password submitted must be betwen 8 and 72 characters, contain at least one lower case, upper case, number, special character, and cannot contain spaces.

        body{

            "user_name": unique text,
            "full_name": text,
            "password": valid text

        }


### Technologies Used


In this app, we implemented a React client using JavaScript/JSX.  RESTful patterns were used throughout client-server interactions.  The server was built using Express and Node, and we built a relational database using PostgreSQL.  All styling was performed using plain CSS.  

* React
* JavaScript
* Express
* Node
* SQL/PostgreSQL
* JSX
* REST
* HTML
* CSS
