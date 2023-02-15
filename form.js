var firebaseConfig = {
    apiKey: "AIzaSyD19YOr7Ytl_qKIHlyfdJgo3acxUJHpH5Q",
    authDomain: "fir-login-5b1d3.firebaseapp.com",
    projectId: "fir-login-5b1d3",
    storageBucket: "fir-login-5b1d3.appspot.com",
    messagingSenderId: "550941917039",
    appId: "1:550941917039:web:a1a17a8cec0795d2fc329a",
    measurementId: "G-J7VHRBVDW3"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const auth =  firebase.auth();

  //signup function
  function signUp(){
    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    //
    promise.catch(e=>alert(e.message));
    alert("SignUp Successfully");
  }

  //signIN function
  function  signIn(){
    var email = document.getElementById("email");
    var password  = document.getElementById("password");
    const promise = auth.signInWithEmailAndPassword(email.value,password.value);
    //promise.catch(e=>alert(e.message));
    alert("Value of promise: "+promise);
}
   
 //active user to homepage
  firebase.auth().onAuthStateChanged((user)=>{
    if(user){
      var email = user.email;
      alert("Active user "+email);

    }else{
      alert("No Active user Found")
    }
  })
