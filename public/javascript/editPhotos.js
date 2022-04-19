// document.querySelectorAll('img').addEventListener('dblclick',function(){
//     alert("Double Clicked!")
// })
alert('test2')
// document.querySelectorAll('img').setAttribute('src', 'https://devsprouthosting.com/images/chicken.jpg')
document.getElementsByClassName('img-thumbnail').addEventListener('click',function(){
    console.log('test')
})

document.querySelectorAll('img').onclick = function(){
    console.log("You Clicked Me!")
}

alert('test')