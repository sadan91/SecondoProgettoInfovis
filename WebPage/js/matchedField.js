//funzione di ausilio che trova la netmask made by Danilo
function findIpV4Netmask(value) {
    var netmask = '24'; // Di default ho una /24
    /* Estraggo l'eventuale netmask dall'indirizzo ip */
    var netmaskPosition = value.indexOf('/');
    if (netmaskPosition !== -1) {
        netmask = value.substring(netmaskPosition + 1, value.length);
    }
    /* Calcolo il prefisso utilizzando un'apposita libreria */
    IPv4_Address(value, netmask);
    //this.netaddressDotQuad è il prefisso ricavato.
    return this.netaddressDotQuad + '/' + netmask;
}

//oggetto dell'array toMatch
var ToMatch = function (name, clusterFun, expandFun) {
    //attributo json che identifica il campo di interesse
    this.fieldName = name;

    //funzione che modifica il valore del campo per confrontarlo
    if (clusterFun === undefined) {
        this.filter = function (a) {
            return a;
        }
    } else {
        this.filter = clusterFun;
    }

    //funzione che permette di introdurre un nuovo livello di filtering
    if (expandFun === undefined)
        this.expand = function () {
            return false;
        };
    else
        this.expand = expandFun;
}

//questa funzione è argomento di un array.forEach()
function defualtExpandFunction(elem, index, array){
    //queste funzioni avranno tutte questa forma
    var oldFieldName=this.fieldName;
    var res = new ToMatch(oldFieldName);
    array.splice(index + 1, 0, res); //aggiungo il nuovo ToMatch dopo il precedente  
    return true;
}

//fa in modo tale che tutti i toMatch abbiano eseguito le loro funzioni di expand
function normalizeToMatchArray(toMatchArray) {
    //esegue fintanto esiste un campo con expand non di default
    // potrebbe non essere necessario
    //poco robusto può portare a loop
    toMatchArray.forEach(function (elem, index, array) {
        elem.expand(elem, index, array);
    });
}

//esempio di toMatchArray
var defaultToMatchArray = [];

var ipFieldName="ip_add"
var ipOutToMatch = new ToMatch(ipFieldName+"_out", findIpV4Netmask,defualtExpandFunction);
defaultToMatchArray.push(ipOutToMatch);

var typeFieldName="packetType"
var typeToMatch = new ToMatch(typeFieldName);
defaultToMatchArray.push(typeToMatch);