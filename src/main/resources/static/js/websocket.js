// document.write("<script language='javascript' src='/static/js/reconnecting/reconnecting-websocket.js'></script>");
var socket = null;
layui.use(['layim', 'jquery', 'laytpl'], function (layim) {
    var $ = layui.jquery, laytpl = layui.laytpl;
    //Add the layim object to the window
    window.layim = layui.layim;
    //Shield right-click menu
    $(document).bind("contextmenu", function (e) {
        return false;
    });
    //Get user information from the cache
    function getFriend(friends, id) {
        var ele;
        friends.forEach(function (e) {
            e.list.forEach(function (element) {
                if (id == element.id) {
                    ele = element;
                }
            });
        });
        return ele;
    }

    var auth_token = "";
    //Declare the websocket property
    var index;
    var im = {
        init: function () {

            if (socket != null) {
                return
            }

            $.ajax({
                url: "/user/getToken",
                type: "GET",
                async: false,
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.code < 0) {
                        window.location.href = "/static/login.html";
                    } else {
                        auth_token = data.data;
                    }
                },
                error: function (data) {
                    window.location.href = "/static/login.html";
                }
            });

            socket = io.connect('http://10.33.170.254:9006', {
                query: 'auth_token=' + auth_token,
                timeout: 15000,
                autoConnect: true,
                reconnection: true,
                forceNew: false,        //Whether to create a new connection
                reconnectionDelay: 3000,//Try to connect interval
                reconnectionAttempts: 60,//The number of attempts to connect
            });


            socket.on('connect', function () {
                console.log("connection succeeded");
                layer.close(index);
            });


            // example code
            let gps_data;

            protobuf.load("/static/protobuf/gps_data.proto", function (err, root) {
                if (err) throw err;
                gps_data = root.lookupType("gps_data");
                let message = gps_data.create({dataTime: "2018-07-03", terminalId: "222 Hello there"});
                console.log(`message = ${JSON.stringify(message)}`);

                let buffer = gps_data.encode(message).finish();
                console.log(`buffer = ${Array.prototype.toString.call(buffer)}`);

                //Reference article： https://www.cnblogs.com/gradolabs/p/4762134.html
                var bufArr = new ArrayBuffer(buffer.length);
                var bufView = new Uint8Array(bufArr);
                bufView.set(buffer)

                console.log(bufArr)

                socket.emit("protobufTest", bufArr, function (data) {
                    console.log("Byte data returned from the background：==============》")

                    var d = new Uint8Array(data.byteLength);
                    var dataView = new DataView(data);
                    for (var i = 0; i < data.byteLength; i++) {
                        d[i] = dataView.getInt8(i);
                    }
                    console.log(d)
                    let decoded = gps_data.decode(d);
                    console.log(`decoded = ${JSON.stringify(decoded)}`);
                })
            });



            socket.on('chat', function (data, fn) {
                fn('');
                //Because it is not processed on the server side, the sent message will be sent to itself again.
                var mine = layim.cache().mine;
                if (mine.id == data.from_user_id) {
                    return;
                }
                im.handleMessage(data);
            });

            socket.on('otherLogin', function (data) {
                alert("Account login！");
                socket.disconnect();
            });

            socket.on('addGroup', function () {
                layer.alert("There are new users applying for grouping, please check the message box!",
                 {icon: 0, time: 0, title: "Add information"  , btn: ['Ok']});
                layim.msgbox(1);
            });

            socket.on('agreeAddGroup', function (data) {
                layer.alert("Your group request is approved", {icon: 0, time: 0, title: "Add group message", btn: ['Ok']});
            });

            socket.on('refuseAddGroup', function (data) {
                layer.alert("Add group rejected", {icon: 0, time: 0, title: "Add group message", btn: ['Ok']});
            });

            // socket.on('connect_error', function () {
            //     layer.alert("Connection failure！", {icon: 0, time: 0, title: "Remote login"});
            // });

            socket.on('disconnect', function () {
                index = layer.msg('You are disconnected from the server!', {icon: 2, shade: 0.5, time: -1});
            });

            //Listening window close event, when the window is closed,
            //actively close the socket connection to prevent the connection
            //from closing before closing the window
            window.onbeforeunload = function () {
                socket.disconnect();
            }
        },

        //Handling received messages
        handleMessage: function (data) {
            console.log(data);
            switch (data.chat_type) {
                //Handling friends and group messages
                case "groupChat":
                case "chat": {
                    var ext = JSON.parse(data.ext);
                    var msg = {
                        username: data.from_user //Source username
                        , avatar: ext.from_user_avatar //Source user avatar
                        , id: data.chat_type == "chat" ? data.from_user_id : data.to_user_id//The source ID of the message (user id if it’s a private chat, group id if it’s a group chat)
                        , type: data.chat_type == "chat" ? "friend" : "group" //The source type of the chat window, obtained from the to which the message is sent
                        , content: data.bodies.msg //Message content
                        , cid: data.msg_id //Message id, can not pass. Unless you want to do something with the message (such as withdrawing)
                        , mine: false //Whether the message I sent, if true, will be displayed on the right
                        , fromid: data.from_user_id  //The sender id of the message (such as a message sender in the group), can be used to automatically solve some problems when the browser multi-window
                        , timestamp: data.timestamp //Server timestamp milliseconds. Note: If you are returning a standard unix timestamp, remember to *1000
                    }
                    layim.getMessage(msg);
                    break;
                }
                    ;

                //Monitor your friends' online status
                case "checkOnline": {
                    var style;
                    if (data.status == "在线") {
                        style = "color:#00EE00;";
                    } else {
                        style = "color:#FF5722;";
                    }
                    layim.setChatStatus('<span style="' + style + '">' + json.status + '</span>');
                    break;
                }
                    ;

                //Message box
                case "unHandMessage": {
                    //Message box unprocessed message
                    layim.msgbox(data.count);
                    break;
                }
                    ;
                //Delete friend message，
                case "delFriend": {
                    var friends = layim.cache().friend;
                    var friend = getFriend(friends, json.uId);
                    layer.alert("user'" + friend.username + "'Deleted you!", {icon: 1, time: 0, title: "delete message"});
                    layim.removeList({
                        type: 'friend'
                        , id: data.uId
                    });
                    break;
                }
                    ;
                //Add friend request
                case "addFriend": {
                    layer.alert("There are new users to add you as a friend, please check the message box!", {icon: 0, time: 0, title: "add information"});
                    layim.msgbox(1);
                    break;
                }
                    ;
                //Agree to add friends when adding dao friends list
                case "agreeAddFriend": {
                    var group = eval("(" + json.msg + ")");
                    layim.addList({
                        type: 'friend'
                        , avatar: json.mine.avatar
                        , username: json.mine.username
                        , groupid: group.group
                        , id: json.mine.id
                        , sign: json.mine.sign
                    });
                    layer.alert("user'" + json.mine.username + "'Already agree to add you as a friend!", {icon: 0, time: 0, title: "add information"});
                    break;
                }
                    ;

            }
        }
    }


    //Initialize the WebSocket object
    im.init();

    // var cache = layui.layim.cache();
    // var local = layui.data('layim'); //Get current user local data
    // console.log(JSON.stringify(local))

    //Basic configuration
    layim.config({
        //The name displayed after the main panel is minimized
        title: "My IM",
        //Initialize interface
        init: {
            url: '/user/findAllUser'
            // url: '/user/init/' + getUid()
            // , data: {id: getUid()}
        }

        //View group member interface
        , members: {
            url: '/group/findGroupUsers'
            , data: {}
        }

        //Upload image interface
        , uploadImage: {
            url: '/user/upload' //（The returned data format is shown below.）
            , type: 'post' //Default post
        }

        //Upload file interface
        , uploadFile: {
            url: '/user/upload' //(The returned data format is shown below)
            , type: 'post' //Default post
        }

        //Extension toolbar
        , tool: [{
            alias: 'code'
            , title: 'Insert Code Tool'
            , icon: '&#xe64e;'
        }]

        , title: 'My IM' //Customize the title of the main panel when it is minimized
        , brief: false //Whether it is simple mode (if it is turned on, the main panel is not displayed)
        , right: '20px' //The distance from the main panel to the right side of the browser
        , minRight: '20px' //When the chat panel is minimized, it is relative to the right side of the browser.
        , initSkin: '4.jpg' //1-5 setting the initial background
        //,skin: ['aaa.jpg'] //Add skin
        , isfriend: true //Whether to open a friend
        , isgroup: true //Whether to open the group
        , isAudio: true //Whether to open chat toolbar audio
        , isVideo: true //Whether to enable the chat toolbar video
        , min: false //Whether to minimize the main panel, the default is false
        , notice: true //Whether to enable desktop message reminder, default false
        , voice: 'default.wav' //Sound reminder, default on, sound file is: default.wav

        , msgbox: '/static/html/msgbox.html' //Message box page address, if not open, you can remove the item
        , find: '/static/html/find.html' //Find the page address. If it is not enabled, you can remove the item.
        , chatLog: '/static/html/chatlog.html' //Chat record page address, if not open, you can remove the item
    });

    //Listening for online switching events
    layim.on('online', function (data) {
        socket.emit("changOnline", JSON.stringify({
            type: "changOnline",
            mine: null,
            to: null,
            msg: data
        }));
    });

    //Listening signature modification
    layim.on('sign', function (value) {
        $.ajax({
            url: "/user/updateSign",
            dataType: "JSON",
            type: "POST",
            data: {"sign": value},
            success: function (data) {
                layer.msg(data.msg);
            },
            error: function (data) {
                layer.msg(data.msg + ",Server error, please try again later！");
            }
        });
    });

    //Listen to the custom toolbar click to add code as an example
    layim.on('tool(code)', function (insert) {
        layer.prompt({
            title: 'Insert code'
            , btn: ['Confirm', 'Cancel']
            , formType: 2
            , shade: 0
        }, function (text, index) {
            layer.close(index);
            insert('[pre class=layui-code]' + text + '[/pre]'); //Insert content into the editor
        });
    });

    //Monitor layim to be ready
    layim.on('ready', function (res) {
        //Personal information
        $(".layui-layim-user").css("cursor", "pointer");
        var mine = layim.cache().mine;
        $(".layui-layim-user").bind("click", function () {
            layer.open({
                type: 2,
                title: "Modify Personal Information",
                skin: 'layui-layer-rim',
                area: ['500px', '550px'],
                content: '/static/html/userinfo.html'
            });
        });

        //请求未处理的消息
        // socket.emit('chat', JSON.stringify({
        //     type: "unHandMessage",
        //     mine: null,
        //     to: null
        // }));
    });

    //Listening to send messages
    layim.on('sendMessage', function (data) {

        console.log(data); // data will be 'woot'

        var jsonObject = {};

        var mine = data.mine;
        var to = data.to;

        if (data.to.type == "group") {
            jsonObject = {
                from_user: mine.username,
                from_user_id: mine.id,
                to_user: to.groupname,
                to_user_id: to.id,
                chat_type: "groupChat",
                bodies: {
                    type: 'txt',
                    msg: mine.content,
                },
                ext: JSON.stringify({
                    from_user_avatar: to.avatar,
                })
            };
        } else {
            jsonObject = {
                from_user: mine.username,
                from_user_id: mine.id,
                to_user: to.username,
                to_user_id: to.id,
                chat_type: "chat",
                bodies: {
                    type: 'txt',
                    msg: mine.content,
                },
                ext: JSON.stringify({
                    from_user_avatar: mine.avatar
                })
            };
        }

        socket.emit('chat', jsonObject, function (data) {
            if (data) {
                layer.msg(data, {icon: 0, shade: 0.5});
            }
        });

    });

    //Listen to view group members
    layim.on('members', function (data) {
        console.log(data);
    });

    //Monitor chat window switching
    layim.on('chatChange', function (res) {
        var type = res.data.type;
        //Monitor the status of a friend if it is a friend window
        if ("friend" == type) {
            socket.send(JSON.stringify({
                type: "checkOnline",
                mine: null,
                to: res.data
            }));
        } else if (type === 'group') {
            //Analog system message
            /*layim.getMessage({
             system: true
             ,id: res.data.id
             ,type: "group"
             ,content: '模拟群员'+(Math.random()*100|0) + '加入群聊'
             });*/
        }
    });

    //Externally customize my events
    my_events = {
        //Change user group
        changeGroup: function (othis, e) {
            //Change group template
            var elemAddTpl = ['<div class="layim-add-box">'
                , '<div class="layim-add-img" style="position:static;"><img class="layui-circle" src="{{ d.data.avatar }}"><p>' +
                '{{ d.data.name||"" }}</p></div>'
                , '<div class="layim-add-remark">'
                , '{{# if(d.data.type === "friend" && d.type === "setGroup"){ }}'
                , '<p>Select group</p>'
                , '{{# } if(d.data.type === "friend"){ }}'
                , '<select class="layui-select" id="LAY_layimGroup">'
                , '{{# layui.each(d.data.group, function(index, item){ }}'
                , '<option value="{{ item.id }}">{{ item.groupname }}</option>'
                , '{{# }); }}'
                , '</select>'
                , '{{# } }}'
                , '{{# if(d.data.type === "group"){ }}'
                , '<p>Please enter verification information</p>'
                , '{{# } if(d.type !== "setGroup"){ }}'
                , '<textarea id="LAY_layimRemark" placeholder="verify message" class="layui-textarea"></textarea>'
                , '{{# } }}'
                , '</div>'
                , '</div>'].join('');

            var friend_id = othis.parent().attr('data-id');
            $.getJSON('/user/findUser?id=' + friend_id.substring(12), function (res) {
                if (0 == res.code) {
                    var index = layer.open({
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        btn: ['confirm', 'cancel'],
                        title: 'Mobile grouping',
                        area: ['440px', '260px'],
                        content: laytpl(elemAddTpl).render({
                            data: {
                                name: res.data.username
                                , avatar: res.data.avatar
                                , group: parent.layui.layim.cache().friend
                                , type: 'friend'
                            }
                            , type: 'setGroup'
                        })
                        , yes: function (index, layero) {
                            var groupElem = layero.find('#LAY_layimGroup');
                            var group_id = groupElem.val(); //Group id
                            $.post('/user/changeGroup', {'groupId': group_id, 'userId': res.data.id},
                                function (data) {
                                    if (0 == data.code) {
                                        layer.msg(data.msg, {time: 1500});
                                        //Remove from the old group first, then join the new group
                                        layim.removeList({
                                            type: 'friend'
                                            , id: res.data.id
                                        });
                                        //Join a new group
                                        layim.addList({
                                            type: 'friend'
                                            , avatar: res.data.avatar
                                            , username: res.data.username
                                            , groupid: group_id
                                            , id: res.data.id
                                            , sign: res.data.sign
                                        });
                                        layer.close(index);
                                    } else {
                                        layer.msg(data.msg, {time: 2000});
                                    }
                                }, 'json');
                        }
                    });
                } else {
                    layer.msg(res.msg, {time: 2000});
                }
            });
        },
        //delete friend
        removeFriend: function (othis, e) {
            var friend_id = othis.parent().attr('data-id').substring(12);
            //Inquiry box
            layer.confirm('Make sure to delete the friend？', {
                btn: ['determine', 'cancel'],
                title: 'friendly reminder',
                closeBtn: 0,
                icon: 3
            }, function () {
                $.post('/user/removeFriend', {'friendId': friend_id}, function (res) {
                    if (0 == res.code) {
                        layer.msg('successfully deleted!', {icon: 1, time: 1500});
                        layim.removeList({
                            type: 'friend'
                            , id: friend_id
                        });
                        //If the other party is online, notify the other party to delete me.
                        var data = '{"type":"delFriend","to":{"id":' + friend_id + '}}';
                        socket.send(data);
                    } else {
                        layer.msg(res.msg, {time: 1500});
                    }
                }, 'json');
            });
        },
        //checking data
        checkOut: function (othis, e) {
            var friend_id = othis.parent().attr('data-id').substring(12);
            var friends = layim.cache().friend;
            var friend = getFriend(friends, friend_id);
            var params = escape("id=" + friend.id + "&username=" + friend.username + "&sign=" + friend.sign + "&avatar=" + friend.avatar + "&email=" + friend.email + "&sex=" + friend.sex);
            layer.open({
                type: 2,
                title: "Friend information",
                skin: 'layui-layer-rim',
                area: ['500px', '300px'],
                scrollbar: false,
                maxWidth: "400px",
                content: '/static/html/friend.html?' + params
            });
        },
        //Exit group
        leaveOutGroup: function (othis, e) {
            var groupId = othis.parent().attr("data-id");
            var index = layer.confirm('Ok to exit the group？', {
                btn: ['determine', 'cancel'],
                title: 'friendly reminder',
                closeBtn: 0,
                icon: 3
            }, function () {
                $.post('/user/leaveOutGroup', {
                    groupId: groupId
                }, function (res) {
                    if (res.code == 0) {
                        layim.removeList({type: 'group', id: groupId});
                    }
                    layer.msg(res.msg);
                    layer.close(index);
                }, "json");
            });
        },
        //Right click menu message record
        viewChatLog: function (othis, e) {
            var friend_id = othis.parent().attr('data-id').substring(12);
            var friends = layim.cache().friend;
            var friend = getFriend(friends, friend_id);
            return layer.open({
                type: 2
                , maxmin: true
                , title: 'versus ' + friend.username + ' Chat history'
                , area: ['45%', '100%']
                , shade: false
                , offset: 'rb'
                , skin: 'layui-box'
                , anim: 2
                , id: 'layui-layim-chatlog'
                , content: layim.cache().base.chatLog + '?id=' + friend.id + '&Type=friend'
            });
        }
    }
    //Get offline messages
    /*$.ajax({
     url:"/user/getOffLineMessage",
     dataType:"JSON",
     type:"POST",
     success:function(data) {
     console.log(data.data.length)
     for(var i = 0; i < data.data.length; i ++){
     layim.getMessage(data.data[i]);
     console.log(JSON.stringify(data.data[i]));
     }
     },
     error:function(data) {
     layer.msg(data.msg + ",服务器错误,请稍后再试！");
     }
     });*/
});
