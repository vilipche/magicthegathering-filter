const colors = ['White', 'Blue', 'Black', 'Red', 'Green'];
const order = ['ascending', 'descending'];

const cardsURL = 'https://api.magicthegathering.io/v1/cards?random=true&pageSize=100&language=English';
const typesURL = 'https://api.magicthegathering.io/v1/types';

const currentOrder = 'ascending';
let latestFilter = {
    types: [],
    colors: [],
    sortingName: "ascending",
    name: ""
}

let cardsArray = []


// Updating the greeting name
window.addEventListener('load', ()=>{
    const name = localStorage.getItem('name');
    document.getElementById("hello").innerHTML = "Hello "+name;
})

//CREATE

//function that creates cards and renders them in the card container
const createCards = (cardObject) => {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML ="";

    cardObject.map(card => {
        let div = document.createElement('div')
        div.classList.add('card');
        
        //Image creation
        let image = document.createElement('IMG');
        if(card.imageUrl !== undefined) { //some objects don't have imageUrl in the api
            image.src = card.imageUrl;
        } else {
            image.src = './img/220px-Magic_the_gathering-card_back.jpg';
        }
        image.classList.add('image');
        div.appendChild(image);
        
        //Overlay creation
        const liElements = [card.name, card.types, card.setName, card.colors];
        let overlay = document.createElement('div');
        overlay.classList.add('overlay');

        let ul = document.createElement('ul');
        
        //we are printing the data in the overlay
        for(let i=0;i<liElements.length;i++) {
            let liElement = document.createElement('li');
            if(i===0) {
                liElement.innerHTML = liElements[i] == "" ? "Name: No Data" : "Name: "+ liElements[i];
            } else if(i===1) {
                liElement.innerHTML = liElements[i] == "" ? "Type: No Data" : "Type: "+ liElements[i];
            } else if(i===2) {
                liElement.innerHTML = liElements[i] == "" ? "Set: No Data" : "Set: "+ liElements[i];
            } else if(i===3) {
                liElement.innerHTML = liElements[i] == "" ? "Color: No Data" : "Color: "+ liElements[i];
            }
            
            ul.appendChild(liElement);
        }

        overlay.appendChild(ul);
        div.appendChild(overlay);

        //adding data- attribute to the html files
        div.dataset.name = card.name;
        div.dataset.types = card.types;
        div.dataset.colors = card.colors;

        cardContainer.appendChild(div);
    });
}


// Function that we use in order to add option elements to select element
const createSelectElement = (values, selectID, multiple = false) => {
    const select = document.getElementById(selectID);

    values.forEach(value => {
        const option = document.createElement('option');
        option.innerHTML = value;
        if (multiple) select.multiple = "multiple"; 
        option.value = value;
        select.appendChild(option);
    })
}

//UPDATE

//function that is called when the reset button is clicked
//Normally, it resets the vlaues of the search elements
const resetFilters = () => {
    document.getElementById('nameSearch').value=""
    document.getElementById('selectTypes').value=""
    document.getElementById('selectColors').value=""
    updateTypesAndColors();
    updateSearch(document.getElementById('nameSearch'));
    const orders = document.getElementById('selectOrders')
    orders.dataset.order = 'ascending';
    updateOrders(orders)
}

//function that is called when either we change the selected value in colors or types
const updateTypesAndColors = () => {
    const colorSelector = document.getElementById('selectColors');
    filterColors = [...colorSelector.options].filter(x=>x.selected).map(x=>x.value);

    const typeSelector = document.getElementById('selectTypes');
    filterTypes = [...typeSelector.options].filter(x=>x.selected).map(x=>x.value);

    const cards = document.querySelectorAll('.card');

    if(filterColors.length === 0 && filterTypes.length === 0) {
        cards.forEach(card => {
            card.style.display = "none";
        })
    } else if( filterColors.length !== 0 && filterTypes.length === 0) {
        cards.forEach(card => {
            if(card.dataset.colors.split(',').every(a => filterColors.includes(a))) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
    
        })
    } else if( filterColors.length === 0 && filterTypes.length !== 0) {
        cards.forEach(card => {
            if(card.dataset.types.split(',').every(a => filterTypes.includes(a))) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
    
        })
    } else if ( filterColors.length !== 0 && filterTypes.length !== 0) {
        cards.forEach(card => {
            if(card.dataset.colors.split(',').every(a => filterColors.includes(a)) &&
            card.dataset.types.split(',').every(a => filterTypes.includes(a))) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
    
        })
    }

}

//function that changes the order of the cards
const updateOrders = (node) => {
    const container = document.getElementById('cardContainer');
    if(node.dataset.order !== node.value) {
        node.dataset.order = node.value;

        for (let i = 1; i < container.childNodes.length; i++){
            let nextChild = container.childNodes[i];
            let prevChild = container.firstChild;
            container.insertBefore(nextChild, prevChild);
        }
    }
}

//function that filters the cards by word
const updateSearch = ( node ) => {

    const cards = document.querySelectorAll('.card');

    let inputName = node.value.toUpperCase();

        cards.forEach(card => {
            let cardName = card.dataset.name.toUpperCase();

            if(inputName == "" || cardName.indexOf(inputName) > -1 && card.style.display === "") {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        })
        
}


//REQUEST

//Function that is called when fetching the cards
const getCardsData = async (cardsURL) => {
    console.log("Fetching cards data");
    const request = await fetch(cardsURL);
    const data = await request.json();
    console.log("Fetched data");
    return data;
}

//Function that is called when fetching the card types
const getTypesData = async (typesURL) => {
    console.log("Fetching types");
    const request = await fetch(typesURL);
    const data = await request.json();
    console.log("Fetched types");
    return data;
}

//async function that returns the promise from the get functions when we call the api
const callData = async () => {
    return  Promise.all([getCardsData(cardsURL), getTypesData(typesURL)])
                                        .catch( (err) => console.log(err) );
}


//the function that initializes the page, fetches the data and renders the elements
const render = async () => {
    const [cardsData, typesData] = await callData();
    cardsArray = sortCards(cardsData.cards);
    createCards(cardsArray);
    createSelectElement(typesData.types, 'selectTypes', true);
    createSelectElement(colors, 'selectColors', true);
    createSelectElement(order, 'selectOrders');
}

//TOOLS
// function that sorts an array 
const sortCards = (arr) => {
    return arr.sort( (a,b) => {
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
    })
}


render();