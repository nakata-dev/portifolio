
var idade = 81 
console.log(`você tem ${idade} anos.`)
if (idade<16){
    console.log('Não vota')
}else if(idade < 18 || idade >65){
    console.log('e o voto é opcional')
}else{
    console.log('e o voto é Obrigatório!')
}