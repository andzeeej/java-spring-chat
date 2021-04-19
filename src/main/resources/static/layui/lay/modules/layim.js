/**

 @Name：layim v3.0.1 Pro
 @Author：borolis
 @Site：http://layim.layui.com
 @License：LGPL

 */

layui.define(['layer', 'laytpl', 'upload', 'flow'], function(exports){

  var v = '3.0.1 Pro';
  var $ = layui.jquery;
  var layer = layui.layer;
  var laytpl = layui.laytpl;
  var device = layui.device();
  var flow = layui.flow;

  var SHOW = 'layui-show', THIS = 'layim-this', MAX_ITEM = 20;

  //Callback
  var call = {};

  //External API
  var LAYIM = function(){
    this.v = v;
    $('body').on('click', '*[layim-event]', function(e){
      var othis = $(this), methid = othis.attr('layim-event');
	  events = $.extend(events, my_events || {});
      events[methid] ? events[methid].call(this, othis, e) : '';
    });
  };

  //Basic configuration
  LAYIM.prototype.config = function(options){
    var skin = [];
    layui.each(Array(5), function(index){
      skin.push(layui.cache.dir+'css/modules/layim/skin/'+ (index+1) +'.jpg')
    });
    options = options || {};
    options.skin = options.skin || [];
    layui.each(options.skin, function(index, item){
      skin.unshift(item);
    });
    options.skin = skin;
    options = $.extend({
      isfriend: !0
      ,isgroup: !0
      ,voice: 'default.wav'
    }, options);
    if(!window.JSON || !window.JSON.parse) return;
    init(options);
    return this;
  };

  //Listening event
  LAYIM.prototype.on = function(events, callback){
    if(typeof callback === 'function'){
      call[events] ? call[events].push(callback) : call[events] = [callback];
    }
    return this;
  };

  //Get all cached data
  LAYIM.prototype.cache = function(){
    return cache;
  };

  //Open a custom session interface
  LAYIM.prototype.chat = function(data){
    if(!window.JSON || !window.JSON.parse) return;
    return popchat(data), this;
  };

  //Set the chat interface to minimize
  LAYIM.prototype.setChatMin = function(){
    return setChatMin(), this;
  };

  //Set the current session state
  LAYIM.prototype.setChatStatus = function(str){
    var thatChat = thisChat();
    if(!thatChat) return;
    var status = thatChat.elem.find('.layim-chat-status');
    return status.html(str), this;
  };

  //Accept the message
  LAYIM.prototype.getMessage = function(data){
    return getMessage(data), this;
  };

  //Desktop message notification
  LAYIM.prototype.notice = function(data){
    return notice(data), this;
  };

  //Open the Add Friends/Groups panel
  LAYIM.prototype.add = function(data){
    return popAdd(data), this;
  };

  //Friend grouping panel
  LAYIM.prototype.setFriendGroup = function(data){
    return popAdd(data, 'setGroup'), this;
  };

  //Message box reminder
  LAYIM.prototype.msgbox = function(nums){
    return msgbox(nums), this;
  };

  //Add friends/groups
  LAYIM.prototype.addList = function(data){
    return addList(data), this;
  };

  //Delete friends/groups
  LAYIM.prototype.removeList = function(data){
    return removeList(data), this;
  };

  //Set friends online/offline status
  LAYIM.prototype.setFriendStatus = function(id, type){
    var list = $('#layim-friend'+ id);
    list[type === 'online' ? 'removeClass' : 'addClass']('layim-list-gray');
  };

  //Parsing chat content
  LAYIM.prototype.content = function(content){
    return layui.data.content(content);
  };


  //Master template
  var listTpl = function(options){
    var nodata = {
      friend: "There are no friends under this group."
      ,group: "No group"
      ,history: "No historical conversation"
    };

    options = options || {};
    options.item = options.item || ('d.' + options.type);

    return ['{{# var length = 0; layui.each('+ options.item +', function(i, data){ length++; }}'
      ,'<li layim-event="chat" data-type="'+ options.type +'" data-index="{{ '+ (options.index||'i') +' }}" id="layim-'+ options.type +'{{ data.id }}" {{ data.status === "offline" ? "class=layim-list-gray" : "" }}><img src="{{ data.avatar }}"><span>{{ data.username||data.groupname||data.name||"Anonymous" }}</span><p>{{ data.remark||data.sign||"" }}</p></li>'
    ,'{{# }); if(length === 0){ }}'
      ,'<li class="layim-null">'+ (nodata[options.type] || "No data") +'</li>'
    ,'{{# } }}'].join('');
  };

  var elemTpl = ['<div class="layui-layim-main">'
    ,'<div class="layui-layim-info">'
      ,'<div class="layui-layim-user">{{ d.mine.username }}</div>'
      ,'<div class="layui-layim-status">'
        ,'{{# if(d.mine.status === "online"){ }}'
        ,'<span class="layui-icon layim-status-online" layim-event="status" lay-type="show">&#xe617;</span>'
        ,'{{# } else if(d.mine.status === "hide") { }}'
        ,'<span class="layui-icon layim-status-hide" layim-event="status" lay-type="show">&#xe60f;</span>'
        ,'{{# } }}'
        ,'<ul class="layui-anim layim-menu-box">'
          ,'<li {{d.mine.status === "online" ? "class=layim-this" : ""}} layim-event="status" lay-type="online"><i class="layui-icon">&#xe618;</i><cite class="layui-icon layim-status-online">&#xe617;</cite>Online</li>'
          ,'<li {{d.mine.status === "hide" ? "class=layim-this" : ""}} layim-event="status" lay-type="hide"><i class="layui-icon">&#xe618;</i><cite class="layui-icon layim-status-hide">&#xe60f;</cite>Stealth</li>'
        ,'</ul>'
      ,'</div>'
      ,'<input class="layui-layim-remark" placeholder="Edit signature" value="{{ d.mine.remark||d.mine.sign||"" }}"></p>'
    ,'</div>'
    ,'<ul class="layui-unselect layui-layim-tab{{# if(!d.base.isfriend || !d.base.isgroup){ }}'
      ,' layim-tab-two'
    ,'{{# } }}">'
      ,'<li class="layui-icon'
      ,'{{# if(!d.base.isfriend){ }}'
      ,' layim-hide'
      ,'{{# } else { }}'
      ,' layim-this'
      ,'{{# } }}'
      ,'" title="Contact" layim-event="tab" lay-type="friend">&#xe612;</li>'
      ,'<li class="layui-icon'
      ,'{{# if(!d.base.isgroup){ }}'
      ,' layim-hide'
      ,'{{# } else if(!d.base.isfriend) { }}'
      ,' layim-this'
      ,'{{# } }}'
      ,'" title="Group" layim-event="tab" lay-type="group">&#xe613;</li>'
      ,'<li class="layui-icon" title="Historical conversation" layim-event="tab" lay-type="history">&#xe611;</li>'
    ,'</ul>'
    ,'<ul class="layui-unselect layim-tab-content {{# if(d.base.isfriend){ }}layui-show{{# } }} layim-list-friend">'
    ,'{{# layui.each(d.friend, function(index, item){ var spread = d.local["spread"+index]; }}'
      ,'<li>'
        ,'<h5 layim-event="spread" lay-type="{{ spread }}"><i class="layui-icon">{{# if(spread === "true"){ }}&#xe61a;{{# } else {  }}&#xe602;{{# } }}</i><span>{{ item.groupname||"未命名分组"+index }}</span><em>(<cite class="layim-count"> {{ (item.list||[]).length }}</cite>)</em></h5>'
        ,'<ul class="layui-layim-list {{# if(spread === "true"){ }}'
        ,' layui-show'
        ,'{{# } }}">'
        ,listTpl({
          type: "friend"
          ,item: "item.list"
          ,index: "index"
        })
        ,'</ul>'
      ,'</li>'
    ,'{{# }); if(d.friend.length === 0){ }}'
      ,'<li><ul class="layui-layim-list layui-show"><li class="layim-null">temporary no cotacts</li></ul>'
    ,'{{# } }}'
    ,'</ul>'
    ,'<ul class="layui-unselect layim-tab-content {{# if(!d.base.isfriend && d.base.isgroup){ }}layui-show{{# } }}">'
      ,'<li>'
        ,'<ul class="layui-layim-list layui-show layim-list-group">'
        ,listTpl({
          type: 'group'
        })
        ,'</ul>'
      ,'</li>'
    ,'</ul>'
    ,'<ul class="layui-unselect layim-tab-content  {{# if(!d.base.isfriend && !d.base.isgroup){ }}layui-show{{# } }}">'
      ,'<li>'
        ,'<ul class="layui-layim-list layui-show layim-list-history">'
        ,listTpl({
          type: 'history'
        })
        ,'</ul>'
      ,'</li>'
    ,'</ul>'
    ,'<ul class="layui-unselect layim-tab-content">'
      ,'<li>'
        ,'<ul class="layui-layim-list layui-show" id="layui-layim-search"></ul>'
      ,'</li>'
    ,'</ul>'
    ,'<ul class="layui-unselect layui-layim-tool">'
      ,'<li class="layui-icon layim-tool-search" layim-event="search" title="search for">&#xe615;</li>'
      ,'{{# if(d.base.msgbox){ }}'
      ,'<li class="layui-icon layim-tool-msgbox" layim-event="msgbox" title="Message box">&#xe645;<span class="layui-anim"></span></li>'
      ,'{{# } }}'
      ,'{{# if(d.base.find){ }}'
      ,'<li class="layui-icon layim-tool-find" layim-event="find" title="Find">&#xe608;</li>'
      ,'{{# } }}'
      ,'<li class="layui-icon layim-tool-skin" layim-event="skin" title="Change background">&#xe61b;</li>'
      ,'{{# if(!d.base.copyright){ }}'
      ,'<li class="layui-icon layim-tool-setting" layim-event="setting" title="Setting">&#xe620;</li>'
      ,'{{# } }}'
    ,'</ul>'
    ,'<div class="layui-layim-search"><input><label class="layui-icon" layim-event="closeSearch">&#x1007;</label></div>'
  ,'</div>'].join('');

  //Skin change template
  var elemSkinTpl = ['<ul class="layui-layim-skin">'
  ,'{{# layui.each(d.skin, function(index, item){ }}'
    ,'<li><img layim-event="setSkin" src="{{ item }}"></li>'
  ,'{{# }); }}'
  ,'<li layim-event="setSkin"><cite>Simple</cite></li>'
  ,'</ul>'].join('');

  //Chat master template
  var elemChatTpl = ['<div class="layim-chat layim-chat-{{d.data.type}}{{d.first ? " layui-show" : ""}}">'
    ,'<div class="layui-unselect layim-chat-title">'
      ,'<div class="layim-chat-other">'
        ,'<img src="{{ d.data.avatar }}"><span class="layim-chat-username" layim-event="{{ d.data.type==="group" ? \"groupMembers\" : \"\" }}">{{ d.data.name||"Anonymous" }} {{d.data.temporary ? "<cite>Temporary session</cite>" : ""}} {{# if(d.data.type==="group"){ }} <em class="layim-chat-members"></em><i class="layui-icon">&#xe61a;</i> {{# } }}</span>'
        ,'<p class="layim-chat-status"></p>'
      ,'</div>'
    ,'</div>'
    ,'<div class="layim-chat-main">'
      ,'<ul></ul>'
    ,'</div>'
    ,'<div class="layim-chat-footer">'
      ,'<div class="layui-unselect layim-chat-tool" data-json="{{encodeURIComponent(JSON.stringify(d.data))}}">'
        ,'<span class="layui-icon layim-tool-face" title="Select expression" layim-event="face">&#xe60c;</span>'
        ,'{{# if(d.base && d.base.uploadImage){ }}'
        ,'<span class="layui-icon layim-tool-image" title="Upload image" layim-event="image">&#xe60d;<input type="file" name="file"></span>'
        ,'{{# }; }}'
        ,'{{# if(d.base && d.base.uploadFile){ }}'
        ,'<span class="layui-icon layim-tool-image" title="Send File" layim-event="image" data-type="file">&#xe61d;<input type="file" name="file"></span>'
         ,'{{# }; }}'
         ,'{{# layui.each(d.base.tool, function(index, item){ }}'
        ,'<span class="layui-icon layim-tool-{{item.alias}}" title="{{item.title}}" layim-event="extend" lay-filter="{{ item.alias }}">{{item.icon}}</span>'
         ,'{{# }); }}'
        ,'{{# if(d.base && d.base.chatLog){ }}'
        ,'<span class="layim-tool-log" layim-event="chatLog"><i class="layui-icon">&#xe60e;</i>History</span>'
        ,'{{# }; }}'
      ,'</div>'
      ,'<div class="layim-chat-textarea"><textarea></textarea></div>'
      ,'<div class="layim-chat-bottom">'
        ,'<div class="layim-chat-send">'
          ,'{{# if(!d.base.brief){ }}'
          ,'<span class="layim-send-close" layim-event="closeThisChat">Close</span>'
          ,'{{# } }}'
          ,'<span class="layim-send-btn" layim-event="send">Send</span>'
          ,'<span class="layim-send-set" layim-event="setSend" lay-type="show"><em class="layui-edge"></em></span>'
          ,'<ul class="layui-anim layim-menu-box">'
            ,'<li {{d.local.sendHotKey !== "Ctrl+Enter" ? "class=layim-this" : ""}} layim-event="setSend" lay-type="Enter"><i class="layui-icon">&#xe618;</i>Enter to send</li>'
            ,'<li {{d.local.sendHotKey === "Ctrl+Enter" ? "class=layim-this" : ""}} layim-event="setSend"  lay-type="Ctrl+Enter"><i class="layui-icon">&#xe618;</i>Ctrl+Enter to send</li>'
          ,'</ul>'
        ,'</div>'
      ,'</div>'
    ,'</div>'
  ,'</div>'].join('');

  //Add a friend group template
  var elemAddTpl = ['<div class="layim-add-box">'
    ,'<div class="layim-add-img"><img class="layui-circle" src="{{ d.data.avatar }}"><p>{{ d.data.name||"" }}</p></div>'
    ,'<div class="layim-add-remark">'
    ,'{{# if(d.data.type === "friend" && d.type === "setGroup"){ }}'
      ,'<p>Select group</p>'
    ,'{{# } if(d.data.type === "friend"){ }}'
    ,'<select class="layui-select" id="LAY_layimGroup">'
      ,'{{# layui.each(d.data.group, function(index, item){ }}'
      ,'<option value="{{ item.id }}">{{ item.groupname }}</option>'
      ,'{{# }); }}'
    ,'</select>'
    ,'{{# } }}'
    ,'{{# if(d.data.type === "group"){ }}'
      ,'<p>Please enter verification information</p>'
    ,'{{# } if(d.type !== "setGroup"){ }}'
      ,'<textarea id="LAY_layimRemark" placeholder="Verify message" class="layui-textarea"></textarea>'
    ,'{{# } }}'
    ,'</div>'
  ,'</div>'].join('');

  //Chat content list template
  var elemChatMain = ['<li {{ d.mine ? "class=layim-chat-mine" : "" }} {{# if(d.cid){ }}data-cid="{{d.cid}}"{{# } }}>'
    ,'<div class="layim-chat-user"><img src="{{ d.avatar }}"><cite>'
    ,'{{# if(d.mine){ }}'
      ,'<i>{{ layui.data.date(d.timestamp) }}</i>{{ d.username||"Anonymous" }}'
     ,'{{# } else { }}'
      ,'{{ d.username||"Anonymous" }}<i>{{ layui.data.date(d.timestamp) }}</i>'
     ,'{{# } }}'
      ,'</cite></div>'
    ,'<div class="layim-chat-text">{{ layui.data.content(d.content||"&nbsp") }}</div>'
  ,'</li>'].join('');

  var elemChatList = '<li class="layim-chatlist-{{ d.data.type }}{{ d.data.id }} layim-this" layim-event="tabChat"><img src="{{ d.data.avatar }}"><span>{{ d.data.name||"Anonymous" }}</span>{{# if(!d.base.brief){ }}<i class="layui-icon" layim-event="closeChat">&#x1007;</i>{{# } }}</li>';

  //Completion of digits
  var digit = function(num){
    return num < 10 ? '0' + (num|0) : num;
  };

  //Conversion time
  layui.data.date = function(timestamp){
    var d = new Date(timestamp||new Date());
    return d.getFullYear() + '-' + digit(d.getMonth() + 1) + '-' + digit(d.getDate())
    + ' ' + digit(d.getHours()) + ':' + digit(d.getMinutes()) + ':' + digit(d.getSeconds());
  };

  //Convert content
  layui.data.content = function(content){
    //Supported html tags
    var html = function(end){
      return new RegExp('\\n*\\['+ (end||'') +'(pre|div|p|table|thead|th|tbody|tr|td|ul|li|ol|li|dl|dt|dd|h2|h3|h4|h5)([\\s\\S]*?)\\]\\n*', 'g');
    };
    content = (content||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;') //XSS
    .replace(/@(\S+)(\s+?|$)/g, '@<a href="javascript:;">$1</a>$2') //Escape @
    .replace(/\s{2}/g, '&nbsp') //Escaped space
    .replace(/img\[([^\s]+?)\]/g, function(img){  //Escape picture
      return '<img class="layui-layim-photos" src="' + img.replace(/(^img\[)|(\]$)/g, '') + '">';
    })
    .replace(/file\([\s\S]+?\)\[[\s\S]*?\]/g, function(str){ //Escape file
      var href = (str.match(/file\(([\s\S]+?)\)\[/)||[])[1];
      var text = (str.match(/\)\[([\s\S]*?)\]/)||[])[1];
      if(!href) return str;
      return '<a class="layui-layim-file" href="'+ href +'" download target="_blank"><i class="layui-icon">&#xe61e;</i><cite>'+ (text||href) +'</cite></a>';
    })
    .replace(/face\[([^\s\[\]]+?)\]/g, function(face){  //Escaped expression
      var alt = face.replace(/^face/g, '');
      return '<img alt="'+ alt +'" title="'+ alt +'" src="' + faces[alt] + '">';
    }).replace(/a\([\s\S]+?\)\[[\s\S]*?\]/g, function(str){ //Escaped link
      var href = (str.match(/a\(([\s\S]+?)\)\[/)||[])[1];
      var text = (str.match(/\)\[([\s\S]*?)\]/)||[])[1];
      if(!href) return str;
      return '<a href="'+ href +'" target="_blank">'+ (text||href) +'</a>';
    }).replace(html(), '\<$1 $2\>').replace(html('/'), '\</$1\>') //Transfer HTML code
    .replace(/\n/g, '<br>') //Escaped line break
    return content;
  };

  //Ajax
  var post = function(options, callback, tips){
    options = options || {};
    return $.ajax({
      url: options.url
      ,type: options.type || 'get'
      ,data: options.data
      ,dataType: options.dataType || 'json'
      ,cache: false
      ,success: function(res){
        res.code == 0
          ? callback && callback(res.data||{})
        : layer.msg(res.msg || ((tips||'Error') + ': LAYIM_NOT_GET_DATA'), {
          time: 5000
        });
      },error: function(err, msg){
        window.console && console.log && console.error('LAYIM_DATE_ERROR：' + msg);
      }
    });
  };

  //Processing initialization information
  var cache = {message: {}, chat: []}, init = function(options){
    var init = options.init || {}
     mine = init.mine || {}
    ,local = layui.data('layim')[mine.id] || {}
    ,obj = {
      base: options
      ,local: local
      ,mine: mine
      ,history: local.history || {}
    }, create = function(data){
      var mine = data.mine || {};
      var local = layui.data('layim')[mine.id] || {}, obj = {
        base: options //Basic configuration information
        ,local: local //Local data
        ,mine:  mine //My user information
        ,friend: data.friend || [] //contact information
        ,group: data.group || [] //Group information
        ,history: local.history || {} //Historical session information
      };
      cache = $.extend(cache, obj);
      popim(laytpl(elemTpl).render(obj));
      if(local.close || options.min){
        popmin();
      }
      layui.each(call.ready, function(index, item){
        item && item(obj);
      });
    };
    cache = $.extend(cache, obj);
    if(options.brief){
      return layui.each(call.ready, function(index, item){
        item && item(obj);
      });
    };
    init.url ? post(init, create, 'INIT') : create(init);
  };

  //Display main panel
  var layimMain, popim = function(content){
    return layer.open({
      type: 1
      ,area: ['260px', '520px']
      ,skin: 'layui-box layui-layim'
      ,title: '&#8203;'
      ,offset: 'rb'
      ,id: 'layui-layim'
      ,shade: false
      ,anim: 2
      ,resize: false
      ,content: content
      ,success: function(layero){
        layimMain = layero;

        setSkin(layero);

        if(cache.base.right){
          layero.css('margin-left', '-' + cache.base.right);
        }
        if(layimClose){
          layer.close(layimClose.attr('times'));
        }

        //Rearrange by latest conversation
        var arr = [], historyElem = layero.find('.layim-list-history');
        historyElem.find('li').each(function(){
          arr.push($(this).prop('outerHTML'))
        });
        if(arr.length > 0){
          arr.reverse();
          historyElem.html(arr.join(''));
        }

        banRightMenu();
        events.sign();
      }
      ,cancel: function(index){
        popmin();
        var local = layui.data('layim')[cache.mine.id] || {};
        local.close = true;
        layui.data('layim', {
          key: cache.mine.id
          ,value: local
        });
        return false;
      }
    });
  };

  var othis;
  //Shield main panel right-click menu
  var banRightMenu = function(){
    layimMain.on('contextmenu', function(event){
      event.cancelBubble = true
      event.returnValue = false;
      return false;
    });

    var hide = function(){
      layer.closeAll('tips');
    };

    //Custom history session right-click menu
    layimMain.find('.layim-list-history').on('contextmenu', 'li', function(e){
      var othis = $(this);
      var html = '<ul data-id="'+ othis[0].id +'" data-index="'+ othis.data('index') +'"><li layim-event="menuHistory" data-type="one">Remove the conversation</li><li layim-event="menuHistory" data-type="all">Clear all conversation lists</li></ul>';

      if(othis.hasClass('layim-null')) return;

      layer.tips(html, this, {
        tips: 1
        ,time: 0
        ,anim: 5
        ,fixed: true
        ,skin: 'layui-box layui-layim-contextmenu'
        ,success: function(layero){
          var stopmp = function(e){ stope(e); };
          layero.off('mousedown', stopmp).on('mousedown', stopmp);
        }
      });
      $(document).off('mousedown', hide).on('mousedown', hide);
      $(window).off('resize', hide).on('resize', hide);

    });

    //Custom friend management right-click menu
    layimMain.find('.layim-list-friend .layui-layim-list').on('contextmenu', 'li', function(e){
      othis = $(this);
      var html = '<ul id="contextmenu_' + othis[0].id + '" data-id="' + othis[0].id + '" data-index="' + othis.data('index') + '">';
      	  html += '<li layim-event="menu_chat"><i class="layui-icon" >&#xe611;</i>&nbsp;&nbsp;&nbsp;&nbsp;' + 'Send a message</li>';
          html += '<li layim-event="checkOut"><i class="layui-icon">&#xe60a;</i>&nbsp;&nbsp;&nbsp;&nbsp;' + 'Сhecking data</li>';
          html += '<li layim-event="viewChatLog"><i class="layui-icon" >&#xe60e;</i>&nbsp;&nbsp;&nbsp;&nbsp;' + 'Message history</li>';
          html += '<li layim-event="menu_nomsg"><i class="layui-icon" >&#xe617;</i>&nbsp;&nbsp;&nbsp;&nbsp;'  + 'Block message</li>';
          html += '<li layim-event="removeFriend"><i class="layui-icon" >&#x1006;</i>&nbsp;&nbsp;&nbsp;&nbsp;' + 'Delete friend</li>';
          html += '<li layim-event="changeGroup"><i class="layui-icon" >&#xe623;</i>&nbsp;&nbsp;&nbsp;&nbsp;' + 'Move to</li></ul>';

      if(othis.hasClass('layim-null')) return;

      layer.tips(html, this, {
        tips: 1
        ,time: 0
        ,anim: 5
        ,fixed: true
        ,skin: 'layui-box layui-layim-contextmenu'
        ,success: function(layero){
          var stopmp = function(e){ stope(e); };
          layero.off('mousedown', stopmp).on('mousedown', stopmp);
        }
      });
      $(document).off('mousedown', hide).on('mousedown', hide);
      $(window).off('resize', hide).on('resize', hide);
    });

	// Customize the main panel Group right button function --- layim-list-group
	layimMain.find('.layim-list-group').on('contextmenu', 'li', function (e) {
		var othis = $(this);
		var html = '<ul data-id="' + othis[0].id.substring(11) + '">' +
			'<li layim-event="leaveOutGroup"><i class="layui-icon" >&#x1006;</i>&nbsp;&nbsp;&nbsp;&nbsp;Exit the group</li></ul>';

		if (othis.hasClass('layim-null')) return;

		layer.tips(html, this, {
			tips: 1
			, time: 0
			, anim: 5
			, fixed: true
			, skin: 'layui-box layui-layim-contextmenu'
			, success: function (layero) {
				var stopmp = function (e) {
					stope(e);
				};
				layero.off('mousedown', stopmp).on('mousedown', stopmp);
			}
		});
		$(document).off('mousedown', hide).on('mousedown', hide);
		$(window).off('resize', hide).on('resize', hide);
	});

  }

  //Main panel minimized state
  var layimClose, popmin = function(content){
    if(layimClose){
      layer.close(layimClose.attr('times'));
    }
    if(layimMain){
      layimMain.hide();
    }
    cache.mine = cache.mine || {};
    return layer.open({
      type: 1
      ,title: false
      ,id: 'layui-layim-close'
      ,skin: 'layui-box layui-layim-min layui-layim-close'
      ,shade: false
      ,closeBtn: false
      ,anim: 2
      ,offset: 'rb'
      ,resize: false
      ,content: '<img src="'+ (cache.mine.avatar||(layui.cache.dir+'css/pc/layim/skin/logo.jpg')) +'"><span>'+ (content||cache.base.title||'My LayIM') +'</span>'
      ,move: '#layui-layim-close img'
      ,success: function(layero, index){
        layimClose = layero;
        if(cache.base.right){
          layero.css('margin-left', '-' + cache.base.right);
        }
        layero.on('click', function(){
          layer.close(index);
          layimMain.show();
          var local = layui.data('layim')[cache.mine.id] || {};
          delete local.close;
          layui.data('layim', {
            key: cache.mine.id
            ,value: local
          });
        });
      }
    });
  };

  //Show chat panel
  var layimChat, layimMin, chatIndex, To = {}, popchat = function(data){
    data = data || {};

    var chat = $('#layui-layim-chat'), render = {
      data: data
      ,base: cache.base
      ,local: cache.local
    };

    if(!data.id){
      return layer.msg('Illegal users');
    }

    if(chat[0]){
      var list = layimChat.find('.layim-chat-list');
      var listThat = list.find('.layim-chatlist-'+ data.type + data.id);
      var hasFull = layimChat.find('.layui-layer-max').hasClass('layui-layer-maxmin');
      var chatBox = chat.children('.layim-chat-box');

      //Restore window if it is minimized
      if(layimChat.css('display') === 'none'){
        layimChat.show();
      }

      if(layimMin){
        layer.close(layimMin.attr('times'));
      }

      //If multiple chat panels appear
      if(list.find('li').length === 1 && !listThat[0]){
        hasFull || layimChat.css('width', 800);
        list.css({
          height: layimChat.height()
        }).show();
        chatBox.css('margin-left', '200px');
      }

      //Open the non-current chat panel, then add a new panel
      if(!listThat[0]){
        list.append(laytpl(elemChatList).render(render));
        chatBox.append(laytpl(elemChatTpl).render(render));
        resizeChat();
      }

      changeChat(list.find('.layim-chatlist-'+ data.type + data.id));
      listThat[0] || viewChatlog();
      setHistory(data);
      hotkeySend();

      return chatIndex;
    }

    render.first = !0;

    var index = chatIndex = layer.open({
      type: 1
      ,area: '600px'
      ,skin: 'layui-box layui-layim-chat'
      ,id: 'layui-layim-chat'
      ,title: '&#8203;'
      ,shade: false
      ,maxmin: true
      ,offset: data.offset || 'auto'
      ,anim: data.anim || 0
      ,closeBtn: cache.base.brief ? false : 1
      ,content: laytpl('<ul class="layui-unselect layim-chat-list">'+ elemChatList +'</ul><div class="layim-chat-box">' + elemChatTpl + '</div>').render(render)
      ,success: function(layero){
        layimChat = layero;

        layero.css({
          'min-width': '500px'
          ,'min-height': '420px'
        });

        typeof data.success === 'function' && data.success(layero);

        hotkeySend();
        setSkin(layero);
        setHistory(data);

        viewChatlog();
        showOffMessage();

        //Chat window switching monitor
        layui.each(call.chatChange, function(index, item){
          item && item(thisChat());
        });

        //View larger image
        layero.on('dblclick', '.layui-layim-photos', function(){
          var src = this.src;
          layer.close(popchat.photosIndex);
          layer.photos({
            photos: {
              data: [{
                "alt": "Large picture mode",
                "src": src
              }]
            }
            ,shade: 0.01
            ,closeBtn: 2
            ,anim: 0
            ,resize: false
            ,success: function(layero, index){
               popchat.photosIndex = index;
            }
          });
        });
      }
      ,full: function(layero){
        layer.style(index, {
          width: '100%'
          ,height: '100%'
        }, true);
        resizeChat();
      }
      ,resizing: resizeChat
      ,restore: resizeChat
      ,min: function(){
        setChatMin();
        return false;
      }
      ,end: function(){
        layer.closeAll('tips');
        layimChat = null;
      }
    });
    return index;
  };

  //Reset chat window size
  var resizeChat = function(){
    var list = layimChat.find('.layim-chat-list')
    ,chatMain = layimChat.find('.layim-chat-main')
    ,chatHeight = layimChat.height();
    list.css({
      height: chatHeight
    });
    chatMain.css({
      height: chatHeight - 20 - 80 - 158
    })
  };

  //Set chat window minimize & new message reminder
  var setChatMin = function(newMsg){
    var thatChat = newMsg || thisChat().data, base = layui.layim.cache().base;
    if(layimChat && !newMsg){
      layimChat.hide();
    }
    layer.close(setChatMin.index);
    setChatMin.index = layer.open({
      type: 1
      ,title: false
      ,skin: 'layui-box layui-layim-min'
      ,shade: false
      ,closeBtn: false
      ,anim: thatChat.anim || 2
      ,offset: 'b'
      ,move: '#layui-layim-min'
      ,resize: false
      ,area: ['182px', '50px']
      ,content: '<img id="layui-layim-min" src="'+ thatChat.avatar +'"><span>'+ thatChat.name +'</span>'
      ,success: function(layero, index){
        if(!newMsg) layimMin = layero;

        if(base.minRight){
          layer.style(index, {
            left: $(window).width() - layero.outerWidth() - parseFloat(base.minRight)
          });
        }

        layero.find('.layui-layer-content span').on('click', function(){
          layer.close(index);
          newMsg ? layui.each(cache.chat, function(i, item){
            popchat(item);
          }) : layimChat.show();
          if(newMsg){
            cache.chat = [];
            chatListMore();
          }
        });
        layero.find('.layui-layer-content img').on('click', function(e){
          stope(e);
        });
      }
    });
  };

  //Open Add Friends, Group Panel, Friends Grouping Panel
  var popAdd = function(data, type){
    data = data || {};
    layer.close(popAdd.index);
    return popAdd.index = layer.open({
      type: 1
      ,area: '430px'
      ,title: {
        friend: 'Add friend'
        ,group: 'Join group'
      }[data.type] || ''
      ,shade: false
      ,resize: false
      ,btn: type ? ['confirm', 'cancel'] : ['Send application', 'shut down']
      ,content: laytpl(elemAddTpl).render({
        data: {
          name: data.username || data.groupname
          ,avatar: data.avatar
          ,group: data.group || parent.layui.layim.cache().friend || []
          ,type: data.type
        }
        ,type: type
      })
      ,yes: function(index, layero){
        var groupElem = layero.find('#LAY_layimGroup')
        ,remarkElem = layero.find('#LAY_layimRemark')
        if(type){
          data.submit && data.submit(groupElem.val(), index);
        } else {
          data.submit && data.submit(groupElem.val(), remarkElem.val(), index);
        }
        layer.close(popAdd.index);
      }
    });
  };

  //Switch chat
  var changeChat = function(elem, del){
    elem = elem || $('.layim-chat-list .' + THIS);
    var index = elem.index() === -1 ? 0 : elem.index();
    var str = '.layim-chat', cont = layimChat.find(str).eq(index);
    var hasFull = layimChat.find('.layui-layer-max').hasClass('layui-layer-maxmin');

    if(del){

      //If the current chat is off, switch the chat focus
      if(elem.hasClass(THIS)){
        changeChat(index === 0 ? elem.next() : elem.prev());
      }

      elem.remove();
      cont.remove();

      var length = layimChat.find(str).length;

      //There is only one list left, hiding the left block
      if(length === 1){
        layimChat.find('.layim-chat-list').hide();
        if(!hasFull){
          layimChat.css('width', '600px');
        }
        layimChat.find('.layim-chat-box').css('margin-left', 0);
      }

      //If the chat list does not exist, close the chat interface.
      if(length === 0){
        layer.close(chatIndex);
      }

      return false;
    }

    elem.addClass(THIS).siblings().removeClass(THIS);
    cont.addClass(SHOW).siblings(str).removeClass(SHOW);
    cont.find('textarea').focus();

    //Chat window switching monitor
    layui.each(call.chatChange, function(index, item){
      item && item(thisChat());
    });
    showOffMessage();
  };

  //Show messages in the queue
  var showOffMessage = function(){
    var thatChat = thisChat();
    var message = cache.message[thatChat.data.type + thatChat.data.id];
    if(message){
      //Delete the message in the queue after the presentation
      delete cache.message[thatChat.data.type + thatChat.data.id];
    }
  };

  //Get the current chat panel
  var thisChat = function(){
    if(!layimChat) return;
    var index = $('.layim-chat-list .' + THIS).index();
    var cont = layimChat.find('.layim-chat').eq(index);
    var to = JSON.parse(decodeURIComponent(cont.find('.layim-chat-tool').data('json')));
    return {
      elem: cont
      ,data: to
      ,textarea: cont.find('textarea')
    };
  };

  //Record initial background
  var setSkin = function(layero){
    var local = layui.data('layim')[cache.mine.id] || {}
    ,skin = local.skin;
    layero.css({
      'background-image': skin ? 'url('+ skin +')' : function(){
        return cache.base.initSkin
          ? 'url('+ (layui.cache.dir+'css/modules/layim/skin/'+ cache.base.initSkin) +')'
        : 'none';
      }()
    });
  };

  //Record historical conversations
  var setHistory = function(data){
    var local = layui.data('layim')[cache.mine.id] || {};
    var obj = {}, history = local.history || {};
    var is = history[data.type + data.id];

    if(!layimMain) return;

    var historyElem = layimMain.find('.layim-list-history');

    data.historyTime = new Date().getTime();
    history[data.type + data.id] = data;

    local.history = history;

    layui.data('layim', {
      key: cache.mine.id
      ,value: local
    });

    if(is) return;

    obj[data.type + data.id] = data;
    var historyList = laytpl(listTpl({
      type: 'history'
      ,item: 'd.data'
    })).render({data: obj});
    historyElem.prepend(historyList);
    historyElem.find('.layim-null').remove();
  };

  //Send a message
  var sendMessage = function(){
    var data = {
      username: cache.mine ? cache.mine.username : 'Visitor'
      ,avatar: cache.mine ? cache.mine.avatar : (layui.cache.dir+'css/pc/layim/skin/logo.jpg')
      ,id: cache.mine ? cache.mine.id : null
      ,mine: true
    };
    var thatChat = thisChat(), ul = thatChat.elem.find('.layim-chat-main ul');
    var maxLength = cache.base.maxLength || 3000;
    data.content = thatChat.textarea.val();
    if(data.content.replace(/\s/g, '') !== ''){

      if(data.content.length > maxLength){
        return layer.msg('The maximum content cannot exceed '+ maxLength +' Characters')
      }

      ul.append(laytpl(elemChatMain).render(data));

      var param = {
        mine: data
        ,to: thatChat.data
      }, message = {
        username: param.mine.username
        ,avatar: param.mine.avatar
        ,id: param.to.id
        ,type: param.to.type
        ,content: param.mine.content
        ,timestamp: new Date().getTime()
        ,mine: true
      };
      pushChatlog(message);

      layui.each(call.sendMessage, function(index, item){
        item && item(param);
      });
    }
    chatListMore();
    thatChat.textarea.val('').focus();
  };

  //Desktop message reminder
  var notice = function(data){
    data = data || {};
    if (window.Notification){
      if(Notification.permission === 'granted'){
        var notification = new Notification(data.title||'', {
          body: data.content||''
          ,icon: data.avatar||'http://tp2.sinaimg.cn/5488749285/50/5719808192/1'
        });
      }else {
        Notification.requestPermission();
      };
    }
  };

  //Message alert
  var voice = function() {
    if(device.ie && device.ie < 9) return;
    var audio = document.createElement("audio");
    audio.src = layui.cache.dir+'css/modules/layim/voice/'+ cache.base.voice;
    audio.play();
  };

  //Accept the message
  var messageNew = {}, getMessage = function(data){
    data = data || {};

    var elem = $('.layim-chatlist-'+ data.type + data.id);
    var group = {}, index = elem.index();

    data.timestamp = data.timestamp || new Date().getTime();
    if(data.fromid == cache.mine.id){
      data.mine = true;
    }
    data.system || pushChatlog(data);
    messageNew = JSON.parse(JSON.stringify(data));

    if(cache.base.voice){
      voice();
    }

    if((!layimChat && data.content) || index === -1){
      if(cache.message[data.type + data.id]){
        cache.message[data.type + data.id].push(data)
      } else {
        cache.message[data.type + data.id] = [data];

        //Record chat panel queue
        if(data.type === 'friend'){
          var friend;
          layui.each(cache.friend, function(index1, item1){
            layui.each(item1.list, function(index, item){
              if(item.id == data.id){
                item.type = 'friend';
                item.name = item.username;
                cache.chat.push(item);
                return friend = true;
              }
            });
            if(friend) return true;
          });
          if(!friend){
            data.name = data.username;
            data.temporary = true; //Temporary session
            cache.chat.push(data);
          }
        } else if(data.type === 'group'){
          var isgroup;
          layui.each(cache.group, function(index, item){
            if(item.id == data.id){
              item.type = 'group';
              item.name = item.groupname;
              cache.chat.push(item);
              return isgroup = true;
            }
          });
          if(!isgroup){
            data.name = data.groupname;
            cache.chat.push(data);
          }
        } else {
          data.name = data.name || data.username || data.groupname;
          cache.chat.push(data);
        }
      }
      if(data.type === 'group'){
        layui.each(cache.group, function(index, item){
          if(item.id == data.id){
            group.avatar = item.avatar;
            return true;
          }
        });
      }
      if(!data.system){
        if(cache.base.notice){
          notice({
            title: 'Message From: ' + data.username
            ,content: data.content
            ,avatar: group.avatar || data.avatar
          });
        }
        return setChatMin({
          name: 'Receive new news'
          ,avatar: group.avatar || data.avatar
          ,anim: 6
        });
      }
    }

    if(!layimChat) return;

    //The received message is not in the current Tab
    var thatChat = thisChat();
    if(thatChat.data.type + thatChat.data.id !== data.type + data.id){
      elem.addClass('layui-anim layer-anim-06');
      setTimeout(function(){
        elem.removeClass('layui-anim layer-anim-06')
      }, 300);
    }

    var cont = layimChat.find('.layim-chat').eq(index);
    var ul = cont.find('.layim-chat-main ul');

    //system information
    if(data.system){
      if(index !== -1){
        ul.append('<li class="layim-chat-system"><span>'+ data.content +'</span></li>');
      }
    } else if(data.content.replace(/\s/g, '') !== ''){
      ul.append(laytpl(elemChatMain).render(data));
    }

    chatListMore();
  };

  //Message box reminder
  var ANIM_MSG = 'layui-anim-loop layer-anim-05', msgbox = function(num){
    var msgboxElem = layimMain.find('.layim-tool-msgbox');
    msgboxElem.find('span').addClass(ANIM_MSG).html(num);
  };

  //Store recent MAX_ITEM chats to your local
  var pushChatlog = function(message){
    var local = layui.data('layim')[cache.mine.id] || {};
    local.chatlog = local.chatlog || {};
    var thisChatlog = local.chatlog[message.type + message.id];
    if(thisChatlog){
      //Avoid repeated chat history when browsing multiple windows in the browser
      var nosame;
      layui.each(thisChatlog, function(index, item){
        if((item.timestamp === message.timestamp
          && item.type === message.type
          && item.id === message.id
        && item.content === message.content)){
          nosame = true;
        }
      });
      if(!(nosame || message.fromid == cache.mine.id)){
        thisChatlog.push(message);
      }
      if(thisChatlog.length > MAX_ITEM){
        thisChatlog.shift();
      }
    } else {
      local.chatlog[message.type + message.id] = [message];
    }
    layui.data('layim', {
      key: cache.mine.id
      ,value: local
    });
  };

  //Render local latest chat history to the corresponding panel
  var viewChatlog = function(){
    var local = layui.data('layim')[cache.mine.id] || {}
    ,thatChat = thisChat(), chatlog = local.chatlog || {}
    ,ul = thatChat.elem.find('.layim-chat-main ul');
    layui.each(chatlog[thatChat.data.type + thatChat.data.id], function(index, item){
      ul.append(laytpl(elemChatMain).render(item));
    });
    chatListMore();
  };

  //Add a friend or group
  var addList = function(data){
    var obj = {}, has, listElem = layimMain.find('.layim-list-'+ data.type);

    if(cache[data.type]){
      if(data.type === 'friend'){
        layui.each(cache.friend, function(index, item){
          if(data.groupid == item.id){
            //Check if the friend is already in the list
            layui.each(cache.friend[index].list, function(idx, itm){
              if(itm.id == data.id){
                return has = true
              }
            });
            if(has) return layer.msg('Friend ['+ (data.username||'') +'] Already in the list',{anim: 6});
            cache.friend[index].list = cache.friend[index].list || [];
            obj[cache.friend[index].list.length] = data;
            data.groupIndex = index;
            cache.friend[index].list.push(data); //Add friends in the cache friend
            return true;
          }
        });
      } else if(data.type === 'group'){
        //Check if the group is already in the list
        layui.each(cache.group, function(idx, itm){
          if(itm.id == data.id){
            return has = true
          }
        });
        if(has) return layer.msg('You are already ['+ (data.groupname||'') +'] Group member',{anim: 6});
        obj[cache.group.length] = data;
        cache.group.push(data);
      }
    }

    if(has) return;

    var list = laytpl(listTpl({
      type: data.type
      ,item: 'd.data'
      ,index: data.type === 'friend' ? 'data.groupIndex' : null
    })).render({data: obj});

    if(data.type === 'friend'){
      var li = listElem.find('>li').eq(data.groupIndex);
      li.find('.layui-layim-list').append(list);
      li.find('.layim-count').html(cache.friend[data.groupIndex].list.length); //刷新好友数量
      //If there is no friend at first
      if(li.find('.layim-null')[0]){
        li.find('.layim-null').remove();
      }
    } else if(data.type === 'group'){
      listElem.append(list);
      //If there is no group initially
      if(listElem.find('.layim-null')[0]){
        listElem.find('.layim-null').remove();
      }
    }
  };

  //Move out of friends or groups
  var removeList = function(data){
    var listElem = layimMain.find('.layim-list-'+ data.type);
    var obj = {};
    if(cache[data.type]){
      if(data.type === 'friend'){
        layui.each(cache.friend, function(index1, item1){
          layui.each(item1.list, function(index, item){
            if(data.id == item.id){
              var li = listElem.find('>li').eq(index1);
              var list = li.find('.layui-layim-list>li');
              li.find('.layui-layim-list>li').eq(index).remove();
              cache.friend[index1].list.splice(index, 1); //Delete friends from the cache friend
              li.find('.layim-count').html(cache.friend[index1].list.length); //Refresh the number of friends
              //If a friend is gone
              if(cache.friend[index1].list.length === 0){
                li.find('.layui-layim-list').html('<li class="layim-null">There are no friends under this group.</li>');
              }
              return true;
            }
          });
        });
      } else if(data.type === 'group'){
        layui.each(cache.group, function(index, item){
          if(data.id == item.id){
            listElem.find('>li').eq(index).remove();
            cache.group.splice(index, 1); //Delete data from the cache group
            //If a group is gone
            if(cache.group.length === 0){
              listElem.html('<li class="layim-null">No group</li>');
            }
            return true;
          }
        });
      }
    }
  };

  //View more records
  var chatListMore = function(){
    var thatChat = thisChat(), chatMain = thatChat.elem.find('.layim-chat-main');
    var ul = chatMain.find('ul');
    var length = ul.find('li').length;

    if(length >= MAX_ITEM){
      var first = ul.find('li').eq(0);
      if(!ul.prev().hasClass('layim-chat-system')){
        ul.before('<div class="layim-chat-system"><span layim-event="chatLog">查看更多记录</span></div>');
      }
      if(length > MAX_ITEM){
        first.remove();
      }
    }
    chatMain.scrollTop(chatMain[0].scrollHeight + 1000);
    chatMain.find('ul li:last').find('img').load(function(){
      chatMain.scrollTop(chatMain[0].scrollHeight);
    });
  };

  //Shortcut key sending
  var hotkeySend = function(){
    var thatChat = thisChat(), textarea = thatChat.textarea;
    textarea.focus();
    textarea.off('keydown').on('keydown', function(e){
      var local = layui.data('layim')[cache.mine.id] || {};
      var keyCode = e.keyCode;
      if(local.sendHotKey === 'Ctrl+Enter'){
        if(e.ctrlKey && keyCode === 13){
          sendMessage();
        }
        return;
      }
      if(keyCode === 13){
        if(e.ctrlKey){
          return textarea.val(textarea.val()+'\n');
        }
        if(e.shiftKey) return;
        e.preventDefault();
        sendMessage();
      }
    });
  };

  //Expression library
  var faces = function(){
    var alt = ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]", "[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]", "[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]", "[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]", "[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]", "[蜡烛]", "[蛋糕]"], arr = {};
    layui.each(alt, function(index, item){
      arr[item] = layui.cache.dir + 'images/face/'+ index + '.gif';
    });
    return arr;
  }();


  var stope = layui.stope; //Component event bubbling

  //Insert content at focus
  var focusInsert = function(obj, str){
    var result, val = obj.value;
    obj.focus();
    if(document.selection){ //ie
      result = document.selection.createRange();
      document.selection.empty();
      result.text = str;
    } else {
      result = [val.substring(0, obj.selectionStart), str, val.substr(obj.selectionEnd)];
      obj.focus();
      obj.value = result.join('');
    }
  };

  //event
  var anim = 'layui-anim-upbit', events = {
	//online status
    status: function(othis, e){
      var hide = function(){
        othis.next().hide().removeClass(anim);
      };
      var type = othis.attr('lay-type');
      if(type === 'show'){
        stope(e);
        othis.next().show().addClass(anim);
        $(document).off('click', hide).on('click', hide);
      } else {
        var prev = othis.parent().prev();
        othis.addClass(THIS).siblings().removeClass(THIS);
        prev.html(othis.find('cite').html());
        prev.removeClass('layim-status-'+(type === 'online' ? 'hide' : 'online'))
        .addClass('layim-status-'+type);
        layui.each(call.online, function(index, item){
          item && item(type);
        });
      }
    }

    //Edit signature
    ,sign: function(){
      var input = layimMain.find('.layui-layim-remark');
      input.on('change', function(){
        var value = this.value;
        layui.each(call.sign, function(index, item){
          item && item(value);
        });
      });
      input.on('keyup', function(e){
        var keyCode = e.keyCode;
        if(keyCode === 13){
          this.blur();
        }
      });
    }

    //Large group switching
    ,tab: function(othis){
      var index, main = '.layim-tab-content';
      var tabs = layimMain.find('.layui-layim-tab>li');
      typeof othis === 'number' ? (
        index = othis
        ,othis = tabs.eq(index)
      ) : (
        index = othis.index()
      );
      index > 2 ? tabs.removeClass(THIS) : (
        events.tab.index = index
        ,othis.addClass(THIS).siblings().removeClass(THIS)
      )
      layimMain.find(main).eq(index).addClass(SHOW).siblings(main).removeClass(SHOW);
    }

    //Expand contact grouping
    ,spread: function(othis){
      var type = othis.attr('lay-type');
      var spread = type === 'true' ? 'false' : 'true';
      var local = layui.data('layim')[cache.mine.id] || {};
      othis.next()[type === 'true' ? 'removeClass' : 'addClass'](SHOW);
      local['spread' + othis.parent().index()] = spread;
      layui.data('layim', {
        key: cache.mine.id
        ,value: local
      });
      othis.attr('lay-type', spread);
      othis.find('.layui-icon').html(spread === 'true' ? '&#xe61a;' : '&#xe602;');
    }

    //search for
    ,search: function(othis){
      var search = layimMain.find('.layui-layim-search');
      var main = layimMain.find('#layui-layim-search');
      var input = search.find('input'), find = function(e){
        var val = input.val().replace(/\s/);
        if(val === ''){
          events.tab(events.tab.index|0);
        } else {
          var data = [], friend = cache.friend || [];
          var group = cache.group || [], html = '';
          for(var i = 0; i < friend.length; i++){
            for(var k = 0; k < (friend[i].list||[]).length; k++){
              if(friend[i].list[k].username.indexOf(val) !== -1){
                friend[i].list[k].type = 'friend';
                friend[i].list[k].index = i;
                friend[i].list[k].list = k;
                data.push(friend[i].list[k]);
              }
            }
          }
          for(var j = 0; j < group.length; j++){
            if(group[j].groupname.indexOf(val) !== -1){
              group[j].type = 'group';
              group[j].index = j;
              group[j].list = j;
              data.push(group[j]);
            }
          }
          if(data.length > 0){
            for(var l = 0; l < data.length; l++){
              html += '<li layim-event="chat" data-type="'+ data[l].type +'" data-index="'+ data[l].index +'" data-list="'+ data[l].list +'"><img src="'+ data[l].avatar +'"><span>'+ (data[l].username || data[l].groupname || 'Anonymous') +'</span><p>'+ (data[l].remark||data[l].sign||'') +'</p></li>';
            }
          } else {
            html = '<li class="layim-null">No search results</li>';
          }
          main.html(html);
          events.tab(3);
        }
      };
      if(!cache.base.isfriend && cache.base.isgroup){
        events.tab.index = 1;
      } else if(!cache.base.isfriend && !cache.base.isgroup){
        events.tab.index = 2;
      }
      search.show();
      input.focus();
      input.off('keyup', find).on('keyup', find);
    }

    //Close search
    ,closeSearch: function(othis){
      othis.parent().hide();
      events.tab(events.tab.index|0);
    }

    //Message box
    ,msgbox: function(){
      var msgboxElem = layimMain.find('.layim-tool-msgbox');
      layer.close(events.msgbox.index);
      msgboxElem.find('span').removeClass(ANIM_MSG).html('');
      return events.msgbox.index = layer.open({
        type: 2
        ,title: 'Message box'
        ,shade: false
        ,maxmin: true
        ,area: ['450px', '500px']
        ,skin: 'layui-box layui-layer-border'
        ,resize: false
        ,content: cache.base.msgbox
      });
    }

    //Pop up lookup page
    ,find: function(){
      layer.close(events.find.index);
	  layer.open({
		  type: 2,
		  title: "Find",
		  skin: 'layui-layer-rim',
		  area: ['610px', '500px'],
		  content: '/static/html/find.html'
	  });
    }

    //Pop-up replacement background
    ,skin: function(){
      layer.open({
        type: 1
        ,title: 'Change background'
        ,shade: false
        ,area: '300px'
        ,skin: 'layui-box layui-layer-border'
        ,id: 'layui-layim-skin'
        ,zIndex: 66666666
        ,resize: false
        ,content: laytpl(elemSkinTpl).render({
          skin: cache.base.skin
        })
      });
    }

    //Setting
    ,setting: function(){
    	layer.open({
  		  type: 2,
  		  title: "Setting",
  		  skin: 'layui-layer-rim',
  		  area: ['610px', '500px'],
  		  content: '/static/html/setting.html'
  	  });
    }

    //Generate skinning
    ,setSkin: function(othis){
      var src = othis.attr('src');
      var local = layui.data('layim')[cache.mine.id] || {};
      local.skin = src;
      if(!src) delete local.skin;
      layui.data('layim', {
        key: cache.mine.id
        ,value: local
      });
      try{
        layimMain.css({
          'background-image': src ? 'url('+ src +')' : 'none'
        });
        layimChat.css({
          'background-image': src ? 'url('+ src +')' : 'none'
        });
      } catch(e) {}
    }

    //Pop up chat panel
    ,chat: function(othis){
      var local = layui.data('layim')[cache.mine.id] || {};
      var type = othis.data('type'), index = othis.data('index');
      var list = othis.attr('data-list') || othis.index(), data = {};
      if(type === 'friend'){
        data = cache[type][index].list[list];
      } else if(type === 'group'){
        data = cache[type][list];
      } else if(type === 'history'){
        data = (local.history || {})[index] || {};
      }
      data.name = data.name || data.username || data.groupname;
      if(type !== 'history'){
        data.type = type;
      }
      popchat(data);
    }

    //Switch chat
    ,tabChat: function(othis){
      changeChat(othis);
    }

    //Close chat list
    ,closeChat: function(othis){
      changeChat(othis.parent(), 1);
    }, closeThisChat: function(){
      changeChat(null, 1);
    }

    //Expand group members
    ,groupMembers: function(othis, e){
      var icon = othis.find('.layui-icon'), hide = function(){
        icon.html('&#xe61a;');
        othis.data('down', null);
        layer.close(events.groupMembers.index);
      }, stopmp = function(e){stope(e)};

      if(othis.data('down')){
        hide();
      } else {
        icon.html('&#xe619;');
        othis.data('down', true);
        events.groupMembers.index = layer.tips('<ul class="layim-members-list"></ul>', othis, {
          tips: 3
          ,time: 0
          ,anim: 5
          ,fixed: true
          ,skin: 'layui-box layui-layim-members'
          ,success: function(layero){
            var members = cache.base.members || {}, thatChat = thisChat()
            ,ul = layero.find('.layim-members-list'), li = '', membersCache = {}
            ,hasFull = layimChat.find('.layui-layer-max').hasClass('layui-layer-maxmin')
            ,listNone = layimChat.find('.layim-chat-list').css('display') === 'none';
            if(hasFull){
              ul.css({
                width: $(window).width() - 22 - (listNone || 200)
              });
            }
            members.data = $.extend(members.data, {
              id: thatChat.data.id
            });
            post(members, function(res){
              layui.each(res.list, function(index, item){
                li += '<li data-uid="'+ item.id +'"><a href="javascript:;"><img src="'+ item.avatar +'"><cite>'+ item.username +'</cite></a></li>';
                membersCache[item.id] = item;
              });
              ul.html(li);

              //Get group members
              othis.find('.layim-chat-members').html(res.members||(res.list||[]).length + ' members');

              //Private chat
              ul.find('li').on('click', function(){
                var uid = $(this).data('uid'), info = membersCache[uid]
                popchat({
                  name: info.username
                  ,type: 'friend'
                  ,avatar: info.avatar
                  ,id: info.id
                });
                hide();
              });

              layui.each(call.members, function(index, item){
                item && item(res);
              });
            });
            layero.on('mousedown', function(e){
              stope(e);
            });
          }
        });
        $(document).off('mousedown', hide).on('mousedown', hide);
        $(window).off('resize', hide).on('resize', hide);
        othis.off('mousedown', stopmp).on('mousedown', stopmp);
      }
    }

    //Send chat content
    ,send: function(){
      sendMessage();
    }

    //Set up send chat shortcuts
    ,setSend: function(othis, e){
      var box = events.setSend.box = othis.siblings('.layim-menu-box')
      ,type = othis.attr('lay-type');

      if(type === 'show'){
        stope(e);
        box.show().addClass(anim);
        $(document).off('click', events.setSendHide).on('click', events.setSendHide);
      } else {
        othis.addClass(THIS).siblings().removeClass(THIS);
        var local = layui.data('layim')[cache.mine.id] || {};
        local.sendHotKey = type;
        layui.data('layim', {
          key: cache.mine.id
          ,value: local
        });
        events.setSendHide(e, othis.parent());
      }
    }, setSendHide: function(e, box){
      (box || events.setSend.box).hide().removeClass(anim);
    }

    //expression
    ,face: function(othis, e){
      var content = '', thatChat = thisChat();

      for(var key in faces){
        content += '<li title="'+ key +'"><img src="'+ faces[key] +'"></li>';
      }
      content = '<ul class="layui-clear layim-face-list">'+ content +'</ul>';

     events.face.index = layer.tips(content, othis, {
        tips: 1
        ,time: 0
        ,fixed: true
        ,skin: 'layui-box layui-layim-face'
        ,success: function(layero){
          layero.find('.layim-face-list>li').on('mousedown', function(e){
            stope(e);
          }).on('click', function(){
            focusInsert(thatChat.textarea[0], 'face' +  this.title + ' ');
            layer.close(events.face.index);
          });
        }
      });

      $(document).off('mousedown', events.faceHide).on('mousedown', events.faceHide);
      $(window).off('resize', events.faceHide).on('resize', events.faceHide);
      stope(e);

    } ,faceHide: function(){
      layer.close(events.face.index);
    }

    //Picture or general file
    ,image: function(othis){
      var type = othis.data('type') || 'images', api = {
        images: 'uploadImage'
        ,file: 'uploadFile'
      }
      ,thatChat = thisChat(), upload = cache.base[api[type]] || {};

      //Upload loading
      var index;
      layui.upload({
        url: upload.url || ''
        ,method: upload.type
        ,elem: othis.find('input')[0]
        ,unwrap: true
        ,type: type
        ,before: function(res) {
          if(type == "file"){
        	index = layer.load(0, {
  	    	    shade: [0.6,'#fff']
  	    	});
          }
        }
        ,success: function(res){
          if(res.code == 0){
            res.data = res.data || {};
            if(type === 'images'){
              focusInsert(thatChat.textarea[0], 'img['+ (res.data.src||'') +']');
            } else if(type === 'file'){
              layer.close(index);
              layer.msg("Transfer completed!");
              focusInsert(thatChat.textarea[0], 'file('+ (res.data.src||'') +')['+ (res.data.name||'download file') +']');
            }
            sendMessage();
          } else {
            layer.msg(res.msg||'Upload failed');
          }
        }
      });
    }

    //Extension toolbar
    ,extend: function(othis){
      var filter = othis.attr('lay-filter')
      ,thatChat = thisChat();

      layui.each(call['tool('+ filter +')'], function(index, item){
        item && item.call(othis, function(content){
          focusInsert(thatChat.textarea[0], content);
        }, sendMessage, thatChat);
      });
    }

    //chat record
    ,chatLog: function(othis){
      var thatChat = thisChat();
      if(!cache.base.chatLog){
        return layer.msg('No more chat history is turned on');
      }
      layer.close(events.chatLog.index);
      return events.chatLog.index = layer.open({
        type: 2
        ,maxmin: true
        ,title: thatChat.data.name +' Chat history'
        ,area: ['45%', '100%']
        ,shade: false
        ,offset: 'rb'
        ,skin: 'layui-box'
        ,anim: 2
        ,id: 'layui-layim-chatlog'
        ,content: cache.base.chatLog + '?id=' + thatChat.data.id + '&Type=' + thatChat.data.type
      });
    }

    //Historical session right-click menu operation
    ,menuHistory: function(othis, e){
      var local = layui.data('layim')[cache.mine.id] || {};
      var parent = othis.parent(), type = othis.data('type');
      var hisElem = layimMain.find('.layim-list-history');
      var none = '<li class="layim-null">No historical conversation</li>'

      if(type === 'one'){
        var history = local.history;
        delete history[parent.data('index')];
        local.history = history;
        layui.data('layim', {
          key: cache.mine.id
          ,value: local
        });
        $('#'+parent.data('id')).remove();
        if(hisElem.find('li').length === 0){
          hisElem.html(none);
        }
      } else if(type === 'all') {
        delete local.history;
        layui.data('layim', {
          key: cache.mine.id
          ,value: local
        });
        hisElem.html(none);
      }

      layer.closeAll('tips');
    }
    //Send a message
	,menu_chat: function(){
		console.log("Open the send message window!");
		events.chat(othis);
		layer.closeAll("tips");
	}
	//delete friend
	,menu_delete: function(){
		console.log(othis);
		layer.closeAll("tips");
	}
  };

  //Expose interface
  exports('layim', new LAYIM());

}).addcss(
  'modules/layim/layim.css?v=3.01Pro'
  ,'skinlayimcss'
);