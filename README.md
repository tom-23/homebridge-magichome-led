# A better homebridge plugin for the MagicHome LED Controller

cus, why not?

## The aims of this project:
- Use of the NodeJS port of flux_led.py to keep everything in JS
- Address some bugs when switching scenes in the Home app
- Easy device descovery using the library

## Installation
`npm install -g homebridge-magichome-led`

And add this to your ``config.json``:
```json
"platforms": [
    {
      "platform" : "MagicHomeLED"
    }
  ]
```

Devices should autodetect and appear in the home app with their mac address and model number. You can rename thease using the home app.

## Manual Config
Sometimes, there can be an issue with detecting devices. You can define devices too in the config.json file:

```json
"platforms": [
    {
      "platform" : "MagicHomeLED",
      "discover": false,
      "devices": [
        {
          "address" : "192.168.X.XXX",
          "id": "MAC_ADDRESS",
          "model": "XXXXXXXX"
        }
      ]
    }
  ]
```

## Todo

- [ ] Clean up
- [ ] RGBW and RGBWW device support
