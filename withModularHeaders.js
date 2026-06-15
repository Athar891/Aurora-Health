const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(file, 'utf8');
      if (!contents.includes('use_modular_headers!')) {
        contents = contents.replace(
          /use_react_native!\(/g,
          "use_modular_headers!\n  use_react_native!("
        );
        fs.writeFileSync(file, contents);
      }
      return config;
    },
  ]);
};
