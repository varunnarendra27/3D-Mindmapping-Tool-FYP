
password = "test"
var submit = document.getElementById("submit")
var create_account = document.getElementById("create_account")
var login_guidance = document.getElementById("login_guidance")

var submit_pressed = false
var create_account_pressed = false



/**
 * This event handler is called when the submit button is clicked
 */
submit.onclick = function(){
    submit_pressed = true
    var username = document.getElementById("login__username").value
    var password = document.getElementById("login__password").value
    var loginchecker = false
    getUsername_and_Password([username, password])
}
/**
 * This event handler is called when the create_account button is clicked
 */
create_account.onclick = function(){
  create_account_pressed = true
  var username = document.getElementById("login__username").value
  var password = document.getElementById("login__password").value
  if (checkUsername_and_Password(username, password)){
    getUsername_and_Password([username, password]) //checks if 
  }
 
}

/**
 * This Function checks to see if the username and password is secure enough to be saved into the database
 * @param {string} username Passes in the username entered by the user
 * @param {string} password Passes in the password entered by the user
 * @returns This returns a boolean stating whether the username and password fit the needed format
 */
function checkUsername_and_Password(username, password){
  const username_contains_number = /\d/.test(username);//regular expression to check if username and password contain a number
  const password_contains_number = /\d/.test(password);
  const password_contains_special_character = /[^a-zA-Z0-9\s]/.test(password);//regular expression to check if password contains special character
  var username_pass = false
  var password_pass = false
  

  if(username.length > 7 && username_contains_number){
    username_pass = true
  }
  else{
    login_guidance.innerText = "Please enter a username with at least 7 characters which includes at least 1 number."
  }
  if(password.length > 7 && password_contains_number && password_contains_special_character){
    password_pass = true
  }
  else{
    login_guidance.innerText += "\nPlease enter a password with at least 7 characters which includes at least 1 number and 1 special character."
  }

  if (username_pass && password_pass){
    return true
  }

}


/**
 * This function is called to make a POST request to the database to see if the username and password exist
 * @param {list} login_details the username and password are passed in as a list
 */
const getUsername_and_Password = async (login_details) => {
  
  try {
    const response = await fetch('http://localhost:3000/getUsername_and_Password', { //Holds SQL statement to store noteData
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arrayData: login_details}),
    });
    const data = await response.json(); //Array is sent back with new note title and note data
    if (data.length == 1){
      if (submit_pressed == true){//If username and password exists and submit button has been pressed, then user logs in 
      localStorage.setItem('signinID', data[0].username);
      submit_pressed = false
      window.location.href = "./menu.html"
      }
      else if(create_account_pressed == true){//If username and password exists and create account has been pressed, then account details exist
        submit_pressed = false
        create_account_pressed = false
        login_guidance.style.color = "red"
        login_guidance.innerText = "This account already exists. Please try a different username"
      }
    }
    if (data.length == 0){//If items do not exist in the database and create account is pressed, then insertnewuser is called to create a new account
      if (create_account_pressed == true){
        submit_pressed = false
        create_account_pressed = false
        insertNewUser(login_details)
      }
      else{//if items do not exist and sumbit button is pressed, then the user has put in incorrect details
        login_guidance.style.color = "red"
        login_guidance.innerText = "Incorrect Login Details. Please Try Again"
      }
      }
    }
   catch (error) {
    console.error('Error:', error);
    loginchecker = false
  }
  };

  /**
   * This function is called to create a POST request to the database to add a new user
   * @param {list} login_details 
   */
  const insertNewUser = async (login_details) => {
    try {
      const response = await fetch('http://localhost:3000/insertNewUser', { //Holds SQL statement to store noteData
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrayData: login_details}),
      });
      const data = await response.json(); 
      login_guidance.style.color = "green"
      login_guidance.innerText = "New Account Created! Please Log In"

    } catch (error) {
      console.error('Error:', error);
      loginchecker = false
    }
    };
  