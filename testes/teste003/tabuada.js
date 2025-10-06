function calcular(){
    let num = document.getElementById('txtn')
    let tab = document.getElementById('celtab')
    if(num.value.length == 0){
        window.alert('Por favor, digite um número!')
    } else{
        let n = Number(num.value)
        let c = 1
        tab.innerHTML=''
        while (c<=10){
            //variável item cria um elemento no documento do tipo ('option')
            let item = document.createElement('option') 
            // item de texto vai ser = número x contador = número x contador
            item.text = `${n} x ${c} = ${n*c}`
            //o item guarda o valor = tabela do contador
            item.value= `tab${c}`
            // tabela do tipo filho guarda valor do (item)
            tab.appendChild (item) // aqui estava o erro
            // este comando não pode faltar, caso contrário não conta até o fim do laço que é de 1 à 10
            c++ //ou  c = c+1
        }
    }
}