var FuckPutin = artifacts.require('./FuckPutin.sol');

module.exports = function (deployer) {
  deployer.deploy(
    FuckPutin,
    'FuckPutin',
    'FPC',
    '18',
    '0xdcc128a1837fc0a39198bd75bb83ea5a6e4aeeb789e9d34314f85d9840768650'
  );
};
