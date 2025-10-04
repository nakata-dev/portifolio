let num = document.querySelector('input#fnum')
let lista = document.querySelector('select#flista')
let res = document.querySelector('div#res')
let valores = []

function isNumero(n){
    if(Number(n) >=1 && Number(n)<= 100){
        return true
    }else{
        return false
    }
}
function inLista(n, l){
    if(l.indexOf(Number(n)) != -1){
        return true
    }else{
        return false
    }
}

function adicionar(){
    if (isNumero(num.value) && !inLista(num.value, valores)){
        valores.push(Number(num.value)) //puxa valores e os transforma em númesmo na lista, só não esta mostrando ainda.
        let item = document.createElement('option') //criando uma variavel item que será igual ao elemento de um option em html
        item.text = `Valor ${num.value} adicionado.` // o item texto vai retornar um valor numérico.
        lista.appendChild(item) //aqui o comando appendChild serve para inserir um filho dentro da lista.
        res.innerHTML = '' //quando for adicionado um novo valor o res deve retornar limpo.
    }else {
        window.alert('Valor inválido ou já encontrado na lista.')
    }
    num.value='' // ao clicar em adicionar
    num.focus() // ao clicar no espaço ele me retorna vazio
}

function finalizar() {
    if (valores.length == 0) { // se valores tiver o comprimento de 0, então...
        window.alert('Adicione valores antes de finalizar!')
    } else{
        let tot = valores.length // cria-se uma var tot para valores em sua extensão.
        let maior = valores [0] //definindo variavel maior
        let menor = valores [0]
        let soma = 0
        let media = 0
        for(let pos in valores){
            soma += valores[pos] //O operador += significa: "soma o valor à esquerda com o da direita e guarda no da esquerda"
            //ou seja, é igual a : soma = soma + valores[pos]
            if (valores[pos] > maior)
                maior = valores[pos] //passa a ser próximo número
            if (valores[pos] < menor)
                menor = valores[pos]
        }

        media = soma / tot // calcula a média
        res.innerHTML = '' // recebe vazio
        res.innerHTML +=`<p>Ao todo temos ${tot} números cadastrados. </p>` //mostra concatenação da váriavel tot (total de números cadastrados)
        res.innerHTML +=`<p>O maior valor informado foi ${maior}.</p>`
        res.innerHTML +=`<p>O menor valor informado foi ${menor}.</p>`
        res.innerHTML +=`<p>A soma de todos os valores, temos:${soma}.</p>`
        res.innerHTML +=`<p>A média dos valores digitados é:${media}.</p>`
    }
}