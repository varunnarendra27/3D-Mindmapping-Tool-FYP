//Intialises express.js server and performs get requests
const express = require("express");
const app = express();
const port = 3000;
const cors = require('cors');
var userid;
var notelinkid;


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const Pool = require('pg').Pool
const pool = new Pool({
    user:"postgres",
    host: "localhost",
    database: "mindmaps", //Installation guide: Replace with your database name if you changed the name
    password: "", //Installation guide: Add your password if you created one
    port: 5432 //Make sure this matches the port number that your server is running on
});
/**
 * POST request to retrieve username and password from database
 */
app.post('/getUsername_and_Password', async (req, res) => {
    
    var parameters = req.body.arrayData;
    try {
        const result = await pool.query(`SELECT userid, username, password FROM tbl_user where username = '${parameters[0]}' and password = '${parameters[1]}';`)
        
        if(result && result.rows.length > 0){
            userid = result.rows[0].userid
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to insert a new user into database
 */
app.post('/insertNewUser', async (req, res) => {
    var parameters = req.body.arrayData;
    try {
        const result = await pool.query('INSERT INTO tbl_user (username, password) VALUES ($1, $2)', [parameters[0], parameters[1]]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to retrieve coordinates for a specific note
 */
app.post('/loaderCoordinates', async (req, res) => {
    var notelinkstring = req.body.arrayData;
    try {
        const result = await pool.query(`SELECT note_coordinate_x, note_coordinate_y, note_coordinate_z FROM tbl_notes WHERE noteID = '${notelinkstring}';`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST request to retrieve all notebooks for a user
 */
app.post('/loaderNotebooks', async (req, res) => {   
    try {
        const result = await pool.query(`SELECT tbl_note_link.notelinkID, tbl_note_link.note_title, tbl_note_link.notes_description 
        FROM tbl_note_link
        JOIN tbl_user_notes ON tbl_user_notes.notelinkID = tbl_note_link.notelinkID
        WHERE tbl_user_notes.userID = ${userid};`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to retrieve notebook head of notebook
 */
app.post('/notebook_head', async (req, res) => {

    notelinkid = req.body.arrayData
    
    try {
        const result = await pool.query(`SELECT note_head
        FROM tbl_note_link 
        WHERE notelinkid ='${notelinkid}'`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to retrieve all connected notes to a note
 */
app.post('/loadConnectedNotes', async (req, res) => {
    noteid = req.body.arrayData;
    try {
        const result = await pool.query(`SELECT connected_notes
        FROM tbl_notes
        WHERE noteid = '${noteid}';
        ;`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to retrieve all note data for a note
 */
app.post('/loadNoteData', async (req, res) => {
    noteid = req.body.arrayData;
    try {
        const result = await pool.query(`SELECT note_title, note_description
        FROM tbl_notes
        WHERE noteid = '${noteid}';
        ;`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST request to retrieve noteID of a note
 */
app.post('/loadNoteID', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`SELECT noteid
        FROM tbl_notes
        WHERE note_title = '${parameters}';
        ;`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Note data to save a note
 */
app.post('/saveNoteData', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`UPDATE tbl_notes
        SET note_title = '${parameters[1]}', note_description = '${parameters[2]}'
        WHERE noteid = '${parameters[0]}';
        ;`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to insert new ntoe into database
 */
app.post('/insertNewNote', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`INSERT INTO tbl_notes (note_coordinate_x, note_coordinate_y, note_coordinate_z, note_title)
        VALUES ('${parameters[0]}', '${parameters[1]}', '${parameters[2]}', '${parameters[3]}');`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to insert new notehead into database
 */
app.post('/insertNewNoteHead', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`UPDATE tbl_note_link SET note_head = '${parameters[0]}' WHERE notelinkid = '${parameters[1]}'`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST request to get new noteid based on coordinates
 */
app.post('/getNoteID', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`
  SELECT noteid FROM tbl_notes
  WHERE 
    note_coordinate_x = '${parameters[0]}' AND
    note_coordinate_y = '${parameters[1]}' AND
    note_coordinate_z = '${parameters[2]}' AND
    note_title = '${parameters[3]}';
`);

        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to update a connection between two notes
 */
app.post('/UpdateNewConnection', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`UPDATE tbl_notes
        SET connected_notes = CASE
            WHEN connected_notes IS NOT NULL THEN connected_notes || ', ${parameters[0]}'
            ELSE '${parameters[0]}'
        END
        WHERE noteid = '${parameters[1]}';`)


        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to create a new notebook
 */
app.post('/CreateNewNotebook', async (req, res) => {
    parameters = req.body.arrayData;
    
    try {
        const result = await pool.query('INSERT INTO tbl_note_link (note_title, notes_description) VALUES ($1, $2);', [parameters[0], parameters[1]]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to get notelinkid of new notebook
 */
app.post('/getNoteLinkID', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`
  SELECT notelinkid FROM tbl_note_link
  WHERE 
    note_title = '${parameters[0]}' AND
    notes_description = '${parameters[1]}';`);

        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to connect a notebook to a user
 */
app.post('/ConnectNotebookToUser', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`INSERT INTO  tbl_user_notes (userid, notelinkid)
        VALUES ('${userid}', '${parameters}');`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * POST request to update coordinates of note that has been dragged
 */
app.post('/UpdateNoteCoordinates', async (req, res) => {
    parameters = req.body.arrayData;
    try {
        const result = await pool.query(`UPDATE tbl_notes
        SET note_coordinate_x = '${parameters[0]}', note_coordinate_y = '${parameters[1]}', note_coordinate_z = '${parameters[2]}'
        WHERE noteid = '${parameters[3]}';`)
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => console.log(`app is listening on port ${port}`));
