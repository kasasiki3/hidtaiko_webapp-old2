(function() {
    'use strict';
  
    // ページが読み込まれたときに実行する初期化処理
    document.addEventListener('DOMContentLoaded', event => {
      // HTML要素の取得
      let connectButton = document.querySelector("#connect"); // 接続ボタン
      let saveButton = document.querySelector("#save"); // 保存ボタン
      let statusDisplay = document.querySelector('#status'); // ステータス表示
      let Slider0 = document.querySelector('#dx0'); // a0スライダー
      let Slider1 = document.querySelector('#dx1'); 
      let Slider2 = document.querySelector('#dx2'); 
      let Slider3 = document.querySelector('#dx3'); 
      let Slidera = document.querySelector('#dxa'); 
      let Sliderb = document.querySelector('#dxb'); 
      let Sliderc = document.querySelector('#dxc'); 
      let Sliderp = document.querySelector('#dxp'); 
      let Sliderh = document.querySelector('#dxh');  
      let port; // シリアルポート
      let color = new Array(9);
      let colorin = 0;
      let receivedDataArray = []; // 受信データを格納する配列
      const rangeValue0 = document.querySelector('#valueDx0');
      const rangeValue1 = document.querySelector('#valueDx1');
      const rangeValue2 = document.querySelector('#valueDx2');
      const rangeValue3 = document.querySelector('#valueDx3');
      const rangeValuea = document.querySelector('#valueDxa');
      const rangeValueb = document.querySelector('#valueDxb');
      const rangeValuec = document.querySelector('#valueDxc');
      const rangeValuep = document.querySelector('#valueDxp');
      const rangeValueh = document.querySelector('#valueDxh');
      // シリアルポートに接続する関数
      function connect() {
        port.connect().then(() => {
          statusDisplay.textContent = ''; // ステータス表示をクリア
          connectButton.textContent = 'Disconnect'; // ボタンのテキストを変更
  
          // データ受信時の処理(デコードしてコンソールに出力)
          port.onReceive = data => {
            let textDecoder = new TextDecoder();
            let decodedText = textDecoder.decode(data);
            console.log(decodedText);
            color[colorin++] = decodedText;
            console.log(colorin);
            if(colorin == 9){
              colorin = 0;
              console.log(color);
            }
            // 受信したデータを配列に追加する
            let dataString = decodedText.trim();
            let dataArray = dataString.split("\n").map(Number);
            receivedDataArray[0] = dataArray[0];
            receivedDataArray[1] = dataArray[1];
            receivedDataArray[2] = dataArray[2];
            receivedDataArray[3] = dataArray[3];
            receivedDataArray[4] = dataArray[4];
            receivedDataArray[5] = dataArray[5];
            receivedDataArray[6] = dataArray[6];
            receivedDataArray[7] = dataArray[7];
            receivedDataArray[8] = dataArray[8];
          //  receivedDataArray.push(...dataArray);
            console.log("Received Data Array: ", receivedDataArray);
            Slider0.value = receivedDataArray[0];
            Slider1.value = receivedDataArray[1];
            Slider2.value = receivedDataArray[2];
            Slider3.value = receivedDataArray[3];
            Slidera.value = receivedDataArray[4];
            Sliderb.value = receivedDataArray[5];
            Sliderc.value = receivedDataArray[6];
            Sliderp.value = receivedDataArray[7];
            Sliderh.value = receivedDataArray[8];
            rangeValue0.textContent = receivedDataArray[0];
            rangeValue1.textContent = receivedDataArray[1];
            rangeValue2.textContent = receivedDataArray[2];
            rangeValue3.textContent = receivedDataArray[3];
            rangeValuea.textContent = receivedDataArray[4];
            rangeValueb.textContent = receivedDataArray[5];
            rangeValuec.textContent = receivedDataArray[6];
            rangeValuep.textContent = receivedDataArray[7];
            rangeValueh.textContent = receivedDataArray[8];      
          };
  
          // データ受信エラー時の処理
          port.onReceiveError = error => {
            console.error(error);
          };
        }, error => {
          statusDisplay.textContent = error; // エラーをステータス表示に出力
        });
      }
  
  
      // スライダーの値が変更されたときにシリアルポートにデータを送信する関数
      function onUpdate() {
        if (!port) {
          return;
        }
  
        let view = new Uint8Array(9);
        view[0] = parseInt(Slider0.value); // a0のスライダーの値を取得
        view[1] = parseInt(Slider1.value);
        view[2] = parseInt(Slider2.value); 
        view[3] = parseInt(Slider3.value); 
        view[4] = parseInt(Slidera.value); 
        view[5] = parseInt(Sliderb.value); 
        view[6] = parseInt(Sliderc.value); 
        view[7] = parseInt(Sliderp.value); 
        view[8] = parseInt(Sliderh.value); 
        port.send(view); // データをシリアルポートに送信
      }
  
      // スライダーの値が変更されたときに onUpdate 関数を呼び出すイベントリスナーを追加
      Slider0.addEventListener('input', onUpdate);
      Slider1.addEventListener('input', onUpdate);
      Slider2.addEventListener('input', onUpdate);
      Slider3.addEventListener('input', onUpdate);
      Slidera.addEventListener('input', onUpdate);
      Sliderb.addEventListener('input', onUpdate);
      Sliderc.addEventListener('input', onUpdate);
      Sliderp.addEventListener('input', onUpdate);
      Sliderh.addEventListener('input', onUpdate);
      
      // 接続ボタンがクリックされたときの処理
      connectButton.addEventListener('click', function() {
        if (port) {
          port.disconnect(); // 接続を切断
          connectButton.textContent = 'Connect'; // ボタンのテキストを変更
          statusDisplay.textContent = ''; // ステータス表示をクリア
          port = null; // ポートをリセット
        } else {
          // シリアルポートの選択を要求
          serial.requestPort().then(selectedPort => {
            port = selectedPort;
            connect(); // 選択されたポートに接続
          }).catch(error => {
            statusDisplay.textContent = error; // エラーをステータス表示に出力
          });
        }
      });
  
  // saveButtonがクリックされたときの処理
  saveButton.addEventListener('click', async () => {
    try {
      if (!port) {
        throw new Error('No serial port connected.');
      }
  
      // 送信するデータを設定
      let view = new Uint8Array(1);
      view[0] = 0;
  
      // データを送信
      await port.send(view);
      console.log('データを送信しました: 0');
    } catch (error) {
      console.error('エラーが発生しました:', error);
    }
  });
  
  
      // 利用可能なシリアルポートを取得して接続を試みる
      serial.getPorts().then(ports => {
        if (ports.length == 0) {
          statusDisplay.textContent = 'No device found.'; // デバイスが見つからない場合
        } else {
          statusDisplay.textContent = 'Connecting...'; // 接続を試みる場合
          port = ports[0];
          connect(); // 最初に見つかったポートに接続
        }
      });
    });
  })();
