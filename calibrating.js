document.addEventListener('DOMContentLoaded', function(){
 init()
})


var calibration_points = []

var sfy = JSON.stringify
var pse = JSON.parse

var add_new_test_btn = document.getElementById('add_new_test_btn')
var new_test_name = document.getElementById('new_test_name')
var test_list_select = document.getElementById('test_list')
var current_test_name = document.getElementById('current_test_name')
var calibrate_setup_section = document.getElementById('calibrate_setup_section')
var calibrate_edit_btn = document.getElementById('calibrate_edit_btn')
var cal_curve_section = document.getElementById('cal_curve_section')
var cal_table = document.getElementById('cal_table')

var cal_data = {}



function init(){
  var calibration_data = pse(localStorage.getItem("calibration_data"))
  test_list_select.value="start"
  current_test_name.innerText='select a test from the list below'

  if(calibration_data == null){
    toastada.warning('You have no tests in your list.  Please add a test')
    // calibrate_setup_section.classList.add('animated', 'bounce')
    handle_animation(calibrate_setup_section, 'bounce')
    return
  }else{
    cal_data = calibration_data;
    for( let k in cal_data ){
      add_test_to_list(k, k, false)//when initializing, i dont want to set the select
    } 
    //just sets begining starting  point for list
    test_list_select.value="start"

  }

  // if(test_list.length === 0){
  //   toastada.warning('You have no tests in your list.  Please add a test')
  // }
}

function add_test_to_list(name, value, flag){
  // var option = '<option value="'+value+'">'+name+'</option>'
  test_list_select.add(new Option(name, value))
  new_test_name.value = ''
  if(flag !== false) set_test_select(test_list_select, name)
}

function reset_table(table){
  var x = table.children.length

  while(x>1){
    cal_table.removeChild(cal_table.children[x-1])
    x = table.children.length

  }


}

var table_rows_array = []
function make_table_row(k, data){
  let tr = document.createElement('tr')
  let td1 = document.createElement('td')
  let td2 = document.createElement('td')
  let span1 = document.createElement('span')
  let span2 = document.createElement('span')
  let span3 = document.createElement('span')
  span1.classList.add('red')
  span2.classList.add('green')
  span3.classList.add('blue')

  span1.innerText=data[k][0]
  span2.innerText=data[k][1]
  span3.innerText=data[k][2]
  td1.innerText=k
  td2.appendChild(span1)
  td2.appendChild(span2)
  td2.appendChild(span3)
  tr.appendChild(td1)
  tr.appendChild(td2)
  table_rows_array.push(tr)
}
function populate_data_table(data, test){
  console.log('populate chart with one or more?')
  console.log(Object.keys(data).length)
  if(Object.keys(data).length == 0){
    console.log('No data points')
    table_rows_array.length=0
    reset_table(cal_table)
    toastada.warning('No data saved for '+test+'.  Try adding some calibration points')
    handle_animation(add_calibration_point_btn, 'shake')
    
  }else if(Object.keys(data).length == 1) {
    console.log('just append one here')
    for(let k in data){
      make_table_row(k, data)
    }

  }else{

      table_rows_array.length=0
      reset_table(cal_table)

    for(let k in data){
      make_table_row(k, data)
    }

  }
  console.log(table_rows_array)
  table_rows_array.forEach((i)=>{
    cal_table.append(i)
  })
  // cal_table.appendChild(table_rows_array)


}



function get_test_data(test){
  if(test ==="start") return //hacky just to avoid running if in preset start mode
  console.log(test)
  var data_points = cal_data[test]
  populate_data_table(data_points, test)


}

add_calibration_point_btn.addEventListener('click', ()=>{
  if(!video_is_running){
    toastada.error('Resume reader to add calibration point')
    handle_animation(start_btn, 'shake')
    return
  }
  console.log('stop and take a measurement')
  stop_reader()  
  var colors = [red_result.innerText, green_result.innerText, blue_result.innerText]
  let val = prompt('please enter a value for last reading')
  if(val.trim() == '' || val.trim() === null || val.trim() === undefined ) return
  // TODO combine these two save functions into one
  cal_data[current_test_name.innerText][val]= colors
  save('calibration_data', sfy(cal_data))
  //TODO possibly add the render function in the save
  console.log('show me what val is saved '+val)
  populate_data_table({[val]:colors}, current_test_name.innerText)
})

calibrate_edit_btn.addEventListener('click', ()=>{
  if(current_test_name.innerText == ''){
    toastada.warning('Select a test, or creat a new one')
    // calibrate_setup_section.classList.add('animated', 'bounce')
    handle_animation(calibrate_setup_section, 'bounce')
    return
  }else{
    console.log('Lets edit this test '+current_test_name.innerText)

  }
})

test_list_select.addEventListener('change', (e)=>{
  var test = e.target.value
  if(test ==="start") return
  console.log(test)
  current_test_name.innerText = test
  get_test_data(test)
  cal_curve_section.style.display='block'
})

new_test_name.addEventListener('keypress', (e)=>{
  console.log(e)
  var key = e.which || e.keyCode
  if(key === 13){
    add_new_test_btn.click()
  }
})

add_new_test_btn.addEventListener('click', ()=>{
  var test = new_test_name.value;
  if(test.trim() == ''){
    toastada.error('Please eneter the name of the test you wish to add')
    // calibrate_setup_section.classList.add('animated', 'shake')
    handle_animation(calibrate_setup_section, 'shake')
    return
  }
  if(cal_data[test]==undefined){
    console.log('this is  anew test')
    cal_data[test]={}
    add_test_to_list(test, test)
    save("calibration_data", sfy(cal_data))

  }else{
    var msg = '"'+test+'" already exists'
    // calibrate_setup_section.classList.add('animated', 'shake')
    handle_animation(calibrate_setup_section, 'shake')
    set_test_select(test_list_select,test)

    toastada.error(msg)
    console.log(msg)

  }
})

function set_test_select(select, test){
  var onChange_event = new Event('change');
  select.value=test
  select.dispatchEvent(onChange_event)
}



Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function crazy_mapper(r, g, b){

  // 8 sets of 255 = 2040 total

  //first 0 ,0 ,0 => 255, 0, 0
  if(r <=255 && g == 0 && b == 0){
    console.log(r.map(0, 255, 0, 2040))
  //255 ,0 ,0 => 255, 255, 0
  }else if (r == 255 && g <= 255 && b == 0){
    console.log(r.map(0, 255, 0, 2040))

  //255 ,255 ,0 => 0, 255, 0
  }else if(r <=255 && g == 255 && b == 0){

  //0 ,255 ,0 => 0, 255, 255
  }else if(r == 0 && g == 255 && b<=255){

  //0 ,255 ,255 => 0, 0, 255
  }else if(r == 0 && g <=255 && b == 255){

  //0 ,0 ,255 => 255, 0, 255
  }else if(r <= 255 && g ==0 && b == 255){

  //255, 0, 255 => 255, 255, 255
  }else if(r == 255 && g <=255 && b == 255){

  }
}