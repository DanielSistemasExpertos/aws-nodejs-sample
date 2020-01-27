// Async Await

// let getNombre = async () => {

//     // throw new Error('No existe un nombre para ese usuario');

//     return 'Fernando';
// };

// promesa sin async
let getNombre = () => {
    return new Promise( (resolve, reject) => {

        setTimeout( () => {
            
            resolve('Daniel');

        }, 3000);    
    });
}

let saludo = async() => {

    let nombre = await getNombre();

    return `Hola ${ nombre }`;
}

// transforma la promesa con async
saludo().then( mensaje => {
    console.log(mensaje);
})