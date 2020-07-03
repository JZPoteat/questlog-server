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