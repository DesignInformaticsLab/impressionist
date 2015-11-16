-- psql -U postgres -d postgres -a -f create_database_amt.sql

-- tables for AMT

/* to delete table */
DROP TABLE impressionist_game_table_amt;
DROP TABLE impressionist_object_table_amt;
DROP TABLE impressionist_result_table_amt;
DROP TABLE impressionist_user_table_amt;

/*
object name: name (unique) of the objects
face_per_mesh: count of number of faces on each mesh. Each object can have several meshes and each mesh several faces
num_selections: total count of selections for each face. Updated after every object is IDENTIFIED
*/
CREATE TABLE impressionist_object_table_amt
(
    id serial NOT NULL,
    object_name text,
    face_per_mesh integer[],
--    three_scene_sorted integer[][],
    num_selections integer[],

    PRIMARY KEY(id)
);

/*
game_id: associated with the current guess
round: count of objects having been played in this game
all_selected_id: all faces selected for the current object
duration: time spent on the current object
score: current score
guess: current guess
correct: is the guess correct?
penalty: current selection penalty vector
*/
CREATE TABLE impressionist_result_table_amt
(
    id serial NOT NULL,
    game_id serial,
    round integer,
    all_selected_id integer[],
    duration interval,
    score integer,
    guess text,
    object_name text,
    correct boolean,
    penalty real[],
    computer_player boolean,
    PRIMARY KEY(id)
);

/*
player id: the id of the participant who first played as PLAYER
host id: ... HOST
time: global time of when the game started
*/
CREATE TABLE impressionist_game_table_amt
(
    id serial NOT NULL,
--    player_id VARCHAR(50) UNIQUE NOT NULL,
--    host_id VARCHAR(50) UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    score integer,
    PRIMARY KEY(id)
);

/*
*/
CREATE TABLE impressionist_user_table_amt
(
    id serial NOT NULL,
    user_name VARCHAR(50) UNIQUE NOT NULL,
--    user_password CHAR(60),
    PRIMARY KEY(id)
);