//Criando váriavel com let para uma função
function calcular(){
    let ini = document.getElementById('txti')
    let fim = document.getElementById('txtf')
    let passo = document.getElementById('txtp')
    let res = document.getElementById('res')
if (ini.value.length == 0){
    res.innerHTML = 'Impossível contar!'
    window.alert('[ERRO] faltam dados!')
} else{
    res.innerHTML = 'contando...'
    //transformando o conteúdo em número
    let i = Number(ini.value)
    let f = Number(fim.value)
    let p = Number(passo.value)
    //contagem crescente ou regressiva
    if (i < f) {
        for(let c = i; c <= f; c += p){
            res.innerHTML += `${c} \u{1f449}`;
        }
    } else {
        for(let c = i; c >= f; c -= p){
            res.innerHTML += `${c} \u{1f449}`;
        }
    }
    res.innerHTML += `\u{1f3c1}`;
}
}
