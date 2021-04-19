layui.use(['jquery', 'layer', 'form', 'upload'], function() {
	var $ = layui.jquery,
	layim = parent.layim,
	form = layui.form,
	layer = layui.layer;
	//Shield right-click menu
	$(document).bind("contextmenu",function(e){
        return false;
    });
    //Modify avatar
    layui.upload({
        url: "/user/updateAvatar"
        ,title: 'Modify avatar'
        ,ext: 'jpg|png|gif'
        ,before: function(input) {
        	console.log("before upload!");
        }
        ,success: function(res, input){
            if(0 == res.code){
                $("#LAY_demo_upload").attr('src', res.data.src);
                $("#user_avatar").val(res.data.src);
                layer.msg("Successfully modified!", {time:2000});
            }else{
                layer.msg(res.msg, {time:2000});
            }
        }
    });
	
    //Initialize data from the cache
	$(document).ready(function(){
		var mine = layim.cache().mine;
		$("#username").val(mine.username);
		$("#email").val(mine.email);
		$("#sign").val(mine.sign);
		$("#LAY_demo_upload").attr("src", mine.avatar);
		if (mine.sex == "0") {
			$("input[type='radio']").eq(0).attr("checked",true);
		} else {
			$("input[type='radio']").eq(1).attr("checked",true);
		}
	});
	
    //Submit edits
    $("#btn").click(function(){
        layer.ready(function(){
            var username = $("#username").val();
            var email = $("#email").val();
            var sex = $("input[type='radio']:checked").val();
            if('' == username){
                layer.tips('Username can not be empty', '#username');
                return ;
            }
            if('' == email){
                layer.tips('E-mail can not be empty!', '#email');
                return ;
            }
            
            var oldpwd = $("#oldpwd").val(); //旧密码
            var pwd = $("#pwd").val();
            var repwd = $("#repwd").val();
            if('' != oldpwd){
            	if('' == pwd){
            		layer.tips('New password cannot be empty', '#pwd');
            		return ;
            	}
            	if('' != pwd && '' == repwd){
            		layer.tips('Duplicate password cannot be empty', '#repwd');
            		return ;
            	}
            	if(!/^[\S]{6,12}$/.test(oldpwd)){
            		layer.tips('Password must be 6 to 12 digits', '#oldpwd');
            		return ;
            	}
            	if('' != pwd && '' != repwd && '' == oldpwd){
            		layer.tips('Must enter the old password', '#oldpwd');
            		return ;
            	}                
            	if('' != pwd && '' != repwd && '' != oldpwd && pwd != repwd){
            		layer.tips('Two passwords are inconsistent', '#pwd');
            		return ;
            	}
            	if('' != pwd && '' != repwd && '' != oldpwd && pwd == repwd){
            		if(!/^[\S]{6,12}$/.test(pwd)){
            			layer.tips('Password must be 6 to 12 digits', '#pwd');
            			return ;
            		}
            		if(!/^[\S]{6,12}$/.test(repwd)){
            			layer.tips('Password must be 6 to 12 digits', '#repwd');
            			return ;
            		}
            	}
            }
                    
        });
    });
});