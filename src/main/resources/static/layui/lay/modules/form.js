/**

 @Name：layui.form 表单组件
 @Author：贤心
 @License：LGPL
    
 */
 
layui.define('layer', function(exports){
  "use strict";
  
  var $ = layui.jquery
  ,layer = layui.layer
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this', SHOW = 'layui-show', DISABLED = 'layui-disabled'
  
  ,Form = function(){
    this.config = {
      verify: {
        required: [
          /[\S]+/
          ,'Required field cannot be empty'
        ]
        ,phone: [
          /^1\d{10}$/
          ,'Please enter a valid phone number'
        ]
        ,email: [
          /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
          ,'E-mail format is incorrect'
        ]
        ,url: [
          /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
          ,'Link format is incorrect'
        ]
        ,number: [
          /^\d+$/
          ,'Can only fill in numbers'
        ]
        ,date: [
          /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
          ,'Date format is incorrect'
        ]
        ,identity: [
          /(^\d{15}$)|(^\d{17}(x|X|\d)$)/
          ,'Please enter the correct ID number'
        ]
      }
    };
  };
  
  //Global Settings
  Form.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //Verification rule setting
  Form.prototype.verify = function(settings){
    var that = this;
    $.extend(true, that.config.verify, settings);
    return that;
  };
  
  //Form event listener
  Form.prototype.on = function(events, callback){
    return layui.onevent(MOD_NAME, events, callback);
  };
  
  //Form control rendering
  Form.prototype.render = function(type){
    var that = this, items = {
      //Drop down selection box
      select: function(){
        var TIPS = 'Please choose', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
        
        ,selects = $(ELEM).find('select'), hide = function(e, clear){
          if(!$(e.target).parent().hasClass(TITLE) || clear){
            $('.'+CLASS).removeClass(CLASS+'ed');
          }
        }
        
        ,events = function(reElem, disabled){
          var select = $(this), title = reElem.find('.' + TITLE);
          
          if(disabled) return;
          
          //Expand drop down
          title.on('click', function(e){
            reElem.hasClass(CLASS+'ed') ? reElem.removeClass(CLASS+'ed') : (
              hide(e, true), 
              reElem.addClass(CLASS+'ed')
            );
          });
          
          //select
          reElem.find('dl>dd').on('click', function(){
            var othis = $(this), value = othis.attr('lay-value');
            var filter = select.attr('lay-filter'); //Get filter

            if(othis.hasClass(DISABLED)) return false;
            
            select.val(value).removeClass('layui-form-danger'), title.find('input').val(othis.text());
            othis.addClass(THIS).siblings().removeClass(THIS);
            layui.event(MOD_NAME, 'select('+ filter +')', {
              elem: select[0]
              ,value: value
            });
          });
          
          reElem.find('dl>dt').on('click', function(e){
            return false;
          });
          
          //Close drop
          $(document).off('click', hide).on('click', hide)
        }
        
        selects.each(function(index, select){
          var othis = $(this), hasRender = othis.next('.'+CLASS), disabled = this.disabled;
          var value = select.value, selected = $(select.options[select.selectedIndex]); //Get the currently selected item

          //Alternative element
          var reElem = $(['<div class="layui-unselect '+ CLASS + (disabled ? ' layui-select-disabled' : '') +'">'
            ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ (select.options[0].innerHTML ? select.options[0].innerHTML : TIPS) +'" value="'+ (value ? selected.html() : '') +'" readonly class="layui-input layui-unselect'+ (disabled ? (' '+DISABLED) : '') +'">'
            ,'<i class="layui-edge"></i></div>'
            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
              var arr = [];
              layui.each(options, function(index, item){
                if(index === 0 && !item.value) return;
                if(item.tagName.toLowerCase() === 'optgroup'){
                  arr.push('<dt>'+ item.label +'</dt>'); 
                } else {
                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
                }
              });
              return arr.join('');
            }(othis.find('*')) +'</dl>'
          ,'</div>'].join(''));
          
          hasRender[0] && hasRender.remove(); //If it has been rendered, then Rerender
          othis.after(reElem);
          events.call(this, reElem, disabled);
        });
      }
      //Check box / switch
      ,checkbox: function(){
        var CLASS = {
          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
        }
        ,checks = $(ELEM).find('input[type=checkbox]')
        
        ,events = function(reElem, RE_CLASS){
          var check = $(this);
          
          //Check
          reElem.on('click', function(){
            var filter = check.attr('lay-filter'); //Get filter

            if(check[0].disabled) return;
            
            check[0].checked ? (
              check[0].checked = false
              ,reElem.removeClass(RE_CLASS[1])
            ) : (
              check[0].checked = true
              ,reElem.addClass(RE_CLASS[1])
            );
            layui.event(MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
              elem: check[0]
              ,value: check[0].value
            });
          });
        }
        
        checks.each(function(index, check){
          var othis = $(this), skin = othis.attr('lay-skin'), disabled = this.disabled;
          if(skin === 'switch') skin = '_'+skin;
          var RE_CLASS = CLASS[skin] || CLASS.checkbox;
          
          //Alternative element
          var hasRender = othis.next('.' + RE_CLASS[0]);
          var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0] + (
            check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disbaled '+DISABLED : '') +'">'
          ,{
            _switch: '<i></i>'
          }[skin] || ('<span>'+ (check.title || 'Check') +'</span><i class="layui-icon">&#xe618;</i>')
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); //If it has been rendered, then Rerender
          othis.after(reElem);
          events.call(this, reElem, RE_CLASS);
        });
      }
      //Single box
      ,radio: function(){
        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
        ,radios = $(ELEM).find('input[type=radio]')
        
        ,events = function(reElem){
          var radio = $(this), ANIM = 'layui-anim-scaleSpring';
          
          reElem.on('click', function(){
            var name = radio[0].name, forms = radio.parents(ELEM);
            var filter = radio.attr('lay-filter'); //Get filter
            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //Find the brother of the same name
            
            if(radio[0].disabled) return;
            
            layui.each(sameRadio, function(){
              var next = $(this).next('.'+CLASS);
              this.checked = false;
              next.removeClass(CLASS+'ed');
              next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
            });
            
            radio[0].checked = true;
            reElem.addClass(CLASS+'ed');
            reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);
            
            layui.event(MOD_NAME, 'radio('+ filter +')', {
              elem: radio[0]
              ,value: radio[0].value
            });
          });
        };
        
        radios.each(function(index, radio){
          var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;
          
          //Alternative element
          var reElem = $(['<div class="layui-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' layui-radio-disbaled '+DISABLED : '') +'">'
          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
          ,'<span>'+ (radio.title||'unnamed') +'</span>'
          ,'</div>'].join(''));
          
          hasRender[0] && hasRender.remove(); //If it has been rendered, then Rerender
          othis.after(reElem);
          events.call(this, reElem);
        });
      }
    };
    type ? (
      items[type] ? items[type]() : hint.error('Unsupported'+ type + 'Form rendering')
    ) : layui.each(items, function(index, item){
      item();
    });
    return that;
  };
  
  //Form submission check
  var submit = function(){
    var button = $(this), verify = form.config.verify, stop = null
    ,DANGER = 'layui-form-danger', field = {} ,elem = button.parents(ELEM)
    
    ,verifyElem = elem.find('*[lay-verify]') //Get the elements that need to be verified
    ,formElem = button.parents('form')[0] //Get the current form element, if it exists
    ,fieldElem = elem.find('input,select,textarea') //Get all form fields
    ,filter = button.attr('lay-filter'); //Get filter
 
    //Start calibration
    layui.each(verifyElem, function(_, item){
      var othis = $(this), ver = othis.attr('lay-verify'), tips = '';
      var value = othis.val(), isFn = typeof verify[ver] === 'function';
      othis.removeClass(DANGER);
      if(verify[ver] && (isFn ? tips = verify[ver](value, item) : !verify[ver][0].test(value)) ){
        layer.msg(tips || verify[ver][1], {
          icon: 5
          ,shift: 6
        });
        //Non-mobile device automatic positioning focus
        if(!device.android && !device.ios){
          item.focus();
        }
        othis.addClass(DANGER);
        return stop = true;
      }
    });
    
    if(stop) return false;
    
    layui.each(fieldElem, function(_, item){
      if(!item.name) return;
      if(/^checkbox|radio$/.test(item.type) && !item.checked) return;
      field[item.name] = item.value;
    });
 
    //Get field
    return layui.event.call(this, MOD_NAME, 'submit('+ filter +')', {
      elem: this
      ,form: formElem
      ,field: field
    });
  };

  //Auto-complete rendering
  var form = new Form(), dom = $(document);
  form.render();
  
  //Form reset reset rendering
  dom.on('reset', ELEM, function(){
    setTimeout(function(){
      form.render();
    }, 50);
  });
  
  //Form submission event
  dom.on('submit', ELEM, submit)
  .on('click', '*[lay-submit]', submit);
  
  exports(MOD_NAME, function(options){
    return form.set(options);
  });
});

 
