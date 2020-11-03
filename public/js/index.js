document.querySelector("button").addEventListener("click", function(){window.location.assign("quiz.html")});
document.querySelector("#loginContainer").addEventListener("submit", evento => {
    evento.preventDefault();

    //Validate form data
    //Get email user input
    const user = document.querySelector("#userQuiz").value;
    //Regex to check out email
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!re.test(user))
    {
        //Invalid email
        alert("Dirección de correo electrónico no válida!");
    }//if
    else
    {
        //Valid email
        //Get password input
        const pass = document.querySelector("#claveQuiz").value;

        if (pass === '')
        {
            alert("No está permitido una contraseña vacía");
        }//if
        else
        {
            //Create json with credentials
            const credentials = {
                "user" : user,
                "pass" : pass
            };

            fetch("http://localhost:8888/login", {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin' : '*',
                    'Access-Control-Allow-Headers' : '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
                }
            ).then(res => res.text()).then(data => {
                switch (data)
                {
                    case '-1'://Error
                        {  
                            console.log('error');
                            break;
                        }
                    case '0'://Wrong credentials
                        {
                            console.log('wrong credentials');
                            const messageBox = Factoria("div", [["id", "messageBox"]], "Credenciales erróneas!");
                            document.querySelector("#loginContainer").insertBefore(messageBox, document.querySelector("#loginContainer > div:first-child"));
                            setTimeout(() => {
                                document.querySelector("#messageBox").remove();
                            }, 5000);
                            break;
                        }
                    case '1'://Login OK
                        {
                            console.log('Login OK');
                            document.querySelector("#loginContainer").className = "unvisible";
                            document.querySelector("#buttonContainer").className = "unvisible";
                            document.querySelector("#edit").className = "movFormNewQuestion";
                            break;
                        }
                }//switch
            });
        }//else
    }//else
});

