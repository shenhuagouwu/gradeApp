if(!self.__appxInited) {
self.__appxInited = 1;


require('./config$');


var AFAppX = self.AFAppX.getAppContext
  ? self.AFAppX.getAppContext().AFAppX
  : self.AFAppX;
self.getCurrentPages = AFAppX.getCurrentPages;
self.getApp = AFAppX.getApp;
self.Page = AFAppX.Page;
self.App = AFAppX.App;
self.my = AFAppX.bridge || AFAppX.abridge;
self.abridge = self.my;
self.Component = AFAppX.WorkerComponent || function(){};
self.$global = AFAppX.$global;
self.requirePlugin = AFAppX.requirePlugin;
        

if(AFAppX.registerApp) {
  AFAppX.registerApp({
    appJSON: appXAppJson,
  });
}



function success() {
require('../../app');
require('../../components/line/index?hash=05d2a9730dd6009bf9446182f9c985f40f8c0f43');
require('../../components/column/index?hash=05d2a9730dd6009bf9446182f9c985f40f8c0f43');
require('../../pages/index/index?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/subGroup/subGroup?hash=b3d353fc8958a26656f8245eb2bf4ce5fa50ab81');
require('../../pages/team/team?hash=c708ad47e2f4dc5e0d3d16c0b1f9ee2c130d9dd5');
require('../../pages/combine/combine?hash=b3d353fc8958a26656f8245eb2bf4ce5fa50ab81');
require('../../pages/personDetail/personDetail?hash=b3d353fc8958a26656f8245eb2bf4ce5fa50ab81');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}