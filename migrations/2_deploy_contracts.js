var FuckPutin = artifacts.require('./FuckPutin.sol');

module.exports = function (deployer) {
  deployer.deploy(
    FuckPutin,
    'FuckPutin',
    'FPC',
    '18',
    // @TODO: prod '0xdcc128a1837fc0a39198bd75bb83ea5a6e4aeeb789e9d34314f85d9840768650'
    '0x1394c02189b8377a148768af97aafc2680ea401807b5fad132b284e8eaa5bc86'
  );
};
