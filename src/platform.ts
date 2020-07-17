import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ColorLight } from './accessories/colorlight';
import { Discovery } from 'magic-home';

export class MagicHomePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  setupDevices(devices) {
    this.log.info('Found ' + devices.length + ' magichome device(s)');
    for (const device of devices) {

      const uuid = this.api.hap.uuid.generate(device.id);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      let type;
      if (device.id in this.config) {
        type = this.config[device.id];
      } else {
        type = 'rgb';
      }
      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
        new ColorLight(this, existingAccessory, device.address, type);

      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device.id + ' : ' + device.model);
        const accessory = new this.api.platformAccessory(device.id + ' : ' + device.model, uuid);
        accessory.context.device = device;
        new ColorLight(this, accessory, device.address, type);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }

  discoverDevices() {

    this.log.info('Looking for devices...');
    if (this.config.discover === false) {
      this.log.info('Using config.json for device list');
      this.setupDevices(this.config.devices);
    } else {
      this.log.info('Using discovery');
      const discovery = new Discovery();
      discovery.scan(500).then(devices => {
        this.setupDevices(devices);
      });
    }
    

  }
}