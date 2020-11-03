class Question{
    constructor(JQuestion)
    {
        this.title          = JQuestion.title;
        this.options        = JQuestion.options;
        this.result         = JQuestion.solution;
        this.optionSelected = JQuestion.optionSelected;
    };
};

class Quiz{
    constructor()
    {
        this.nodoQuiz           = document.querySelector("form");
        this.nodoSubmit         = document.querySelector("#submitContainer");
        this.colorLabelHover    = "";
        this.questions          = [];

        fetch("http://localhost:8888/title").then(d => d.text()).then(d => {
            this.title = d;
            this.init();
        });
    };
    init()
    {
        fetch("http://localhost:8888/questions").then(d => d.json()).then(d => {
            this.questions = Object.values(d).map(question => new Question(question));
            this.loadQuiz();
        });
    }//init

    loadQuiz()
    {
        //Creamos en nodo contenedor de los títulos
        let nodoTitulos = Factoria("div", [["id", "titlesContainer"]], "");
        //Creamos el nodo <h1> para el título del cuestionario y lo insertamos en su contenedor
        let quizTitle = Factoria("h1", [[]], this.title);
        nodoTitulos.appendChild(quizTitle);
        //Creamos un nodo <h2> para mensajes y lo insertamos en su contenedor
        let nodoMessage = Factoria("h2", [[]], "");
        nodoTitulos.appendChild(nodoMessage);
        //Inyectamos el contenedor de títulos en el cuestionario
        this.nodoQuiz.insertBefore(nodoTitulos, this.nodoSubmit);
        //Creamos los nodos de las preguntas
        this.questions.forEach((ObjQuestion, index) => {
            //Se crea el nodo de la pregunta y se inyecta en el nodo del quiz
            this.nodoQuiz.insertBefore(this.createQuestionNode(ObjQuestion, index), this.nodoSubmit);
        });
    }//loadQuiz

    createQuestionNode(ObjQuestion, index)
    {
        //Creamos el nodo para la pregunta
        let nodoQuestion = Factoria("div", [["class", "question"],
                                            ["id", "" + index]], "");
        //Creamos el nodo del título y se inyecta en el nodo de la pregunta
        nodoQuestion.appendChild(this.createTitleNode(ObjQuestion.title));
        //Creamos el nodo de las opciones y lo inyectamos en el nodo de la pregunta
        nodoQuestion.appendChild(this.createOptionsNode(ObjQuestion.options, index));

        return nodoQuestion; 
    }//createQuestionNode

    createTitleNode(title)
    {
        let nodoTitle = Factoria("div", [["class", "title"]], "");
        let nodoTitleData = Factoria("p", [["class", "titleData"]], title);
        nodoTitle.appendChild(nodoTitleData);

        return nodoTitle;
    }//createTitleNode

    createOptionsNode(options,indexQuestion)
    {
        let nodoOptions = Factoria("div", [["class", "options"]], "");
        for (let cont = 0; cont < options.length; cont++)
        {
            //Se crean los nodos opción y se inyectan en el nodo opciones
            nodoOptions.appendChild(this.createOptionNode(options[cont], cont, indexQuestion));
        }//for
        return nodoOptions;
    }//createOptionsNode

    createOptionNode(data, index, indexQuestion)
    {
        //Se crea el nodo contenedor de cada opción
        let nodoOption = Factoria("div", [["class", "option"]], "");
        //Se crea el nodo <label> para el texto de la opción
        let labelOption = Factoria("label", [   ["for", "option" + index],
                                                ["id", `q${indexQuestion}q${index}`]], data);
        //Se asigna un color de la paleta actual al label
        labelOption.style.backgroundColor = quizPalette.palette[index].codeHex;
        //Se crea el nodo para el input radio
        let inputOption = Factoria("input", [   ["type", "radio"],
                                                ["name", "option"],
                                                ["id" ,"option" + index]], "");
        //Se configura el nodo inyectando los elementos
        nodoOption.appendChild(labelOption);
        nodoOption.appendChild(inputOption);

        //Asignamos handlers para los eventos mouseenter y mouseleave sobre el label
        labelOption.addEventListener("mouseenter", (event) => {
            this.OnHover(event);});
        labelOption.addEventListener("mouseleave", (event) => {
            this.OnHover(event);});
        //Asignamos handler para el evento click sobre el label
        labelOption.addEventListener("click", (event) => {
            //Se obtiene el índice del objeto pregunta actual y el de la opción actual
            let indexQuestion   = parseInt(event.target.id.split("q")[1]);
            let indexOption     = parseInt(event.target.id.split("q")[2]);

            //Se comprueba si ya hay una selección previa
            if (this.questions[indexQuestion].optionSelected === undefined)
            {
                //No había selección previa
                //Se guarda la selección actual
                this.questions[indexQuestion].optionSelected = indexOption;
                //Se modifica el formato del label para marcar la selección actual
                event.target.classList.add("selected");
            }//if
            else
            {
                //Hay una selección previa
                //Se comprueba si la selección actual coincide con la existente
                if (this.questions[indexQuestion].optionSelected !== indexOption)
                {
                    //La selección actual es distinta
                    //Se restaura la selección anterior
                    let stringCss = `#q${indexQuestion}q${this.questions[indexQuestion].optionSelected}`;
                    document.querySelector(stringCss).classList.remove("selected");
                    //Se guarda la selección actual
                    this.questions[indexQuestion].optionSelected = indexOption;
                    //Se modifica el formato del label para marcar la selección actual
                    event.target.classList.add("selected");
                }//if
            }//else
        });
 
        return nodoOption;
    }//createOptionNode

    corregir()
    {
        let questionsRemaining = undefined;
        this.questions.map((question) => {
            if (question.optionSelected === undefined)
            {
                questionsRemaining++;
            }//if
        });
        if (questionsRemaining !== undefined)
        {
            //Hay preguntas sin responder, se solicita confirmación para seguir
            if (!confirm("Hay preguntas sin responder, ¿quieres finalizar igualmente?"))
            {
                //El usuario desea volver al cuestionario
                return;
            }//if
        }//if
        let qualification = 0;
        //El usuario ha respondido todas las preguntas o desea terminar de todos modos
        this.questions.map((question, index) => {
            if (question.optionSelected === question.result)
            {
                //Pregunta correcta, se incrementa la nota
                qualification++;
            }//if
            //Se marca la respuesta correcta
            document.querySelector(`#q${index}q${question.result}`).style.border = "2px solid";
        });
        //Una vez obtenida la calificación se muestra con un mensaje
        let message = "";
        if (qualification === 0)
        {
            //No ha dado una...
            message = `!Eres un paquete¡
            !No has dado ni una! (0/${this.questions.length})`;
        }//if
        else if (qualification < ((this.questions.length) / 2))
        {
            message = `Suspenso. Has acertado menos de la mitad. (${qualification}/${this.questions.length})`;
        }//else if
        else if (!(this.questions.length % 2) && (qualification == (this.questions.length) / 2))
        {
            message = `Aprobado raspado. Repasa porque puedes hacerlo mejor (${qualification}/${this.questions.length})`;
        }//else if
        else if (qualification === this.questions.length)
        {
            message = `!Enhorabuena¡  !Has acertado todas¡ Dominas el tema. (${qualification}/${this.questions.length})`;
        }//else if
        else
        {
            message = `Aprobado. Has superado la prueba. (${qualification}/${this.questions.length})`;
        }//else
        //Se inserta el mensaje
        document.querySelector("h2").innerText = message;
    }//corregir

    //MESSAGE HANDLERS
    /*
    Función llamada en los eventos mouseenter y mouseleave sobre un label para controlar
    el cambio de aspecto durante el hover
    Al no existir las <label> en el html estático no se puede controlar el hover con css
    porque cuando carga el css, no hay labels que se vean afectados por el hover
    */
    OnHover(event)
    {
        if (event.target.style.backgroundColor === "crimson")
        {
            //Hay que restaurar el color previo
            event.target.style.backgroundColor = this.colorLabelHover;
        }//if
        else
        {
            //Se almacena el color actual antes de sustituirlo
            this.colorLabelHover = event.target.style.backgroundColor;
            //Hay que montar el color de hover
            event.target.style.backgroundColor = "crimson";
        }//else
    }//OnHover
};

function init(){
    const theQuiz = new Quiz();
    document.querySelector("#quiz").addEventListener("submit", (evento) => {
        evento.preventDefault();

        theQuiz.corregir();
    })
}//init

//The one and only execution
init();
