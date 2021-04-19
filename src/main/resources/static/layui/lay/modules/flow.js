/**

 @Name：layui.flow Stream loading
 @Author：Wisdom
 @License：LGPL
    
 */
 
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.jquery, Flow = function(options){}
  ,ELEM_MORE = 'layui-flow-more'
  ,ELEM_LOAD = '<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon ">&#xe63e;</i>';

  //Main method
  Flow.prototype.load = function(options){
    var that = this, page = 0, lock, isOver, lazyimg, timer;
    options = options || {};
    
    var elem = $(options.elem); if(!elem[0]) return;
    var scrollElem = $(options.scrollElem || document); //The element where the scroll bar is located
    var mb = options.mb || 50; //Critical distance from the bottom
    var isAuto = 'isAuto' in options ? options.isAuto : true; //Whether to automatically scroll loading
    var end = options.end || 'End'; //"Last page" shows copy
    
    //Whether the element of the scroll bar is document
    var notDocment = options.scrollElem && options.scrollElem !== document;
    
    //load more
    var ELEM_TEXT = '<cite>Load More</cite>'
    ,more = $('<div class="layui-flow-more"><a href="javascript:;">'+ ELEM_TEXT +'</a></div>');
    
    if(!elem.find('.layui-flow-more')[0]){
      elem.append(more);
    }
    
    //Load the next element
    var next = function(html, over){ 
      html = $(html);
      more.before(html);
      over = over == 0 ? true : null;
      over ? more.html(end) : more.find('a').html(ELEM_TEXT);
      isOver = over;
      lock = null;
      lazyimg && lazyimg();
    };
    
    //Trigger request
    var done = function(){
      lock = true;
      more.find('a').html(ELEM_LOAD);
      typeof options.done === 'function' && options.done(++page, next);
    };
    
    done();
    
    //Do not automatically scroll loading
    more.find('a').on('click', function(){
      var othis = $(this);
      if(isOver) return;
      lock || done();
    });
    
    //If the image is allowed to be lazy loaded
    if(options.isLazyimg){
      var lazyimg = that.lazyimg({
        elem: options.elem + ' img'
        ,scrollElem: options.scrollElem
      });
    }
    
    if(!isAuto) return that;
    
    scrollElem.on('scroll', function(){
      var othis = $(this), top = othis.scrollTop();
      
      if(timer) clearTimeout(timer);
      if(isOver) return;
      
      timer = setTimeout(function(){
        //Calculate the visible height of the container where the scroll is located
        var height = notDocment ? othis.height() : $(window).height();
        
        //Calculate the actual height of the container where the scroll is located
        var scrollHeight = notDocment
          ? othis.prop('scrollHeight')
        : document.documentElement.scrollHeight;

        //critical point
        if(scrollHeight - top - height <= mb){
          lock || done();
        }
      }, 100);
    });
    return that;
  };
  
  //Picture lazy loading
  Flow.prototype.lazyimg = function(options){
    var that = this, index = 0, haveScroll;
    options = options || {};
    
    var scrollElem = $(options.scrollElem || document); //The element where the scroll bar is located
    var elem = options.elem || 'img';
    
    //Whether the element of the scroll bar is document
    var notDocment = options.scrollElem && options.scrollElem !== document;
    
    //display image
    var show = function(item, height){
      var start = scrollElem.scrollTop(), end = start + height;
      var elemTop = notDocment ? function(){
        return item.offset().top - scrollElem.offset().top + start;
      }() : item.offset().top;

      /* Always load only images that are within the current screen range */
      if(elemTop >= start && elemTop <= end){
        if(!item.attr('src')){
          var src = item.attr('lay-src');
          layui.img(src, function(){
            var next = that.lazyimg.elem.eq(index);
            item.attr('src', src).removeAttr('lay-src');
            
            /* After the current image is loaded, check if the next picture is on the current screen. */
            next[0] && render(next);
            index++;
          });
        }
      }
    }, render = function(othis, scroll){
      
      //Calculate the visible height of the container where the scroll is located
      var height = notDocment ? (scroll||scrollElem).height() : $(window).height();
      var start = scrollElem.scrollTop(), end = start + height;

      that.lazyimg.elem = $(elem);

      if(othis){
        show(othis, height);
      } else {
        //Calculate unloaded images
        for(var i = 0; i < that.lazyimg.elem.length; i++){
          var item = that.lazyimg.elem.eq(i), elemTop = notDocment ? function(){
            return item.offset().top - scrollElem.offset().top + start;
          }() : item.offset().top;
          
          show(item, height);
          index = i;
          
          //If the top coordinate of the image exceeds the current screen, the traversal of subsequent images is terminated.
          if(elemTop > end) break;
        }
      }
    };
    
    render();
    
    if(!haveScroll){
      var timer;
      scrollElem.on('scroll', function(){
        var othis = $(this);
        if(timer) clearTimeout(timer)
        timer = setTimeout(function(){
          render(null, othis);
        }, 50);
      }); 
      haveScroll = true;
    }
    return render;
  };
  
  //Expose interface
  exports('flow', new Flow());
});
