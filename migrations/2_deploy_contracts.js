var FuckPutin = artifacts.require('./FuckPutin.sol');

module.exports = function (deployer) {
  deployer.deploy(
    FuckPutin,
    'FuckPutin',
    'FPC',
    '18',
    // @TODO: deploy change
    '0xd425f9ca7b34dd090868c3ef06981e7bbed5aa0e4ff0b8307833fb57b3ae0ab6'
  );
};
