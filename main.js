import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { DragControls } from 'three/addons/controls/DragControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import * as THREE from 'three';
import EditorJS from '@editorjs/editorjs';
const ImageTool = window.ImageTool;

/**
 * This is a declaration of the tools that will be available from the editor.js library. 
 * This will be what allows a student to take notes within the interface
 */
var editor = new EditorJS({ 
  holder: 'editorjs', 
  tools: { 
    onReady: () => {
      new Undo({ editor });
      new DragDrop(editor);
    },
    header: {
      class: Header, 
      inlineToolbar: ['link'] 
    }, 
    list: {//Take notes in list format
      class: NestedList, 
      inlineToolbar: true, 
      config: {
        defaultStyle: 'unordered'
      },
    }, 
    nestedchecklist : editorjsNestedChecklist,//Allow the lists to be nested
    Marker: {
      class: Marker,//Let the user change the colour of their text
      shortcut: 'CMD+SHIFT+M',
    },
    inlineCode: { 
      class: InlineCode, //Let the user save code in their notes
      shortcut: 'CMD+SHIFT+M',
    },
    underline: Underline,
    Color: {
      class: ColorPlugin, //Give the user an option of different colours to use when writing notes
      config: {
         colorCollections: ['#EC7878','#9C27B0','#673AB7','#3F51B5','#0070FF','#03A9F4','#00BCD4','#4CAF50','#8BC34A','#CDDC39', '#FFF'],
         defaultColor: '#FF1300',
         type: 'text',  
      }     
    },
    Marker: {
      class: window.ColorPlugin,
      config: {
         defaultColor: '#FFBF00',
         type: 'marker',
         icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
        }       
    },
    image: {//Allow the ability to add images to notes
      class: InlineImage,
      inlineToolbar: true,
      config: {
        embed: {
          display: true,
        },
        unsplash: {
          appName: 'your_app_name',
          apiUrl: 'https://unsplash.com/urn:ietf:wg:oauth:2.0:oob',
          maxResults: 30,
        }
      }
    }
  
    
  }, 
})

/**
 * This stack was created to perform a depth first traversal
 * The notes are stored as a tree
 * To retrieve these notes, A depth first traversal will be required in order to retrieve/display the notes
 */
class Stack {
  constructor() {
    this.notes_in_stack = [];
  }
  /**
   * This method returns the top item of the stack
   * @returns This returns the note at the top of the stack
   */
  pop() {
    if (this.isEmpty()) {
      return "Underflow Error Found";
    }
    return this.notes_in_stack.pop();
  }
  /**
   * Method to add note to the stack
   * @param {*} element 
   */
  push(element) {
    this.notes_in_stack.push(element);
  }
  /**
   * Method to view note at the top of the stack without removing it
   * @returns Returns the note at the top of the stack
   */
  peek() {
    if (this.isEmpty()) {
      return "Empty Stack";
    }
    return this.notes_in_stack[this.notes_in_stack.length - 1];
  }

  /**
   * Checks if the stack is empty
   * @returns Returns a boolean stating whether stack is empty or not
   */
  isEmpty() {
    return this.notes_in_stack.length === 0;
  }

  /**
   * Gets the size of the stack
   * @returns Returns an integer which gives the size of the stack
   */
  size() {
    return this.notes_in_stack.length;
  }

  /**
   * Prints the notes of the stack
   */
  print() {
    console.log("The notes in the stack are: ", this.notes_in_stack.join(' '));
  }
}



//Setting up basic components of the 3D environment in three.js
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1500 );
camera.far = 1000000;
camera.updateProjectionMatrix();
const cameraLight = new THREE.PointLight(0xffffff, 10000);
camera.position.z = 1000;
camera.add(cameraLight);
camera.layers.enable(1); //Camera setup to render layers 1 and 2
camera.layers.enable(2); //This is so both notes and connection between these notes are visible to the user
document.getElementById('canvas_container').appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load('/images/dotted_paper.jpg'); //Creating dotted text background
gridTexture.wrapS = THREE.RepeatWrapping;
gridTexture.wrapT = THREE.RepeatWrapping;
gridTexture.repeat.set(5, 1); 
scene.background = gridTexture;

var notelinkstring; //Variable to hold connected notes when retrieved from db. Important for depth first traversal
var notecoordinates; //Variable to hold coordinate of note being loaded in from database
var notelinkID = localStorage.getItem("notelinkid")//Keeps track of notes being loaded in
var note_stack = new Stack(); //Instantiation of stack used to perform depth first traversal
var notes_visited = []; //List to keep track of notes that have visited during depth first traversal
var connecting_new_note_checker= false
var new_current_note
var found_object_when_clicked //variable to hold note that is clicked to connect new created note to existing note
var showNotes = false//keeps track of whether a note description is visible for the user
var nodeArray = []//array is used to keep track of noteIDs that have been initialised in the scene
var objects = [];//HOlds created notes in the scene

//Retrieving tool bar buttons from dom
var add_node = document.getElementById("add_node")
var remove_node = document.getElementById("remove_node")
var add_line = document.getElementById("add_line")
var save_node = document.getElementsByClassName("save-node")[0]
var save_note_title = document.getElementById("save_note_title")
var search_input = document.getElementById("search_input")

//booleans to keep track of whether a user is adding or removing nodes
var add_node_bool = false
var remove_node_bool = false
var current_node;


/**
 * Performs post request to update note coordinates in database
 * @param {*} note_data Passes in the data about the note that will need to be saved
 */
const saveNoteCoordinate = async (note_data) => {
  try {
    const response = await fetch('http://localhost:3000/UpdateNoteCoordinates', { //Holds SQL statement to store noteData
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arrayData: note_data}),
    });
    const data = await response.json(); //Array is sent back with new note title and note data
  } catch (error) {
    console.error('Error:', error);
  }
};

/**
 * This function loops through all objects in the scene and if its note, it will save the note location to the database
 */
function savaAllNoteCoordinates(){
  for (const object of scene.children) {
    if (object.geometry instanceof THREE.SphereGeometry) {
      saveNoteCoordinate([object.position.x, object.position.y, object.position.z, object.name])
    }
  }
}

/**
 * Function used to update lines when note is dragged
 * @param {*} scene This is the 3D environment and all the objects inside it
 * @param {*} oldSphereCoordinates This is coordinates of the note before it was dragged
 * @param {*} newSphereCoordinates This is coordinates of the note after it was dragged
 * @param {*} note This is the note that is being dragged
 */
function updateLineStartPoint(scene, oldSphereCoordinates, newSphereCoordinates, note) {
  //Here we are rounding any coordinate to 2 dp. This is because Three.js is too precise for this intended purpose
  oldSphereCoordinates.x = parseFloat(oldSphereCoordinates.x.toFixed(2));
  oldSphereCoordinates.y = parseFloat(oldSphereCoordinates.y.toFixed(2));
  oldSphereCoordinates.z = parseFloat(oldSphereCoordinates.z.toFixed(2));
  //intiialising lineStartPoint and lineEndPoint variables. They hold the start and end points of the lines we are trying to move.
  var lineStartPoint = new THREE.Vector3();
  var lineEndPoint = new THREE.Vector3();
  //Iterating through all objects in the scene. If it is a line we check if it should move based on the dragged object
  for (const object of scene.children) {
      if (object instanceof THREE.Line) {
        
          // Get the start point of the line
          //the rounding has to apply to line start and end points too
          lineStartPoint.fromBufferAttribute(object.geometry.attributes.position, 0);
          lineStartPoint.x = parseFloat(lineStartPoint.x.toFixed(2));
          lineStartPoint.y = parseFloat(lineStartPoint.y.toFixed(2));
          lineStartPoint.z = parseFloat(lineStartPoint.z.toFixed(2));


          lineEndPoint.fromBufferAttribute(object.geometry.attributes.position, object.geometry.attributes.position.count - 1);
          lineEndPoint.x = parseFloat(lineEndPoint.x.toFixed(2));
          lineEndPoint.y = parseFloat(lineEndPoint.y.toFixed(2));
          lineEndPoint.z = parseFloat(lineEndPoint.z.toFixed(2));
          
          // Checking if the start point coordinates of the line match the old sphere coordinates. If it does, we move the line to match.
          if (lineStartPoint.equals(oldSphereCoordinates)) {
           
              // Updating the start point coordinates of the line to the new sphere coordinates
              object.geometry.attributes.position.setXYZ(0, newSphereCoordinates.x, newSphereCoordinates.y, newSphereCoordinates.z);
              object.geometry.attributes.position. needsUpdate = true; 
          }
          // Checking if the line point coordinates of the line match the old sphere coordinates. If it does, we move the line to match.
          else if(lineEndPoint.equals(oldSphereCoordinates)){
            object.geometry.attributes.position.setXYZ(object.geometry.attributes.position.count - 1, newSphereCoordinates.x, newSphereCoordinates.y, newSphereCoordinates.z);
            object.geometry.attributes.position. needsUpdate = true; 
        }
      }//Here I am also updating the location of the title to match the new location of the sphere
      else if(object instanceof THREE.Sprite){
        var note_title = note.name + "_title"
        if (object.name == note_title){
          object.position.set(newSphereCoordinates.x, newSphereCoordinates.y + 5, newSphereCoordinates.z)
        }
      }
  }
  savaAllNoteCoordinates()//Saving all notes once they have been dragged
}
/**
 * This onclick function is triggered when the save button is pressed inside the note-taking interface
 * It's purpose is to save any changes to the note including its title, and actual notes
 * editor.js has method called .save() It converts the user's notes into JSON to be stored in a database
 */
save_node.onclick = function(){
  var note_data = []//Creating list of items to be sent with POST request
  note_data.push(current_node.name)
  editor.save()
  .then((outputData) => {// Outputs data as a JSON object representing the content
    var jsonString = JSON.stringify(outputData);
    note_data.push(document.getElementsByClassName('note-title')[0].innerHTML)
    note_data.push(jsonString)
    const saveNoteData = async (note_data) => {
      try {
        const response = await fetch('http://localhost:3000/saveNoteData', { //Holds SQL statement to store noteData
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ arrayData: note_data}),
        });
        const data = await response.json(); //Array is sent back with new note title and note data
        document.getElementsByClassName("note-title")[0].innerHTML = data[0].note_title //New note_title is updated in 3D space
      } catch (error) {
        console.error('Error:', error);
      }
    };
    saveNoteData(note_data)//SaveNoteData is called to save changes
    location.reload()
  })
  .catch((error) => {
    console.error('Error saving content:', error);
  });
  

}

/**
 * Function to move camera close to object when it is clicked on in search bar
 * @param {*} object This is the note that the camera is moving towards
 */
function focusCameraOnObject(object) {
  var area_around_note = new THREE.Box3().setFromObject(object);
  var box_center = area_around_note.getCenter(new THREE.Vector3());//Creates a box around the object to give the camera a location to move to
  var box_size = area_around_note.getSize(new THREE.Vector3());
  var maxDimension = Math.max(box_size.x, box_size.y, box_size.z);
  var distance = maxDimension / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) + 650;//Calculates the distance the camera should be from the object
  var newPosition = box_center.clone().add(new THREE.Vector3(0, 0, distance));
  camera.position.copy(newPosition );
  camera.lookAt(center);

}


/**
 * Event Handler for Search Bar when the user enters a string into it
 */
search_input.addEventListener("input", function(event) {
  var selectedOption = event.target.value;

  const loadNoteID = async (noteid) => {
    try {
      const response = await fetch('http://localhost:3000/loadNoteID', {//Gets the noteid for the note that has been chosen in the search bar
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ arrayData: noteid}),
        
      });
  
      const data = await response.json();
      
      for (let i = 0; i < scene.children.length; i++) {
        const object = scene.children[i];
        if (object.geometry instanceof THREE.SphereGeometry) {
          if (object.name === data[0].noteid) {
              object.material.color.set(0x0000ff);//Makes searched note blue
              focusCameraOnObject(object)//calls function move camera closer to searched note
}
          else{
            object.material.color.set("darkred");//Turns it back to red after it is found
          }
      }
    }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  loadNoteID(selectedOption)//gets the noteid of the note being searched for

});

/**
 * Event handler to change boolean of add note
 */
add_node.onclick = function(){
  if (add_node_bool == false){
    remove_node_bool = false
    add_node_bool = true
    add_node.innerHTML = "OFF"
  }
  else{
    remove_node_bool = false
    add_node_bool = false
    add_node.innerHTML = "Add Node"
  }
}



/**
 * Event handler to change boolean of remove node
 */
remove_node.onclick = function(){
  if (remove_node_bool == false){
    add_node_bool = false
    remove_node_bool = true
    remove_node.innerHTML = "OFF"
  }
  else{
    remove_node_bool = false
    add_node_bool = false
    remove_node.innerHTML = "Remove Note"
  }
}
/**
 * Function that is called when the user creates a note title for a new note
 */
save_note_title.onclick = function(){
  var new_note_title = document.getElementById("new_note_title").innerHTML
  const textTexture = createTextTexture(new_note_title);
  const textMaterial = new THREE.SpriteMaterial({ map: textTexture });

  const textSprite = new THREE.Sprite(textMaterial);
  textSprite.material.color = new THREE.Color('black');//created new note title which represents the edited note title

  // Setting the position to a specific coordinate in the scene
  textSprite.position.set(current_node.position.x, current_node.position.y, current_node.position.z);
  current_node.material.color.set('red');
  // Setting the scale of the sprite for appropriate size
  textSprite.scale.set(300, 150 ,150);

  scene.add(textSprite);
  var click_to_connect = document.getElementById("connecting_confirmation")

  /**
   * Function that creates a POST request to database when the user adds a new note to the scene
   * @param {list} parameters 
   */
  const insertNewNote = async (parameters) => {
  
    try {
      const response = await fetch('http://localhost:3000/insertNewNote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
  
      getNoteID(parameters)//The noteid of the newly created note is then called
    } catch (error) {
      console.error('Error:', error);
    }
  };
  /**
   * Function that creates a POST request to database when the noteid of a note is created
   * @param {*} parameters gets list to get noteid based on coordinates
   */
  const getNoteID = async (parameters) => {
  
    try {
      const response = await fetch('http://localhost:3000/getNoteID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      if (found_object_when_clicked != null){
        updateConnections([data[0].noteid, found_object_when_clicked])
      }
      else{
        insertNewNoteHead([data[0].noteid, notelinkID])//inserting a new note at the head of the notebook
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  /**
   * Updating the connections of a note to other notes in the database by creating POST request to the database
   * @param {*} parameters Takes in the notes to be added
   */
  const updateConnections = async (parameters) => {
  
    try {
      const response = await fetch('http://localhost:3000/UpdateNewConnection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  /**
   * Creates POST request to database if environment is empty so new notehead is required to initialise the graph
   * @param {*} parameters 
   */
  const insertNewNoteHead = async (parameters) => {
  
    try {
      const response = await fetch('http://localhost:3000/insertNewNoteHead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: parameters }),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  var parameters = [current_node.position.x, current_node.position.y, current_node.position.z, new_note_title]
  insertNewNote(parameters)//new note is added to the database
  scene.background = gridTexture;
  click_to_connect.style.display = "none"
  connecting_new_note_checker = false
  add_node_bool = false
  add_node.innerHTML = "Add Note"
  
  
}
//Function to fetch notestring for user
/**
 * Function to create POST request to the database to retrieve coordinates of a note
 * @param {*} noteid Passes in noteid of note that we need the coordinates for
 * @returns Returns the coordinates of a note
 */
const fetchCoordinates = async (noteid) => {
  
  try {
    const response = await fetch('http://localhost:3000/loaderCoordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arrayData: noteid }),
      
    });

    const data = await response.json();
    console.log('Response from server:', data);

    notecoordinates = data
    return notecoordinates
  } catch (error) {
    console.error('Error:', error);
  }
};

/**
 * Function to create POST request to the database to retrieve the notehead of the graph 
 * @returns Returns the head of the note graph
 */
const fetchNotebookHead = async () => {
  
  try {
    const response = await fetch('http://localhost:3000/notebook_head', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arrayData: notelinkID }),
      
    });

    const data = await response.json();
    console.log('Response from server:', data);
    notecoordinates = data
    return data[0].note_head
  } catch (error) {
    console.error('Error:', error);
  }
};
/**
 * Function to create POST request to retrieve notes connected to notehead
 * @param {*} connected_notes Takes in connected original connected note
 * @returns Returns the connected notes to this connected note
 */
const fetchConnectedNotes = async (connected_notes) => {
  
  try {
    const response = await fetch('http://localhost:3000/loadConnectedNotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({ arrayData: connected_notes }),
      
    });

    const data = await response.json();
    console.log('Response from server:', data);
    return data[0].connected_notes
  } catch (error) {
    console.error('Error:', error);
  }
};
/**
 * Function to traverse graph in database using depth first traversal
 */
async function traverse() {
  try {
    const note_head = await fetchNotebookHead();//head of notebook is retrieved
    note_stack.push(note_head);
    //depth first traversal used below with the stacks above
    while (note_stack.size() > 0) {
      const currentVertex = note_stack.pop();

      if (!notes_visited.includes(currentVertex)) {
        notes_visited.push(currentVertex);
        addnotespheres(currentVertex)
        const temp_connected_notes = await fetchConnectedNotes(currentVertex);

        if (temp_connected_notes != null){
          if (temp_connected_notes.includes(",")) {
            const connected_notes = temp_connected_notes.split(', ');//connected notes are in csv format so need to be split by the commas to get each note
            for (const neighbour of connected_notes.reverse()) {
              note_stack.push(neighbour);
              await connectNotesWithLine(currentVertex, neighbour);
            }
          } else if (temp_connected_notes != "null") {
            note_stack.push(temp_connected_notes);
            await connectNotesWithLine(currentVertex, temp_connected_notes);//the notes are then connected together 
          }
        }
      }
      note_stack.print();
    }
  } catch (error) {
    console.error("Error fetching notebook head:", error);
    
  }
}
/**
 * Creates the text textures of note titles being put in 3D space
 * @param {*} text The note titles that are being created
 * @returns Returns the text texture that is ready to be added to the scene
 */
function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = 'Bold 36px Times New Roman';
  context.fillStyle = 'rgba(255, 255, 255, 1)';
  context.fillText(text, 0, 40);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}
/**
 * Function to add the notes to the scene that have been traversed
 * @param {*} noteid Takes in the noteid of the note to be added
 */
async function addnotespheres(noteid){
  var geometry = new THREE.SphereGeometry(30, 30, 30)//The geometry of the note to be added is created
  var coordinates = await fetchCoordinates(noteid)
  var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 'darkred'}));//It is given a colour
  //object.layers.set(1);
  object.position.x = coordinates[0].note_coordinate_x;//The positions of the notes are added based on the coordinates of the noteid
  object.position.y = coordinates[0].note_coordinate_y;
  object.position.z = coordinates[0].note_coordinate_z;
  var ambientLight = new THREE.DirectionalLight(0xffffff, 2.0, 1000);//We add light so the user can see it in action
  ambientLight.target = object;
  scene.add(ambientLight);
  object.castShadow = true;
  object.recieveShadow = true;//giving the note a shadow
  scene.add(object);
  object.name = noteid
  objects.push(object);
  nodeArray.push([object.uuid, "Title", null])
  const textTexture = createTextTexture('Note ');//Creating the note titles to be added to the scene
  const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
  const textSprite = new THREE.Sprite(textMaterial);

  /**
   * This function updates the note titles, note contents and the search bar with the notes in the space. 
   * It does this using a POST request
   * @param {*} current_node 
   */
  const loadNoteData = async (current_node) => {

    try {
      const response = await fetch('http://localhost:3000/loadNoteData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ arrayData: current_node}),
        
      });
  
      const data = await response.json();
      console.log('Response from server:', data.note_title);
      document.getElementsByClassName("note-title")[0].innerHTML = data[0].note_title
      var note_description = JSON.parse(data[0].note_description)
      editor.render(note_description)//Renders the note contents in the editor
      const updatedTexture = createTextTexture(data[0].note_title);
      // Update the material with the new texture
      textSprite.material.map = updatedTexture;
      textSprite.material.needsUpdate = true;
      //updating search bar to reflect notes in scene
      var searchNoteTitles = document.getElementById("search_note_titles");
      searchNoteTitles.innerHTML += '<option value="' + data[0].note_title + '">' + data[0].note_title + '</option>';
    } catch (error) {
      console.error('Error:', error);
    }
  };
  textSprite.material.color = new THREE.Color('black');
  // Setting the position to a specific coordinate in the scene
  textSprite.position.set(object.position.x, object.position.y, object.position.z);
  // Setting the scale of the note title for appropriate size
  textSprite.scale.set(300, 150 ,150);
  textSprite.name = noteid + "_title"
  textSprite.layers.set(2)
  loadNoteData(noteid)//the data for the note is called
  scene.add(textSprite);
  
}/**
 * This function takes in 2 notes and connects them with a line.
 * @param {float} startNote Takes in the first note
 * @param {float} endNote Takes in the second note
 */
async function connectNotesWithLine(startNote, endNote) {
  const startPoint = await fetchCoordinates(startNote);//Gets coordinates of the first and second note
  const endPoint = await fetchCoordinates(endNote);
  //creating new line based on start and end points of notes being passed in.
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(startPoint[0].note_coordinate_x, startPoint[0].note_coordinate_y, startPoint[0].note_coordinate_z),
    new THREE.Vector3(endPoint[0].note_coordinate_x, endPoint[0].note_coordinate_y, endPoint[0].note_coordinate_z),
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 'darkred', linewidth: 100000 });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.layers.set(2);//adding line to layer to it is not looked for when the user is clicking on the screen
  scene.add(line);
}
/**
 * Main Function reponsible for handling tools during run time.
 * This includes dragging, adding notes, removing notes
 */
  function runEnvironment(){
  traverse()//Traversing graph of notes to put into scene
  //instantiating line controls
  var drag_controls = new DragControls(objects, camera, renderer.domElement);
  const orbit_controls = new OrbitControls(camera, renderer.domElement);
  var initial_object_location = null;
  var final_object_location = null;
  var variable_has_been_changed = false; //Keeps track of when initial_object_location has been changed
  
  /**
   * Triggered when a note is first dragged at the start.
   * Used to find the location of an object before its finished dragging
   */
  drag_controls.addEventListener('dragstart', function (event) {
    initial_object_location = null;
    orbit_controls.enabled = false; // Disabling OrbitControls when dragging starts
      if (!variable_has_been_changed) {
          // Setting initial_object_location to only change once when dragging starts. This is so it cannot be changed later
          initial_object_location = event.object.position.clone(); // Clone the position
          variable_has_been_changed = true;
      }
  });

  /**
   * Triggered as note is being dragged.
   * Used to find the final object location of note. These are used to update the lines and note titles
   */
  drag_controls.addEventListener('drag', function (event) {
      // Updating final_object_location continuously during drag so that the real final object location is saved
      final_object_location = event.object.position.clone(); // Cloning the position into variable
  });

  // Re-enabling OrbitControls when dragging ends
  drag_controls.addEventListener('dragend', function (event) {
    updateLineStartPoint(scene, initial_object_location, final_object_location, event.object);
      orbit_controls.enabled = true; // Re-enabling OrbitControls when dragging ends
      variable_has_been_changed = false //Resetting variable so that object can be dragged again
  });
  //intialises raycaster to track clicks on screen
  const raycaster = new THREE.Raycaster();
  raycaster.layers.set(0);
  const pointer = new THREE.Vector2();
  const moveMouse = new THREE.Vector2();
  const intersectionPoint = new THREE.Vector3();
  const planeNormal = new THREE.Vector3();
  const plane = new THREE.Plane();
  var draggable = THREE.Object3D;

  /**
   * Function to track how a mouse is moved through the 3D environment
   */
  window.addEventListener('mousemove', function(e){
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(plane, intersectionPoint)
  })

  //Creating new object with a double click
  window.addEventListener('dblclick', function(e){
    //Only adds if add note button has been clicked
    if (add_node_bool == true && connecting_new_note_checker == false){
      scene.background = new THREE.Color("darkgrey");
      var geometry = new THREE.SphereGeometry(40, 40, 40)
      new_current_note = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 'Red'}));//Adds new object to the 3D environment
      
      current_node = new_current_note
      scene.add(new_current_note)
      new_current_note.position.copy(intersectionPoint)//Update the new object with the location of the user click
      //Checks to see if there is a note already in the scene. It checks for greater than three as the camera and lighting will always be in the scene.
      if (scene.children.length > 3) {
        var click_to_connect = document.getElementById("click_to_connect")//If there is a note already in, then the user is prompted to click on an existing note to connect it
        click_to_connect.style.display = "block"
        connecting_new_note_checker = true
    } else {
      var click_to_connect = document.getElementById("connecting_confirmation")//If there isnt an existing note, the user is not asked to connect the new note to the existing note
      click_to_connect.style.display = "block" 
      }
      
    }
    else if(connecting_new_note_checker == true &&add_node_bool == true ){
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera)
    var found = raycaster.intersectObjects( scene.children );//Finds object to connect to
    var object__coordinates = new THREE.Vector3();
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      found[0].object.position,
      new_current_note.position//updates the current note that is clicked with the object that the rayacster finds
    ]);
    found_object_when_clicked = found[0].object.name
    const lineMaterial = new THREE.LineBasicMaterial({ color: 'darkred', linewidth: 100000 });
    const line = new THREE.Line(lineGeometry, lineMaterial);//adding a line when it is found
    line.layers.set(2);
    scene.add(line);
    
    if(found.length > 0){
      for(var i = 0; i < nodeArray.length; i++){
        if (nodeArray[i][0] == found[0].object.uuid){

          document.getElementsByClassName("note-title")[0].innerHTML = nodeArray[i][1]
        }
      }
      if (showNotes == true){//checks if the note editor is still open. If it is, it is removed
        showNotes = false
        document.getElementsByClassName("a4-container")[0].style.display = "none"
      }
    }

    
    var click_to_connect = document.getElementById("click_to_connect")
    click_to_connect.style.display = "none"
    var click_to_connect = document.getElementById("connecting_confirmation")
    click_to_connect.style.display = "block"
    scene.background = gridTexture;
    }
  })
  /**
   * Removes object from scene with a click
   */
  window.addEventListener('click', event =>{
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera)
  
    if(remove_node_bool == true){
      var scene_children = scene.children
      var intersects = raycaster.intersectObjects(scene.children)
      scene.remove(intersects[0].object)
      
      for (let i = 0; i < scene.children.length; i++) {
        const child = scene.children[i];
        if (child.name == (intersects[0].object.name + "_title")){//finds title associated with note being clicked and removes that as well
          scene.remove(child)
        }
    }}
  })
  /**
   * Function to make note section appear and disappear
   */
  window.addEventListener('click', event =>{
    if(connecting_new_note_checker == false){
      pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera(pointer, camera)
      var found = raycaster.intersectObjects( scene.children );
      
      if (found.length == 0){
        for (let i = 0; i < scene.children.length; i++) {
          //clearing search and making item red when the screen is clicked
          const object = scene.children[i];
          if (object.geometry instanceof THREE.SphereGeometry) {
              object.material.color.set("darkred");
              search_input.value = ""
          }
        }
      }
      else if(found.length > 0){
        //If an object is found when the creen is clicked, current note is updated with that object
        current_node = found[0].object
         /**
         * This function gets the note titles and note contents of the note that is clicked.
         * It does this using a POST request
         * @param {*} current_node it loads the current note that is beign clicked on to get notes for it
         */
        const loadNoteData = async (current_node) => {
          try {
            const response = await fetch('http://localhost:3000/loadNoteData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              
              body: JSON.stringify({ arrayData: current_node}),
              
            });
            const data = await response.json();
            console.log('Response from server:', data.note_title);
            document.getElementsByClassName("note-title")[0].innerHTML = data[0].note_title//Updates note-title
            var note_description = JSON.parse(data[0].note_description)
            editor.render(note_description)//updates note contents when new note is clicked
          } catch (error) {
            console.error('Error:', error);
          }
        };

        if (showNotes == false){
          loadNoteData(current_node.name)
          showNotes = true
          //makes note editor appear
          document.getElementsByClassName("a4-container")[0].style.display = "block"

        }
        else{
          showNotes = false//makes note editor disappear
          document.getElementsByClassName("a4-container")[0].style.display = "none"
          editor.clear()//Clears editor when note is closed
        }
        
      }
    }
  })
  /**
   * Three.js function to animate the scene
   */
  function animate() {
  requestAnimationFrame(animate);
  /**
   * Function to make sure Text titles always face camera
   */
  scene.children.forEach((child) => {
    if (child instanceof THREE.Sprite) {
      child.lookAt(camera.position);
    }
  });
  orbit_controls.update();//updates orbit controls in camera
  renderer.render(scene, camera);//adds scene and renderer to camera
  }
  animate();
}
runEnvironment()//Calls main evironment to make sure tools work