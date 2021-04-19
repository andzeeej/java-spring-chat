/**

 @Name：layui.layedit Rich text editor
 @Author：Wisdom
 @License：LGPL
    
 */
 
layui.define(['layer', 'form'], function(exports){
  "use strict";
  
  var $ = layui.jquery
  ,layer = layui.layer
  ,form = layui.form()
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'layedit', THIS = 'layui-this', SHOW = 'layui-show', ABLED = 'layui-disabled'
  
  ,Edit = function(){
    var that = this;
    that.index = 0;
    
    //Global configuration
    that.config = {
      //Default tool bar
      tool: [
        'strong', 'italic', 'underline', 'del'
        ,'|'
        ,'left', 'center', 'right'
        ,'|'
        ,'link', 'unlink', 'face', 'image'
      ]
      ,hideTool: []
      ,height: 280 //默认高
    };
  };
  
  //Global Settings
  Edit.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //Event listener
  Edit.prototype.on = function(events, callback){
    return layui.onevent(MOD_NAME, events, callback);
  };
  
  //Create editor
  Edit.prototype.build = function(id, settings){
    settings = settings || {};
    
    var that = this
    ,config = that.config
    ,ELEM = 'layui-layedit', textArea = $('#'+id)
    ,name =  'LAY_layedit_'+ (++that.index)
    ,haveBuild = textArea.next('.'+ELEM)
    
    ,set = $.extend({}, config, settings)
    
    ,tool = function(){
      var node = [], hideTools = {};
      layui.each(set.hideTool, function(_, item){
        hideTools[item] = true;
      });
      layui.each(set.tool, function(_, item){
        if(tools[item] && !hideTools[item]){
          node.push(tools[item]);
        }
      });
      return node.join('');
    }()
 
    
    ,editor = $(['<div class="'+ ELEM +'">'
      ,'<div class="layui-unselect layui-layedit-tool">'+ tool +'</div>'
      ,'<div class="layui-layedit-iframe">'
        ,'<iframe id="'+ name +'" name="'+ name +'" textarea="'+ id +'" frameborder="0"></iframe>'
      ,'</div>'
    ,'</div>'].join(''))
    
    //Editor is not compatible with ie8
    if(device.ie && device.ie < 8){
      return textArea.removeClass('layui-hide').addClass(SHOW);
    }

    haveBuild[0] && (haveBuild.remove());

    setIframe.call(that, editor, textArea[0], set)
    textArea.addClass('layui-hide').after(editor);

    return that.index;
  };
  
  //Get the content in the editor
  Edit.prototype.getContent = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    return toLower(iframeWin[0].document.body.innerHTML);
  };
  
  //Get plain text content in the editor
  Edit.prototype.getText = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    return $(iframeWin[0].document.body).text();
  };
  
  //Synchronize editor content to textarea (usually for asynchronous commits)
  Edit.prototype.sync = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    var textarea = $('#'+iframeWin[1].attr('textarea'));
    textarea.val(toLower(iframeWin[0].document.body.innerHTML));
  };
  
  //Get editor selection
  Edit.prototype.getSelection = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    var range = Range(iframeWin[0].document);
    return document.selection ? range.text : range.toString();
  };

  //Iframe initialization
  var setIframe = function(editor, textArea, set){
    var that = this, iframe = editor.find('iframe');

    iframe.css({
      height: set.height
    }).on('load', function(){
      var conts = iframe.contents()
      ,iframeWin = iframe.prop('contentWindow')
      ,head = conts.find('head')
      ,style = $(['<style>'
        ,'*{margin: 0; padding: 0;}'
        ,'body{padding: 10px; line-height: 20px; overflow-x: hidden; word-wrap: break-word; font: 14px Helvetica Neue,Helvetica,PingFang SC,Microsoft YaHei,Tahoma,Arial,sans-serif; -webkit-box-sizing: border-box !important; -moz-box-sizing: border-box !important; box-sizing: border-box !important;}'
        ,'a{color:#01AAED; text-decoration:none;}a:hover{color:#c00}'
        ,'p{margin-bottom: 10px;}'
        ,'img{display: inline-block; border: none; vertical-align: middle;}'
        ,'pre{margin: 10px 0; padding: 10px; line-height: 20px; border: 1px solid #ddd; border-left-width: 6px; background-color: #F2F2F2; color: #333; font-family: Courier New; font-size: 12px;}'
      ,'</style>'].join(''))
      ,body = conts.find('body');
      
      head.append(style);
      body.attr('contenteditable', 'true').css({
        'min-height': set.height
      }).html(textArea.value||'');

      hotkey.apply(that, [iframeWin, iframe, textArea, set]); //Shortcut processing
      toolActive.call(that, iframeWin, editor, set); //Trigger tool

    });
  }
  
  //Get the iframe window object
  ,getWin = function(index){
    var iframe = $('#LAY_layedit_'+ index)
    ,iframeWin = iframe.prop('contentWindow');
    return [iframeWin, iframe];
  }
  
  //Handling tags to lowercase in IE8
  ,toLower = function(html){
    if(device.ie == 8){
      html = html.replace(/<.+>/g, function(str){
        return str.toLowerCase();
      });
    }
    return html;
  }
  
  //Shortcut processing
  ,hotkey = function(iframeWin, iframe, textArea, set){
    var iframeDOM = iframeWin.document, body = $(iframeDOM.body);
    body.on('keydown', function(e){
      var keycode = e.keyCode;
      //Handling carriage return
      if(keycode === 13){
        var range = Range(iframeDOM);
        var container = getContainer(range)
        ,parentNode = container.parentNode;
        
        if(parentNode.tagName.toLowerCase() === 'pre'){
          if(e.shiftKey) return
          layer.msg('Please temporarily use shift+enter');
          return false;
        }
        iframeDOM.execCommand('formatBlock', false, '<p>');
      }
    });
    
    //Synchronize content to textarea
    $(textArea).parents('form').on('submit', function(){
      var html = body.html();
      //Handling tags to lowercase in IE8
      if(device.ie == 8){
        html = html.replace(/<.+>/g, function(str){
          return str.toLowerCase();
        });
      }
      textArea.value = html;
    });
    
    //Processing paste
    body.on('paste', function(e){
      iframeDOM.execCommand('formatBlock', false, '<p>');
      setTimeout(function(){
        filter.call(iframeWin, body);
        textArea.value = body.html();
      }, 100); 
    });
  }
  
  //Label filtering
  ,filter = function(body){
    var iframeWin = this
    ,iframeDOM = iframeWin.document;
    
    //Clear the css attribute that affects the layout
    body.find('*[style]').each(function(){
      var textAlign = this.style.textAlign;
      this.removeAttribute('style');
      $(this).css({
        'text-align': textAlign || ''
      })
    });
    
    //Modified form
    body.find('table').addClass('layui-table');
    
    //Remove unsafe labels
    body.find('script,link').remove();
  }
  
  //Range object compatibility processing
  ,Range = function(iframeDOM){
    return iframeDOM.selection 
      ? iframeDOM.selection.createRange()
    : iframeDOM.getSelection().getRangeAt(0);
  }
  
  //Current EndContainer compatibility handling for Range objects
  ,getContainer = function(range){
    return range.endContainer || range.parentElement().childNodes[0]
  }
  
  //Insert inline elements in the selection
  ,insertInline = function(tagName, attr, range){
    var iframeDOM = this.document
    ,elem = document.createElement(tagName)
    for(var key in attr){
      elem.setAttribute(key, attr[key]);
    }
    elem.removeAttribute('text');

    if(iframeDOM.selection){ //IE
      var text = range.text || attr.text;
      if(tagName === 'a' && !text) return;
      if(text){
        elem.innerHTML = text;
      }
      range.pasteHTML($(elem).prop('outerHTML')); 
      range.select();
    } else { //非IE
      var text = range.toString() || attr.text;
      if(tagName === 'a' && !text) return;
      if(text){
        elem.innerHTML = text;
      }
      range.deleteContents();
      range.insertNode(elem);
    }
  }
  
  //Tool selected
  ,toolCheck = function(tools, othis){
    var iframeDOM = this.document
    ,CHECK = 'layedit-tool-active'
    ,container = getContainer(Range(iframeDOM))
    ,item = function(type){
      return tools.find('.layedit-tool-'+type)
    }

    if(othis){
      othis[othis.hasClass(CHECK) ? 'removeClass' : 'addClass'](CHECK);
    }
    
    tools.find('>i').removeClass(CHECK);
    item('unlink').addClass(ABLED);

    $(container).parents().each(function(){
      var tagName = this.tagName.toLowerCase()
      ,textAlign = this.style.textAlign;

      //Text
      if(tagName === 'b' || tagName === 'strong'){
        item('b').addClass(CHECK)
      }
      if(tagName === 'i' || tagName === 'em'){
        item('i').addClass(CHECK)
      }
      if(tagName === 'u'){
        item('u').addClass(CHECK)
      }
      if(tagName === 'strike'){
        item('d').addClass(CHECK)
      }
      
      //Align
      if(tagName === 'p'){
        if(textAlign === 'center'){
          item('center').addClass(CHECK);
        } else if(textAlign === 'right'){
          item('right').addClass(CHECK);
        } else {
          item('left').addClass(CHECK);
        }
      }
      
      //Hyperlink
      if(tagName === 'a'){
        item('link').addClass(CHECK);
        item('unlink').removeClass(ABLED);
      }
    });
  }

  //Trigger tool
  ,toolActive = function(iframeWin, editor, set){
    var iframeDOM = iframeWin.document
    ,body = $(iframeDOM.body)
    ,toolEvent = {
      //Hyperlink
      link: function(range){
        var container = getContainer(range)
        ,parentNode = $(container).parent();
        
        link.call(body, {
          href: parentNode.attr('href')
          ,target: parentNode.attr('target')
        }, function(field){
          var parent = parentNode[0];
          if(parent.tagName === 'A'){
            parent.href = field.url;
          } else {
            insertInline.call(iframeWin, 'a', {
              target: field.target
              ,href: field.url
              ,text: field.url
            }, range);
          }
        });
      }
      //Clear hyperlink
      ,unlink: function(range){
        iframeDOM.execCommand('unlink');
      }
      //emodji
      ,face: function(range){
        face.call(this, function(img){
          insertInline.call(iframeWin, 'img', {
            src: img.src
            ,alt: img.alt
          }, range);
        });
      }
      //image
      ,image: function(range){
        var that = this;
        layui.use('upload', function(upload){
          var uploadImage = set.uploadImage || {};
          upload({
            url: uploadImage.url
            ,method: uploadImage.type
            ,elem: $(that).find('input')[0]
            ,unwrap: true
            ,success: function(res){
              if(res.code == 0){
                res.data = res.data || {};
                insertInline.call(iframeWin, 'img', {
                  src: res.data.src
                  ,alt: res.data.title
                }, range);
              } else {
                layer.msg(res.msg||'Upload failed');
              }
            }
          });
        });
      }
      //Insert code
      ,code: function(range){
        code.call(body, function(pre){
          insertInline.call(iframeWin, 'pre', {
            text: pre.code
            ,'lay-lang': pre.lang
          }, range);
        });
      }
      //help
      ,help: function(){
        layer.open({
          type: 2
          ,title: 'help'
          ,area: ['600px', '380px']
          ,shadeClose: true
          ,shade: 0.1
          ,skin: 'layui-layer-msg'
          ,content: ['http://www.layui.com/about/layedit/help.html', 'no']
        });
      }
    }
    ,tools = editor.find('.layui-layedit-tool')
    
    ,click = function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event')
      ,command = othis.attr('lay-command');
      
      if(othis.hasClass(ABLED)) return;

      body.focus();
      
      var range = Range(iframeDOM)
      ,container = range.commonAncestorContainer
      
      if(command){
        iframeDOM.execCommand(command);
        if(/justifyLeft|justifyCenter|justifyRight/.test(command)){
          iframeDOM.execCommand('formatBlock', false, '<p>');
        }
        setTimeout(function(){
          body.focus();
        }, 10);
      } else {
        toolEvent[events] && toolEvent[events].call(this, range);
      }
      toolCheck.call(iframeWin, tools, othis);
    }
    
    ,isClick = /image/

    tools.find('>i').on('mousedown', function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event');
      if(isClick.test(events)) return;
      click.call(this)
    }).on('click', function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event');
      if(!isClick.test(events)) return;
      click.call(this)
    });
    
    //Trigger content area
    body.on('click', function(){
      toolCheck.call(iframeWin, tools);
      layer.close(face.index);
    });
  }
  
  //Hyperlink panel
  ,link = function(options, callback){
    var body = this, index = layer.open({
      type: 1
      ,id: 'LAY_layedit_link'
      ,area: '350px'
      ,shade: 0.05
      ,shadeClose: true
      ,moveType: 1
      ,title: 'Hyperlink'
      ,skin: 'layui-layer-msg'
      ,content: ['<ul class="layui-form" style="margin: 15px;">'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label" style="width: 60px;">URL</label>'
          ,'<div class="layui-input-block" style="margin-left: 90px">'
            ,'<input name="url" lay-verify="url" value="'+ (options.href||'') +'" autofocus="true" autocomplete="off" class="layui-input">'
            ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label" style="width: 60px;">Open mode</label>'
          ,'<div class="layui-input-block" style="margin-left: 90px">'
            ,'<input type="radio" name="target" value="_self" class="layui-input" title="Current window"'
            + ((options.target==='_self' || !options.target) ? 'checked' : '') +'>'
            ,'<input type="radio" name="target" value="_blank" class="layui-input" title="New window" '
            + (options.target==='_blank' ? 'checked' : '') +'>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item" style="text-align: center;">'
          ,'<button type="button" lay-submit lay-filter="layedit-link-yes" class="layui-btn"> Confirm </button>'
          ,'<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> Cancel </button>'
        ,'</li>'
      ,'</ul>'].join('')
      ,success: function(layero, index){
        var eventFilter = 'submit(layedit-link-yes)';
        form.render('radio');  
        layero.find('.layui-btn-primary').on('click', function(){
          layer.close(index);
          body.focus();
        });
        form.on(eventFilter, function(data){
          layer.close(link.index);
          callback && callback(data.field);
        });
      }
    });
    link.index = index;
  }
  
  //Emoticon panel
  ,face = function(callback){
    //Expression library
    var faces = function(){
      var alt = ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]", "[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]", "[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]", "[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]", "[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]", "[蜡烛]", "[蛋糕]"], arr = {};
      layui.each(alt, function(index, item){
        arr[item] = layui.cache.dir + 'images/face/'+ index + '.gif';
      });
      return arr;
    }();
    face.hide = face.hide || function(e){
      if($(e.target).attr('layedit-event') !== 'face'){
        layer.close(face.index);
      }
    }
    return face.index = layer.tips(function(){
      var content = [];
      layui.each(faces, function(key, item){
        content.push('<li title="'+ key +'"><img src="'+ item +'" alt="'+ key +'"></li>');
      });
      return '<ul class="layui-clear">' + content.join('') + '</ul>';
    }(), this, {
      tips: 1
      ,time: 0
      ,skin: 'layui-box layui-util-face'
      ,maxWidth: 500
      ,success: function(layero, index){
        layero.css({
          marginTop: -4
          ,marginLeft: -10
        }).find('.layui-clear>li').on('click', function(){
          callback && callback({
            src: faces[this.title]
            ,alt: this.title
          });
          layer.close(index);
        });
        $(document).off('click', face.hide).on('click', face.hide);
      }
    });
  }
  
  //Insert code panel
  ,code = function(callback){
    var body = this, index = layer.open({
      type: 1
      ,id: 'LAY_layedit_code'
      ,area: '550px'
      ,shade: 0.05
      ,shadeClose: true
      ,moveType: 1
      ,title: 'Insert code'
      ,skin: 'layui-layer-msg'
      ,content: ['<ul class="layui-form layui-form-pane" style="margin: 15px;">'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label">Please select a language</label>'
          ,'<div class="layui-input-block">'
            ,'<select name="lang">'
              ,'<option value="JavaScript">JavaScript</option>'
              ,'<option value="HTML">HTML</option>'
              ,'<option value="CSS">CSS</option>'
              ,'<option value="Java">Java</option>'
              ,'<option value="PHP">PHP</option>'
              ,'<option value="C#">C#</option>'
              ,'<option value="Python">Python</option>'
              ,'<option value="Ruby">Ruby</option>'
              ,'<option value="Go">Go</option>'
            ,'</select>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item layui-form-text">'
          ,'<label class="layui-form-label">Code</label>'
          ,'<div class="layui-input-block">'
            ,'<textarea name="code" lay-verify="required" autofocus="true" class="layui-textarea" style="height: 200px;"></textarea>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item" style="text-align: center;">'
          ,'<button type="button" lay-submit lay-filter="layedit-code-yes" class="layui-btn"> Confirm </button>'
          ,'<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> Cancel </button>'
        ,'</li>'
      ,'</ul>'].join('')
      ,success: function(layero, index){
        var eventFilter = 'submit(layedit-code-yes)';
        form.render('select');  
        layero.find('.layui-btn-primary').on('click', function(){
          layer.close(index);
          body.focus();
        });
        form.on(eventFilter, function(data){
          layer.close(code.index);
          callback && callback(data.field);
        });
      }
    });
    code.index = index;
  }
  
  //All tools
  ,tools = {
    html: '<i class="layui-icon layedit-tool-html" title="HTML source code" lay-command="html" layedit-event="html"">&#xe64b;</i><span class="layedit-tool-mid"></span>'
    ,strong: '<i class="layui-icon layedit-tool-b" title="Bold" lay-command="Bold" layedit-event="b"">&#xe62b;</i>'
    ,italic: '<i class="layui-icon layedit-tool-i" title="Italic" lay-command="italic" layedit-event="i"">&#xe644;</i>'
    ,underline: '<i class="layui-icon layedit-tool-u" title="Underline" lay-command="underline" layedit-event="u"">&#xe646;</i>'
    ,del: '<i class="layui-icon layedit-tool-d" title="Strikethrough" lay-command="strikeThrough" layedit-event="d"">&#xe64f;</i>'
    
    ,'|': '<span class="layedit-tool-mid"></span>'
    
    ,left: '<i class="layui-icon layedit-tool-left" title="Align left" lay-command="justifyLeft" layedit-event="left"">&#xe649;</i>'
    ,center: '<i class="layui-icon layedit-tool-center" title="Align center" lay-command="justifyCenter" layedit-event="center"">&#xe647;</i>'
    ,right: '<i class="layui-icon layedit-tool-right" title="Align right" lay-command="justifyRight" layedit-event="right"">&#xe648;</i>'
    ,link: '<i class="layui-icon layedit-tool-link" title="Insert link" layedit-event="link"">&#xe64c;</i>'
    ,unlink: '<i class="layui-icon layedit-tool-unlink layui-disabled" title="Clear link" lay-command="unlink" layedit-event="unlink"">&#xe64d;</i>'
    ,face: '<i class="layui-icon layedit-tool-face" title="Emoji" layedit-event="face"">&#xe650;</i>'
    ,image: '<i class="layui-icon layedit-tool-image" title="Image" layedit-event="image">&#xe64a;<input type="file" name="file"></i>'
    ,code: '<i class="layui-icon layedit-tool-code" title="Insert code" layedit-event="code">&#xe64e;</i>'
    
    ,help: '<i class="layui-icon layedit-tool-help" title="Help" layedit-event="help">&#xe607;</i>'
  }
  
  ,edit = new Edit();

  exports(MOD_NAME, edit);
});
