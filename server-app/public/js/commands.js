var commands = [];

commands.push({
    name: 'Espruino',
    description: 'Some javascript commands for Espruino devices',
    evalJs: false,
    value: '',
    subCommands: [{
        name: 'Reset',
        description: 'Reset the espruino device',
        evalJs: false,
        value: 'reset();'
    }, {
        name: 'Test loop',
        description: 'Just a loop in javascript',
        evalJs: false,
        value: 'for (i = 0; i < 40; i++) print("line "+i);'
    }]
});

commands.push({
    name: 'SetDateTime',
    description: 'Set the date and time to current time',
    evalJs: true,
    value: 'let date = new Date(); "@@SetDateTime " + date.getFullYear() + "," + ("0"+(1+date.getMonth())).slice(-2) + "," + ("0"+date.getDate()).slice(-2) + "," + ("0"+date.getHours()).slice(-2) + "," + ("0"+date.getMinutes()).slice(-2) + "," + ("0"+date.getSeconds()).slice(-2);'
});
commands.push({
    name: 'SdCard',
    description: 'SdCard',
    evalJs: false,
    value: '@@SdCard',
    subCommands: [{
        name: 'List',
        description: 'List files in the root folder',
        evalJs: false,
        value: 'List'
    }, {
        name: 'Dir',
        description: 'List all files in a recursive way',
        evalJs: false,
        value: 'Dir'
    }, {
        name: 'Format',
        description: 'Format SD Card',
        evalJs: false,
        value: 'Format'
    }]
});

commands.push({
    name: 'PrintOrSetParam',
    description: 'PrintOrSetParam',
    evalJs: false,
    value: '@@PrintOrSetParam',
    subCommands: [{
        name: 'batteryVmin',
        description: 'batteryVmin (42.80 Philippe, 42 Autres)',
        evalJs: false,
        value: 'batteryVmin 40.6'
    }, {
        name: 'batteryVmax',
        description: 'batteryVmax (56.60 Philippe, 62.70 Autres)',
        evalJs: false,
        value: 'batteryVmax 57.4'
    }]
});

commands.push({
    name: 'Configuration',
    description: 'Configuration Erase, Save, Load',
    evalJs: false,
    value: '@@Configuration',
    subCommands: [{
        name: 'Erase',
        description: 'Erase',
        evalJs: false,
        value: 'Erase'
    }, {
        name: 'Save',
        description: 'Save',
        evalJs: false,
        value: 'Save'
    }, {
        name: 'Load',
        description: 'Load',
        evalJs: false,
        value: 'Load'
    }]
});