//some global helpers
function handle_animation(element, animation){
  function remove_animation_class(){
    console.log('animation over')
    element.classList.remove('animated', animation)
    element.removeEventListener('animationend', remove_animation_class)
  }
  
  element.addEventListener('animationend', remove_animation_class)

  element.classList.add('animated', animation)
}

function save(k, v){
  localStorage.setItem(k, v)
  
}

