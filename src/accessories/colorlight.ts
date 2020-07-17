import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { MagicHomePlatform } from '../platform';
import { Control } from 'magic-home';
import convert from 'color-convert';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ColorLight {
  private service: Service;
  private light: Control;
  

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    On: false,
    Hue: 0,
    Brightness: 100,
    Saturation: 0,
  }

  constructor(
    private readonly platform: MagicHomePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly ipAddress,
    private readonly type,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tom Butcher (MagicHome)')
      .setCharacteristic(this.platform.Characteristic.Model, 'LED Light')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '0000-0000-0000-0000');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
    // when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
    // this.accessory.getService('NAME') ?? this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    this.light = new Control(ipAddress, { log_all_received: false,
      apply_masks: false,
      ack: 0,
      connect_timeout: null});

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .on('get', this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .on('set', this.setBrightness.bind(this))       // SET - bind to the 'setBrightness` method below
      .on('get', this.getBrightness.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Hue)
      .on('set', this.setHue.bind(this))
      .on('get', this.getHue.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Saturation)
      .on('set', this.setSaturation.bind(this))
      .on('get', this.getSaturaton.bind(this));

  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off

    if (this.states.On !== value as boolean) {
      this.light.setPower(value);
      if (value === true) {
        const colVals = convert.hsv.rgb(this.states.Hue, this.states.Saturation, this.states.Brightness);
        this.light.setColor(colVals[0], colVals[1], colVals[2]); 
      }
    }
    
    this.states.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);

    // you must call the callback function
    
    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {

    this.light.queryState().then(state => {
      this.platform.log.debug('Get Characteristic On ->', state.on);
      this.states.On = state.on;
      callback(null, state.on);
    }).catch(err => {
      callback(null, this.states.On);
      // eslint-disable-next-line no-console
      return console.log('Error:', err.message);
    });
  }

  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to set the brightness
    this.states.Brightness = value as number;
    this.platform.log.debug('Set Characteristic Brightness -> ', value);

    if (this.states.On == true) {
      const colVals = convert.hsv.rgb(this.states.Hue, this.states.Saturation, value);

      this.light.setColor(colVals[0], colVals[1], colVals[2]).then(success => {
        this.platform.log.debug('Set the brightness = ' + success);
        callback(null);
      }).catch(err => {
        this.platform.log.debug('An erorr occoured: ' + err.message);
        callback(null);
      }); 
    } else {
      callback(null);
    }

    // you must call the callback function

  }

  getBrightness(callback: CharacteristicSetCallback) {
    this.light.queryState().then(state => {
      const colVals = convert.rgb.hsv(state.color.red, state.color.green, state.color.blue);
      this.platform.log.debug('Get Characteristic Brightness ->', colVals[2]);
      this.states.Brightness = colVals[2];
      callback(null, colVals[2]);
    }).catch(err => {
      callback(null, this.states.Brightness);
      // eslint-disable-next-line no-console
      return console.log('Error:', err.message);
    });
  }

  setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to set the brightness
    this.states.Hue = value as number;

    this.platform.log.debug('Set Characteristic Hue -> ', value);

    if (this.states.On == true) {
      const colVals = convert.hsv.rgb(value, this.states.Saturation, this.states.Brightness);

      this.light.setColor(colVals[0], colVals[1], colVals[2]).then(success => {
        this.platform.log.debug('Set the hue = ' + success);
        callback(null);
      }).catch(err => {
        this.platform.log.debug('An erorr occoured: ' + err.message);
        callback(null);
      }); 
    } else {
      callback(null);
    }

  }

  getHue(callback: CharacteristicSetCallback) {
    this.light.queryState().then(state => {
      const colVals = convert.rgb.hsv(state.color.red, state.color.green, state.color.blue);
      this.platform.log.debug('Get Characteristic Hue ->', colVals[0]);
      this.states.Hue = colVals[0];
      callback(null, colVals[0]);
    }).catch(err => {
      callback(null, this.states.Hue);
      // eslint-disable-next-line no-console
      return console.log('Error:', err.message);
    });
  }

  setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to set the brightness
    this.states.Saturation = value as number;

    this.platform.log.debug('Set Characteristic Saturation -> ', value);

    if (this.states.On == true) {
      const colVals = convert.hsv.rgb(this.states.Hue, value, this.states.Brightness);

      this.light.setColor(colVals[0], colVals[1], colVals[2]).then(success => {
        this.platform.log.debug('Set the saturation = ' + success);
        callback(null);
      }).catch(err => {
        this.platform.log.debug('An erorr occoured: ' + err.message);
        callback(null);
      }); 
    } else {
      callback(null);
    }
    
  }

  getSaturaton(callback: CharacteristicSetCallback) {
    this.light.queryState().then(state => {
      const colVals = convert.rgb.hsv(state.color.red, state.color.green, state.color.blue);
      this.platform.log.debug('Get Characteristic Hue ->', colVals[1]);
      this.states.Saturation = colVals[1];
      callback(null, colVals[1]);
    }).catch(err => {
      callback(null, this.states.Saturation);
      // eslint-disable-next-line no-console
      return console.log('Error:', err.message);
    });
  }


}