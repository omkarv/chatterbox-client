var app = {
  store: [],
  init: function () {
    var that = this;
    that.fetch();
   // that.listRooms();
    setInterval(function(){
       that.fetch();
    }, 3000);
  },
  Message: function (userName, roomName, text) {
    this.user = userName;
    this.room = roomName;
    this.text = text;
    this.id = null;
    this.stamp = null;
  },
  listRooms: function () {
    var that = this;
    var roomList = _.unique(_.pluck(this.store, 'roomname'));
    d3.selectAll('option').remove();
    d3.select('select').selectAll('option')
      .data(roomList)
        .enter()
          .append('option')
            .text(function(d){return d;});
    console.log(roomList);
    d3.select('select').on('change', function(){
    //  console.log(d3.event);
      console.log(d3.event.target.selectedOptions[0].innerText);
      that.filter = d3.event.target.selectedOptions[0].innerText;
      that.render();
    });

    //return _.unique(_.pluck(this.store, 'roomname'));
  },
  once: false,
  filter: undefined,
  onInput:  function(){
    var message = $('.draft').val();
    var room = $('.room').val();
    app.send({
      text: message,
      username: window.location.search.slice(10),
      roomname: room
    });
  },
  send: function (message) {
    var that = this;
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (res) {
        if(_.where(that.store, {objectId: res.objectId}) == ''){
          message.objectId = res.objectId;
          message.createdAt = res.createdAt;
          that.store.push(message);
          that.render();
        }
      },
      error: function (res) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },
  render: function() {
    var that = this;
    d3.selectAll('.message').remove();
    var color =  d3.scale.category10(), data;
    //this.listRooms(

    if (this.filter) {
      data = this.store.sort(this.compare).filter(function (d) { return d.roomname === that.filter; });
    } else {
      data = this.store.sort(this.compare);
    }

    d3.select('#chatlog').selectAll('.message')
      .data(data, function (d) { return d.objectId; })
      .enter()
        .append('div')
          .attr('class', 'message')
        .each(function(d){
          d3.select(this)
            .append('div')
              .attr('class', 'user').text(function(d){return "@" + d.username;})
              .style('color', function(d) {return color(d.username);});

          d3.select(this)
            .append('div')
              .attr('class', 'room').text(function(d){return "ROOM: " + d.roomname;});

          d3.select(this)
            .append('div')
              .attr('class', 'msg').text(function(d){return d.text;});

          d3.select(this)
            .append('div')
              .attr('class', 'time').text(function(d){return d.createdAt;});
        });

  },
  compare: function(a,b) {
    if(b.createdAt < a.createdAt) {
      return -1;
    }
    if(b.createdAt > a.createdAt) {
      return 1;
    }
    return 0;
  },
  fetch: function () {
    var that = this;
    $.ajax({
      url : 'https://api.parse.com/1/classes/chatterbox',
      data : {order: "-createdAt"},
      type : "GET",
      cache : false,
      accept: '*/*',
      connection: 'keep-alive',
      success : function(res) {
        res.results.forEach(function (msg) {
          if(_.where(that.store, {objectId: msg.objectId})==''){
            that.store.push(msg);
          }
        });
        that.render();
        if(that.once === false) {
          that.listRooms();
          that.once = true;
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  }
};


app.Message.prototype.send = function () {
  var that = this;
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(this),
    contentType: 'application/json',
    success: function (data) {
      that.id = data.objectId;
      that.stamp = data.createdAt;
      console.log('chatterbox: Message sent', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};
