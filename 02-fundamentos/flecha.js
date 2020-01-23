//funcion normal
// function sumar(a, b) {
//     return a + b;
// }

// funcion de flecha ES6
// let sumar = (a, b) => {
//     return a + b;
// }

// funcion de flecha ES6 mas resumida
// let sumar = (a, b) => a + b;

// console.log(sumar(10, 20));

//funcion normal
// function saludar() {
//     return 'Hola mundo';
// }
//funcion de flecha
// let saludar = () => 'Hola mundo';
// console.log(saludar());

// function saludar(nombre) {
//     return `Hola ${nombre}`;
// }

// let saludar = nombre => `Hola ${ nombre }`

// console.log(saludar('Daniel'))

let deadpool = {
    nombre: 'Wade',
    apellido: 'Winston',
    poder: 'Regeneración',
    getNombre () {
        return `${ this.nombre } ${ this.apellido } - poder: ${ this.poder }`
    }
}

console.log(deadpool.getNombre());