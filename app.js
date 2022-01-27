var myCharacteristic;

var hr = 0;
var hr_sum = 0;
var hr_ave = 0;
var hr_max = 0;
var hr_min = 0;

var count = 0;
var ex_count = 0;

var ex_flag = false;
var check_point_flag= false;

var check_point_log = 'check point log\n';
var output = 'ex_time,heart_rate,flg\n';

function onDeviceConnectClick() {
    navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
        .then(device => {
            document.getElementById('device_name').innerHTML = device.name;
            return device.gatt.connect();
        })
        .then(server => {
            return server.getPrimaryService('heart_rate');
        })
        .then(service => {
            //console.log('Getting Characteristic...');
            return service.getCharacteristic('heart_rate_measurement');
        })
        .then(characteristic => {
            myCharacteristic = characteristic;
            return myCharacteristic.startNotifications().then(_ => {
                document.getElementById('device_status').innerHTML = 'Notifications started';
                //console.log('> Notifications started');
                myCharacteristic.addEventListener('characteristicvaluechanged',
                    handleNotifications);
            });
        })
        .catch(error => {
            document.getElementById('device_status').innerHTML = error;
            //console.log('Argh! ' + error);
        });

}

function onDeviceDisconnectClick() {
    if (myCharacteristic) {
        myCharacteristic.stopNotifications()
            .then(_ => {
                document.getElementById('device_status').innerHTML = 'Notifications stopped';
                //console.log('> Notifications stopped');
                myCharacteristic.removeEventListener('characteristicvaluechanged',
                    handleNotifications);
            })
            .catch(error => {
                document.getElementById('device_status').innerHTML = error;
                //console.log('Argh! ' + error);
            });
    }
}

function handleNotifications(event) {
    let value = event.target.value;
    let data = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    for (let i = 0; i < value.byteLength; i++) {
        data.push(value.getUint8(i));
    }

    count++;
    hr = data[1];
    hr_sum += hr;
    hr_ave = hr_sum / count;

    if (count == 1) {
        hr_max = hr;
        hr_min = hr;
    }
    if (hr > hr_max) {
        hr_max = hr;
    }
    if (hr < hr_min) {
        hr_min = hr;
    }

    if (ex_flag == true) {
        ex_count++;
        let ex_time = ('00' + Math.floor(ex_count / 60)).slice(-2) + ':' + ('00' + ex_count % 60).slice(-2);

        let tmp = ex_time + ',' + hr + ',';
        if (check_point_flag == true) {
            tmp += true;
            check_point_log += tmp + '\n';
            document.getElementById('check_point_log').innerHTML = check_point_log;
            check_point_flag = false;
        } else {
            tmp += '';
        }

        output += tmp + '\n';
        
        document.getElementById('ex_time').innerHTML = ex_time;
        document.getElementById('ex_log').innerHTML = output;
        
        var log_text_box = document.getElementById('ex_log');
        log_text_box.scrollTop = 20 * ex_count;
        
    }

    document.getElementById('heart_rate_now').innerHTML = hr;
    document.getElementById('heart_rate_ave').innerHTML = hr_ave.toFixed(2);
    document.getElementById('heart_rate_max').innerHTML = hr_max;
    document.getElementById('heart_rate_min').innerHTML = hr_min;
    //console.log('> ' + a.join(' '));
}

function onExStartClick() {
    ex_flag = true;
    var ctx = document.getElementById("cv").getContext("2d");
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(15, 15, 10, 0, Math.PI * 2, true);
    ctx.fill();
}

function onExStopClick() {
    ex_flag = false;
    var ctx = document.getElementById("cv").getContext("2d");
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.arc(15, 15, 10, 0, Math.PI * 2, true);
    ctx.fill();
}

function onCheckPointClick() {
    check_point_flag = true;
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
        + ('00' + minutes.toString()).slice(-2);
    //console.log(now_time);

    // create a temporary "a" element.
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display:none";
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, output], { type: " text/csv" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'heart_rate_' + now_time + '.csv';
    a.click();
    window.URL.revokeObjectURL(url); // release the used object.
    a.parentNode.removeChild(a); // delete the temporary "a" element
}