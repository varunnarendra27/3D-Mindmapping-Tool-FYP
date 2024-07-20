var username = localStorage.getItem('signinID')//finds out which user is logged in
var notebook_div = document.getElementsByClassName("flex-container")[0]
var load_notebook;
var hi_name = document.getElementById("hi_name")
var new_note_book_button = document.getElementsByClassName("create_new_notebook")[0]
hi_name.innerText = "Hi " + username + ","
/**
 * Function that is called when a notebook is clicked on to enter 3D environment
 * @param {*} box Passes in the box that was clicked to retrieve its notelinkid
 */
function boxClicked(box){
    localStorage.setItem("notelinkid", box.id)
    window.location.href = "./index2.html"
}

/**
 * This function is called when a new notebook needs to be saved
 */
function save_new_notebook(){
  /**
   * Creates a new notebook in the database via a POST request
   * @param {list} parameters Takes in parameters of the notebook
   */
  const createNewNoteBook = async (parameters) => {
    try {
      const response = await fetch('http://localhost:3000/CreateNewNotebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      getNoteLinkID(parameters)
    } catch (error) {
      console.error('Error:', error);
    }
  };
  /**
   * This function connects the newly created notebook to the user that is logged in
   * @param {list} parameters //It takes in the parameters
   */
  const ConnectNotebookToUser = async (parameters) => {
    try {
      const response = await fetch('http://localhost:3000/ConnectNotebookToUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      location.reload()
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  /**
   * This function gets the notelinkid of the newly created notebook
   * @param {*} parameters 
   */
  const getNoteLinkID = async (parameters) => {
  
    try {
      const response = await fetch('http://localhost:3000/getNoteLinkID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      ConnectNotebookToUser(data[0].notelinkid)
    } catch (error) {
      console.error('Error:', error);
    }
  };
  //retrieves the new note title and note description that is typed into the UI
  var new_notebook_title = document.getElementById("new_notebook_title").innerHTML
  var new_notebook_description = document.getElementById("new_notebook_description").innerHTML
  createNewNoteBook([new_notebook_title, new_notebook_description])
  document.getElementsByClassName("notebook_creation_screen")[0].style.display = "none"

}

/**
 * This function is triggered when the user clicks on the new notebook button
 */
new_note_book_button.onclick = function(){
  
  document.getElementsByClassName("notebook_creation_screen")[0].style.display = "block"
  
}

/**
 * This function loads the notebooks into the space by appending it to the DOM
 */
function loadNotebooks(){
    for(i = 0; i<load_notebook.length; i++){
        var new_box = `
    <div class="box" id = "${load_notebook[i].notelinkid}"onclick = "boxClicked(this)">
        <h1 class="CheckBox"> &#9745;</h1>
        <h2>${load_notebook[i].note_title}</h2>
        <p>_________________________</p>
        <h3>${load_notebook[i].notes_description} </h3> 
    </div>`
    notebook_div.innerHTML += new_box;
    }
    
}/**
 * This function loads all notebooks associated with a user
 * @param {string} username Uses the user's username to find notebooks associated with the user
 */
  const fetchNoteBooks = async (username) => {
    
    try {
      const response = await fetch('http://localhost:3000/loaderNotebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: username}),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      load_notebook = data
      loadNotebooks()
    } catch (error) {
      console.error('Error:', error);

    }
  };


  
//Notebooks are fetched when menu is called
fetchNoteBooks(username)