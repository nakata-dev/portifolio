function verificar() {
    var data = new Date()
    var ano = data.getFullYear()
    var fano = document.getElementById('txtano')
    var res = document.querySelector('div#res')
    if (fano.value.length == 0 || Number(fano.value) > ano) {
        window.alert('[ERRO] Verifique o ano e tente novamente!')
    } else {
        var fsex = document.getElementsByName('radsex')
        var idade = ano - Number(fano.value)
        var genero = ''
        var img = document.createElement('img')
        img.setAttribute('id', 'foto')
        if (fsex[0].checked) {
            genero = 'Homem'
            if (idade >= 0 && idade <= 10) {
                //Criança
                img.setAttribute('src', 'img/menino_crianca.png')
            } else if (idade < 21) {
                //Jovem
                img.setAttribute('src', 'img/homem_jovem.png')
            } else if (idade < 50) {
                //Adulto
                img.setAttribute('src', 'img/homem_adulto.png')
            } else {
                //idoso
                img.setAttribute('src', 'img/homem_idoso.png')
            }
        } else if (fsex[1].checked) {
            genero = 'Mulher'
            if (idade >= 0 && idade <= 10) {
                //Criança
                img.setAttribute('src', 'img/menina_crianca.png')
            } else if (idade < 21) {
                //Jovem
                img.setAttribute('src', 'img/mulher_jovem.png')
            } else if (idade < 50) {
                //Adulto
                img.setAttribute('src', 'img/mulher_adulta.png')
            } else {
                //idoso
                img.setAttribute('src', 'img/senhora-idosa.png')
            }
        }
    }
    res.style.textAlign = 'center'
    res.innerHTML = `Detectamos ${genero} com ${idade} anos.`
    res.appendChild(img)

    img.style.display = 'block'
    img.style.margin = '10px auto'
    img.style.maxWidth = '200px' // opcional, para não ficar gigante

}