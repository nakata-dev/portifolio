/*let num = [5,4,6,2,3,1]

num.sort()
console.log(`Os elementos ordenados em ordem crescente é: ${num.sort()}`)
console.log(num)
console.log(`O vetor tem ${num.length} elementos`)
console.log(`O primeiro valor do vetor é número: ${num[0]}`) 

//------Vetor na tela------------
let valores = [8,4,7,3,9,2]

console.log(valores)
    for(let pos=0; pos<=valores.length; pos++){
        console.log(`A posição ${pos} tem o valor de ${valores[pos]}`)
    }
    
    let num = [8,4,7,3,9,2]
    num.sort()
    num.push(1)
    for(let pos in num)
    console.log(`A posição ${pos} tem valor ${num[pos]}`)
    */

let num = [8, 4, 7, 3, 9, 2]
num.push(1)
num.sort()
console.log(num)
console.log(`O vetor tem ${num.length} posições`)
    console.log(`O primeiro valor do vetor é ${num[0]}`)

let pos=num.indexOf(4)
if(pos==-1){
    console.log('O valor não foi encontrado!')
} else{
    console.log(`O valor 4 está na posição ${pos}`)
}