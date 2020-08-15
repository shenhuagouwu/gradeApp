App({
  onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    var code = "";
    var permissionsData = "";
    dd.getAuthCode({
      success:function(result){
        code = result.authCode;
        dd.httpRequest({
          url: 'https://www.xuankuangchina.com/Newapi/getuser',
          method: 'POST',
          data: {
            code: code,
          },
          dataType: 'json',
          success: function(res) {
            console.log(res,"0202");
            permissionsData = res.data.data;
            if(permissionsData.level == 3||permissionsData.level == 4){
              dd.redirectTo({
                url: '/pages/personDetail/personDetail?id='+permissionsData.id+'&name=' + permissionsData.name+'&teamID=' + permissionsData.uid
              });
            }
            dd.setStorage({
              key: 'permissionsData',
              data: {
                id: permissionsData.id,
                level: permissionsData.level,
                teamID: permissionsData.uid,
                name: permissionsData.name,
                openid: permissionsData.openid,
              },
              success: function() {}
            });
            
          },
          fail:function(err){
            console.log(err);
          }
        });
      },
      fail:function(err){
        console.log(err);
      }
    });
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
});
