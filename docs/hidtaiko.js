var serial = {};

(function() {
  'use strict';

  // getPorts関数は、接続されているUSBデバイスのリストを取得し、シリアルポートオブジェクトのリストを返します。
  serial.getPorts = function() {
    return navigator.usb.getDevices().then(devices => {
      return devices.map(device => new serial.Port(device));
    });
  };

  // requestPort関数は、指定されたフィルタに一致するUSBデバイスの選択ダイアログを表示し、選択されたデバイスをシリアルポートオブジェクトとして返します。
  serial.requestPort = function() {
    const filters = [
      { 'vendorId': 0x0f0d, 'productId': 0x0092 }, // Arduino Leonardo
      { 'vendorId': 0x2341, 'productId': 0x8036 }, // Arduino Leonardo
      { 'vendorId': 0x2341, 'productId': 0x804d }, // Arduino/Genuino Zero
      { 'vendorId': 0x2341, 'productId': 0x804e }, // Arduino/Genuino MKR1000
      { 'vendorId': 0x2341, 'productId': 0x804f }, // Arduino MKRZERO
      { 'vendorId': 0x2341, 'productId': 0x8050 }, // Arduino MKR FOX 1200
      { 'vendorId': 0x2341, 'productId': 0x8052 }, // Arduino MKR GSM 1400
      { 'vendorId': 0x2341, 'productId': 0x8053 }, // Arduino MKR WAN 1300
      { 'vendorId': 0x2341, 'productId': 0x8054 }, // Arduino MKR WiFi 1010
      { 'vendorId': 0x2341, 'productId': 0x8055 }, // Arduino MKR NB 1500
      { 'vendorId': 0x2341, 'productId': 0x8056 }, // Arduino MKR Vidor 4000
      { 'vendorId': 0x2341, 'productId': 0x8057 }, // Arduino NANO 33 IoT
      { 'vendorId': 0x239A }, // Adafruit Boards!
    ];
    return navigator.usb.requestDevice({ 'filters': filters }).then(
      device => new serial.Port(device)
    );
  };

  // Portコンストラクタは、USBデバイスを受け取り、そのデバイスのシリアルポートを初期化します。
  serial.Port = function(device) {
    this.device_ = device;
    this.interfaceNumber_ = 2;  // WebUSB Arduinoデモの元々のインターフェース番号
    this.endpointIn_ = 5;       // WebUSB Arduinoデモの元々の入力エンドポイントID
    this.endpointOut_ = 4;      // WebUSB Arduinoデモの元々の出力エンドポイントID
  };

  // connectメソッドは、デバイスとの接続を確立し、データの受信ループを開始します。
  serial.Port.prototype.connect = function() {
    let readLoop = () => {
      this.device_.transferIn(this.endpointIn_, 64).then(result => {
        this.onReceive(result.data);
        readLoop();
      }, error => {
        this.onReceiveError(error);
      });
    };

    return this.device_.open()
        .then(() => {
          if (this.device_.configuration === null) {
            return this.device_.selectConfiguration(1);
          }
        })
        .then(() => {
          var configurationInterfaces = this.device_.configuration.interfaces;
          configurationInterfaces.forEach(element => {
            element.alternates.forEach(elementalt => {
              if (elementalt.interfaceClass == 0xff) { // ベンダー固有のインターフェースクラス
                this.interfaceNumber_ = element.interfaceNumber;
                elementalt.endpoints.forEach(elementendpoint => {
                  if (elementendpoint.direction == "out") {
                    this.endpointOut_ = elementendpoint.endpointNumber;
                  }
                  if (elementendpoint.direction == "in") {
                    this.endpointIn_ = elementendpoint.endpointNumber;
                  }
                });
              }
            });
          });
        })
        .then(() => this.device_.claimInterface(this.interfaceNumber_))
        .then(() => this.device_.selectAlternateInterface(this.interfaceNumber_, 0))
        .then(() => this.device_.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x01,
            'index': this.interfaceNumber_})) // DTR信号を高に設定し、ホストがデータの送受信の準備ができたことをデバイスに知らせる。
        .then(() => {
          readLoop();
        });
  };

  // disconnectメソッドは、デバイスとの接続を切断します。
  serial.Port.prototype.disconnect = function() {
    return this.device_.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x00,
            'index': this.interfaceNumber_}) // DTR信号を低に設定し、ホストが切断したことをデバイスに知らせる。
        .then(() => this.device_.close());
  };

  // sendメソッドは、デバイスにデータを送信します。
  serial.Port.prototype.send = function(data) {
    return this.device_.transferOut(this.endpointOut_, data);
  };
})();