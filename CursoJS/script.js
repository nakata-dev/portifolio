var msg = window.document.getElementById('msg')
var img = window.document.getElementById('imagem')
var data = new Date()
var hora = data.getHours()

msg.innerHTML=`Agora são ${hora} horas`
if (hora >= 0 && hora < 12){
    //Bom dia
    img.src='img/manha.png'
    document.body.style.background='#ffa131'
} else if (hora >= 12 && hora < 18){
    //Boa tarde
    img.src='img/tarde.png'
    document.body.style.background = '#d18355'
} else{
    //Boa noite
    img.src='img/noite.png'
    document.body.style.background = '#283442'
}