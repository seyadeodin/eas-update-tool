const fs = require('fs');
const appEnv = require('./app.env.js')

fs.readFile('./app.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    const json = JSON.parse(data);
    const args = process.argv.slice(2);

    changeVersion({args, json});
    changeEnvironment({args, json});

    fs.writeFile('./app.json', JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Version increased successfully!');
    });
  } catch (err) {
    console.error('Invalid JSON:', err);
  }
});

function changeVersion({ args, json }) {
  const version = json.expo.version.split('.').map(Number);
  if (args.includes('major')) {
    version[0]++;
    version[1] = 0;
    version[2] = 0;
    json.expo.ios.buildNumber = "1"
    json.expo.android.versionCode += 1
  } else if (args.includes('minor')) {
    version[1]++;
    version[2] = 0;
    json.expo.ios.buildNumber = "1"
    json.expo.android.versionCode += 1
  } else if (args.includes('bugfix')) {
    version[2]++;
    json.expo.ios.buildNumber = "1"
    json.expo.android.versionCode += 1
  }
  else if (args.includes('buildNumber')){
    json.expo.ios.buildNumber = Number(json.expo.ios.buildNumber) + 1
  }
  json.expo.version = version.join('.');
}

function changeEnvironment({ args, json }){
    if (args.includes('dev') || args.includes('preview')) {
      json.expo.name = appEnv.dev.name
      json.expo.ios.bundleIdentifier = appEnv.dev.bundleIdentifier
      json.expo.android.package = appEnv.dev.package
      changeConfigurationConst('development')
      console.log("Environment updated sucessfully")
    }
    if (args.includes('production') || args.includes('prod')) {
      json.expo.name = appEnv.production.name
      json.expo.ios.bundleIdentifier = appEnv.production.bundleIdentifier
      json.expo.android.package = appEnv.production.package
      changeConfigurationConst('production')
      console.log("Environment updated sucessfully")
    }
}

function changeConfigurationConst(env){
fs.readFile('./configuration/constants.ts', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const updatedData = data.replace(/const variables = .*/, `const variables = ${env}`);

  fs.writeFile('constants.ts', updatedData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('constants.ts file updated successfully!');
  });
});

}
