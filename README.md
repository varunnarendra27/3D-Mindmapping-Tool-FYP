# USER MANUAL

This software requires a few packages and libraries to run effectively.
-	Node.js
-	Three.js
-	Express.js
-	Pg
-	Editor.js

# Downloading Node.js
Navigate to https://nodejs.org/en/download/

- You will want to download v18.20.0 in order for this to run smoothly with the other packages used for this software. Later versions may encounter issues. 

Make sure you download for the operating system and architecture that you are running.

# Installing Three.js
Once node.js is installed, navigate to the directory where the project is saved and run the following command to install Three.js:

    npm install --save three

For more information, please visit: https://threejs.org/docs/#manual/en/introduction/Installation

# Installing Vite.js
Please run the following command to download Vite.js in the same directory as the project:
    
    npm install --save-dev vite

Please visit https://v4.vitejs.dev/guide/ if you require more information

# Installing Express.js
Please run the following command to install Express.js in the directory where the project is saved:

    npm install express

For more information, please visit: https://expressjs.com/en/starter/installing.html

# Installing Cors
Please run the following command to install cors in the directory where the project is saved:

    npm install cors

For more information, please visit https://www.npmjs.com/package/cors

# Installing Editor.js
Please run the following command to install Editor.js in the directory where the project is saved:

    npm i @editorjs/editorjs –save

For more information, please visit https://editorjs.io/getting-started/

# Installing concurrently
Please run the following command to install concurrently in the directory where the project is saved:

    npm i -g concurrently
For more information, please visit https://www.npmjs.com/package/concurrently#installation

# Installing Postgres.js
Please run the following command to install Postgres.js in the same directory as the project:

    npm install postgres

Please visit https://www.npmjs.com/package/postgres if you require more information

# Downloading PostgreSQL
Please navigate to https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Please choose your correct operating system and download version 15.6.

Once installed, you will be met with an interface where you can create a new database by clicking the plus icon on the bottom left. Call the new database ‘mindmaps’

Please pay attention which port number PostgreSQL is running on. This is visible in the top left of the menu. 

# Updating server.cjs
Please navigate to the server.cjs file in the project. You will see the following code:

const Pool = require('pg').Pool
const pool = new Pool({
    user:"postgres",
    host: "localhost",
    database: "mindmaps", //Installation guide: Replace with your database name if you changed the name
    password: "", //Installation guide: Add your password if you created one
    port: 5432 //Make sure this matches the port number that your server is running on
});

Make sure your port number matches the port number displayed in the program. If not, update it to match.
If you have created a password, or decided to call your database something different, please update that too.

# Initialising database
Please click on your newly created database to open the terminal in the database directory. Here you will have to enter the following queries to initialise the database. Please note that you should not change the queries below. It might be beneficial to insert the queries into the database one at a time
# Initialising tbl_user
CREATE TABLE tbl_user (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(30),
    password VARCHAR(30)
);


# Initialising tbl_notes
CREATE TABLE tbl_notes (
    noteid TEXT PRIMARY KEY,
    note_coordinate_x DECIMAL,
    note_coordinate_y DECIMAL,
    note_coordinate_z DECIMAL,
    note_title VARCHAR(30),
    note_description TEXT,
    connected_notes TEXT
);



CREATE SEQUENCE tbl_notes_sequence START 1;


CREATE OR REPLACE FUNCTION update_note_id_format()
RETURNS TRIGGER AS $$
BEGIN
    NEW.noteID := 'n' || nextval('tbl_notes_sequence');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER before_insert_tbl_notes
BEFORE INSERT ON tbl_notes
FOR EACH ROW
EXECUTE FUNCTION update_note_id_format();

# Initialising tbl_note_link
CREATE TABLE tbl_note_link (
    notelinkid TEXT PRIMARY KEY,
    note_title VARCHAR(30),
    notes_description VARCHAR(30),
    note_head TEXT
);


CREATE SEQUENCE tbl_note_link_sequence START 1;

CREATE OR REPLACE FUNCTION update_note_link_id_format()
RETURNS TRIGGER AS $$
BEGIN
    NEW.notelinkid := 'nl' || nextval('tbl_note_link_sequence ');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_tbl_note_link
BEFORE INSERT ON tbl_note_link
FOR EACH ROW
EXECUTE FUNCTION update_note_link_id_format();

# Initialising tbl_user_notes
CREATE TABLE tbl_user_notes (
    usernotesid TEXT PRIMARY KEY,
    userid INTEGER REFERENCES tbl_user(userid),
    notelinkid TEXT REFERENCES tbl_note_link(notelinkid)
);



CREATE SEQUENCE tbl_user_note_sequence START 1;

CREATE OR REPLACE FUNCTION update_usernotesid_format()
RETURNS TRIGGER AS $$
BEGIN
    NEW.usernotesid := 'un' || nextval('tbl_user_note_sequence ');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_tbl_user_note
BEFORE INSERT ON tbl_user_note
FOR EACH ROW
EXECUTE FUNCTION update_usernotesid_format();

Once you have finished entering all the queries above, you can type in the following command to see all the tables that have been created:

    \dt

If all tables have been created appropriately inside the database, you will see the table names of the tables created

Please note that the owner column will have your name instead.

# Running the project
Once all packages and dependencies are installed, you can run the program. Navigate to the ‘3D_MindMaps’ folder inside the PROJECT folder within your terminal.
Once you have navigated to the right location, type in the following command:

npm run dev 

Running this command initialises vite and express concurrently. You should see the following.

Ensure that nothing else is running on port 3000. You can then copy the url given by Vite after the ‘Local:’ keyword. This can be pasted into any browser, however any chromium-based browser in incognito mode is recommended. 

The 3D Mind mapping software can now be opened and used.
