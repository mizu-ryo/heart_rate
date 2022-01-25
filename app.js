var myCharacteristic;

var hrs = [];
var hr = 0;
var count = 0;
var output = [['count','heart rate']];

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
    temp.push(count);
    temp.push(hr);
    output.push(temp);
    count = count + 1;
    console.log(output);

    document.getElementById('heart_rate_now').innerHTML = hr.toString() ;
    console.log('> ' + a.join(' '));
}

function oneditClick() {
    //str = ".innerHTMLで変数渡し！";
    document.getElementById('heart_rate_now').innerHTML = hrs.toString() ;
    
    // create a temporary "a" element.
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display:none";
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, output], { type: " text/csv" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'sample.csv';
    a.click();
    window.URL.revokeObjectURL(url); // release the used object.
    a.parentNode.removeChild(a); // delete the temporary "a" element
    
}