var APP = {
  Store: function () {
    this._store = [];
  },
  Message: function (userName, roomName, text) {
    this.user = userName;
    this.room = roomName;
    this.text = text;
  }
}

APP.Store.prototype.update = function () {
  var that = this;
  $.ajax({
    url : 'https://api.parse.com/1/classes/chatterbox',
    type : "GET",
    cache : false,
    accept: '*/*',
    connection: 'keep-alive',
    success : function(res) {
      res.results.forEach(function (msg) {
        that._store.push(msg);
      });
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

APP.Message.prototype.send = function () {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(this),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
}
