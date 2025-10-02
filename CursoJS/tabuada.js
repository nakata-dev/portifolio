   function tabuada() {
            let num = document.getElementById('txtn') // pega o input
            let tab = document.getElementById('seltab') // pega o select
            if (num.value.length == 0) { // verifica se digitou algo
                window.alert('Por favor, digite um número!')
            } else {
                let n = Number(num.value) // transforma em número
                let c = 1 // contador começa em 1
                tab.innerHTML = '' // limpa a lista antes de gerar
                while (c <= 10) { // laço de 1 até 10
                    let item = document.createElement('option') // cria <option>
                    item.text = `${n} x ${c} = ${n * c}` // texto visível
                    item.value = `tab ${c}` // valor interno (opcional)
                    tab.appendChild(item) // adiciona no <select>
                    c++ // incrementa o contador
                }
            }
        }