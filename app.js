var myCharacteristic;

var hrs = [];
var hr = 0;
var ex_flg = false;
var flg = false;
var count = 0;
var output = [['ex_time','heart_rate','flg']];
var output_csv = '';

function onStartButtonClick() {
    //alert('Javascriptを使ってアラートを表示しています！');

    navigator.bluetooth.requestDevice({filters: [{services: ['heart_rate']}]})
    .then(device => {
        document.getElementById('device_name').innerHTML = device.name ;
        return device.gatt.connect();
    })
    .then(server => {
    return server.getPrimaryService('heart_rate');
    })
    .then(service => {
    console.log('Getting Characteristic...');
    return service.getCharacteristic('heart_rate_measurement');
    })
    .then(characteristic => {
    myCharacteristic = characteristic;
    return myCharacteristic.startNotifications().then(_ => {
        console.log('> Notifications started');
        myCharacteristic.addEventListener('characteristicvaluechanged',
            handleNotifications);
    });
    })
    .catch(error => {
    console.log('Argh! ' + error);
    });

}

function onStopButtonClick() {
    if (myCharacteristic) {
        myCharacteristic.stopNotifications()
        .then(_ => {
        console.log('> Notifications stopped');
        myCharacteristic.removeEventListener('characteristicvaluechanged',
            handleNotifications);
        })
        .catch(error => {
        console.log('Argh! ' + error);
        });
    }
}

function handleNotifications(event) {
    let value = event.target.value;
    let a = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    //console.log(value.byteLength)
    for (let i = 0; i < value.byteLength; i++) {
      //a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
      a.push(value.getUint8(i));
    }
    hr = a[1];
    hrs.push(hr);
    let temp = [];
    if(ex_flg == true){
        count = count + 1;
        let time = ('00' + Math.floor(count/60)).slice(-2) + ':' + ('00' + count%60).slice(-2)
        temp.push(time);
        temp.push(hr);
        if(flg == true){
            temp.push(true);
            flg = false;
        }else{
            temp.push('')
        }
        output.push(temp);
        console.log(output);
        document.getElementById('ex_time').innerHTML = time ;
    }
    

    document.getElementById('heart_rate_now').innerHTML = hr.toString() ; 
    console.log('> ' + a.join(' '));
}

function onDownloadClick() {
    // get date
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1; 
    var day = date.getDate()
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var now_time = year.toString().slice(-2)
                + ('00' + month.toString()).slice(-2)
                + ('00' + day.toString()).slice(-2)
                + ('00' + hour.toString()).slice(-2) 
                + ('00' + minutes.toString()).slice(-2) ;
    console.log(now_time);
    
    // create a temporary "a" element.
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display:none";
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, output_csv], { type: " text/csv" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'heart_rate_' + now_time + '.csv';
    a.click();
    window.URL.revokeObjectURL(url); // release the used object.
    a.parentNode.removeChild(a); // delete the temporary "a" element
    
}

function ontestClick() {
    
    console.log(output);
    console.log(output.length)
    for (let i = 0; i < output.length; i++){
        console.log(output[i]);
        for (let j = 0; j < output[i].length; j++){
            console.log(output[i][j])
            output_csv += output[i][j]
            output_csv += ','
        }
        output_csv += '\n'
    }
    //console.log(output_csv)
    //console.log(typeof(output_csv))

    document.getElementById('log').innerHTML = output_csv ;

    
}

function ontrueClick() {
    flg = true;
    console.log('flg true')
}

function onexstartClick() {
    ex_flg = true;
    console.log('flg true')
}
function onexstopClick() {
    ex_flg = false;
    console.log('flg true')
}

function ondateClick() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1; //月が代入される
    var day = date.getDate()
    var hour = date.getHours();
    var minutes = date.getMinutes();
    //const seconds = date.getSeconds();
    //const milliseconds = date.getMilliseconds();
    //console.log(year,month,day,hour,minutes,seconds,milliseconds);
    var now_time = year.toString().slice(-2)
                + ('00' + month.toString()).slice(-2)
                + ('00' + day.toString()).slice(-2)
                + ('00' + hour.toString()).slice(-2) 
                + ('00' + minutes.toString()).slice(-2) ;
    console.log(now_time);
}