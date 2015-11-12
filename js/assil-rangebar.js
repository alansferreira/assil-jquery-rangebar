/// <reference path="jquery-1.11.3.min.js" />
/// <reference path="jquery-ui.min.js" />
/// <reference path="jquery-collision.js" />

(function ($) {

    $.fn.rangeBar = function(options){
        var opts = $.extend({}, $.fn.rangeBar.defaultOptions, options);

        return this.each(function () {
            var $bar = $(this);
            
            $bar.data("rangebar", opts);
            
            setRanges($bar, opts.ranges);
            
        });

    };

    function setRanges($bar, ranges){
        $bar.each(function () {
            var options = $bar.data("rangebar");
            var totalRange = options.max-options.min;
            
            $.each(ranges, function(i, range){
                
                var $range = $("<div class='range'>").data('range', range);
                //var $leftHandle = $range.append("<div class='range-resize-handle left'>");
                var $labelHandle = $range.append("<div class='range-label'>");
                //var $rightHandle = $range.append("<div class='range-resize-handle right'>");
                
                //$labelHandle.append(JSON.stringify(range));
                
                $bar.append($range);
                
                var point = measureRangeRect(totalRange, $bar.width(), range);
                
                $range.offset({ left: point.left, top: $bar.offset().top });
                $range.width(point.right - point.left);

                syncRange({ target: $range });
                
                if(!range.disabled) {
                    $range.resizable({
                        containment: $bar,
                        handles: "e, w", 
                        resize: range_resize
                    });
                    $range.draggable({
                        containment: $bar,
                        scroll: false, 
                        axis: "x", 
                        handle: '.range-label', 
                        start: range_drag_start,
                        drag: range_drag_drag,
                        stop: range_drag_stop
                    });

                    $range.on('click', range_click);
                }
                
                //$range.offset({})
                
                
            });
        });
    };
    
    function removeRange($bar, range){
        if(!range) return null;
        var $el;
        if(range.start!=null || range.end!=null){

        }else{
            $el = $(range);
        }

        $el.remove();

    };
    function preventCollision_onDragOrResize(event, ui) {
        var $range = $(event.target);
        var $bar = $(event.target).parent();
        var bar_rect = getRect($bar);
        var range_rect = getRect($range);

        //prevents top change to same of bar container
        ui.position.top = ui.originalPosition.top;
        if (ui.offset) ui.offset.top = ui.originalPosition.top;
        
        if (ui.size) {
            if (ui.position.left + ui.size.width > bar_rect.w) {
                ui.size.width = bar_rect.w - ui.position.left;
            }
            ui.position.left = (ui.position.left < 0 ? 0 : ui.position.left);
        }


        var overlaps = $range.overlapsX($range.siblings());

        if (overlaps.length > 0) {
            $.each(overlaps, function () {
                var hint = this;
                var obstacleRect = getRect(hint.obstacle);
                //if contains size parameter this events come from resize
                if (ui.size) {
                    if (hint.overlap.isOverlapLeft) {
                        ui.position.left = obstacleRect.x + obstacleRect.w;
                    } else if (hint.overlap.isOverlapRight) {
                        ui.size.width = obstacleRect.x - range_rect.x;
                    }

                    return true
                }

                if (hint.overlap.isOverlapLeft) {
                    ui.position.left = obstacleRect.x + obstacleRect.w;
                } else if (hint.overlap.isOverlapRight) {
                    ui.position.left = obstacleRect.x - range_rect.w;
                }
            });
            ui.offset = ui.position;
            console.log(JSON.stringify(overlaps));
            return true;
        }

    };
    function range_resize(event, ui) {
        preventCollision_onDragOrResize(event, ui);
        syncRange(event, ui);
    };
    function range_drag_start(event, ui) {
        preventCollision_onDragOrResize(event, ui);
        syncRange(event, ui);
    };
    function range_drag_drag( event, ui ){
        preventCollision_onDragOrResize(event, ui);
        syncRange(event, ui);
    };
    function range_drag_stop( event, ui ){
        preventCollision_onDragOrResize(event, ui);
        syncRange(event, ui);
    };
    function range_click(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        var $el = $(this);
        var $bar = $el.parent();
        var options = $bar.data("rangebar");

        if(ev.which !== 2 || !options.allowDelete) return;

        if($el.data('deleteConfirm')) {
            removeRange($bar, this);
            clearTimeout($el.data('deleteTimeout'));
        } else {
            $el.addClass('delete-confirm');
            $el.data('deleteConfirm', true);

            this.deleteTimeout = setTimeout(function() {
                $el.removeClass('delete-confirm');
                $el.data('deleteConfirm', false);
            }, options.deleteTimeout);
        }
    }
    function range_mousedown(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.hasChanged = false;
        if(ev.which > 1) return;



    }

    function range_mousemove(evt){

    };

    function syncRange(event, ui){
        var $range = $(event.target);
        var $bar = $range.parent();
        var options = $bar.data("rangebar");
        var totalRange = options.max-options.min;
        var parentWidth = $bar.width();
        var left = $range.offset().left;
        var range = {
            start: valueFromPercent(totalRange, percentOf(parentWidth, left)), 
            end: valueFromPercent(totalRange, percentOf(parentWidth, left + $range.width())), 
        };

        //$range.offset({ top: $bar.offset().top });
        $range.height($bar.height());
        $range.data("range", range);
        $(".range-label", $range).text(options.label(range));
        
    }
    function measureRangeRect(totalRange, componentWidth, range){
        return {
            left: valueFromPercent(componentWidth, percentOf(totalRange, range.start)), 
            right: valueFromPercent(componentWidth, percentOf(totalRange, range.end))
        };
    };
    function percentOf(total, value){return (value*100)/total;};
    function valueFromPercent(total, percent){return (total*percent)/100;};




    $.fn.rangeBar.defaultOptions = {
        min: 0, max: 100,
        ranges: [],
        label: function(range){
            return parseInt(range.start) + '-' + parseInt(range.end);
        }, // function to computes label display of range
        allowDelete: true, //indicates if can ranges can be removed
        deleteTimeout: 5000 //Timeout of delete confirmation state
    };
    $.fn.rangeBar.defaultRange = {
            start: 0, end: 0,
            disabled: false,
            css: '',
            canOverlap: false
    };

}(jQuery));

function getRect(obj) {
    var p = $(obj).offset();
    return {
        x: p.left,
        y: p.top,
        w: $(obj).width(),
        h: $(obj).height()
    };
};

(function ($) {
    function isOverlapRect(rect1, rect2) {
        // overlapping indicators, indicate which part of the reference object (Rectangle1) overlap one obstacle.
        var ret = {
            isOverlapRight: (rect1.x + rect1.w > rect2.x && rect1.x < rect2.x),
            isOverlapLeft: (rect1.x < rect2.x + rect2.w && rect1.x > rect2.x),
            isOverlapBottom: (rect1.y + rect1.h > rect2.y && rect1.y < rect2.y),
            isOverlapTop: (rect1.y < rect2.y + rect2.h && rect1.y > rect2.y)
        }; 
        ret.isOverlaped = (ret.isOverlapLeft || ret.isOverlapRight || ret.isOverlapTop || ret.isOverlapBottom);
        return ret;
        //( 
        //    (rect1.x <= rect2.x + rect2.w && rect1.x + rect1.w >= rect2.x) &&
        //    (rect1.y <= rect2.y + rect2.h && rect1.y + rect1.h >= rect2.y)
        //)
    };
    function isOverlapXRect(rect1, rect2) {
        // overlapping indicators, indicate which part of the reference object (Rectangle1) overlap one obstacle.
        var ret = {
            isOverlapRight: (rect1.x + rect1.w > rect2.x && rect1.x < rect2.x),
            isOverlapLeft: (rect1.x < rect2.x + rect2.w && rect1.x > rect2.x)
        }; 
        ret.isOverlaped = (ret.isOverlapLeft || ret.isOverlapRight);
        return ret;
    };
    function isOverlapYRect(rect1, rect2) {
        var ret = {
            isOverlapBottom: (rect1.y + rect1.h > rect2.y && rect1.y < rect2.y),
            isOverlapTop: (rect1.y < rect2.y + rect2.h && rect1.y > rect2.y)
        }; 
        ret.isOverlaped = (ret.isOverlapTop || ret.isOverlapBottom);
        return ret;
    };

    $.fn.overlaps = function (obstacles, func_isOverlapRect) {
        var elems = [];
        var computOverlaps = func_isOverlapRect || isOverlapRect;
        this.each(function () {
            var this_selector = this;
            var $this = $(this_selector);
            var rect1 = getRect(this);
            $(obstacles).each(function () {
                var this_obstacle = this;
                var $obstacle = $(this_obstacle);
                var rect2 = getRect($obstacle);

                var overlap = computOverlaps(rect1, rect2);
                if (overlap.isOverlaped) {
                    elems.push({
                        src: this_selector,
                        obstacle: this_obstacle, 
                        overlap: overlap
                    });
                }
            });
        });

        return elems;
    };
    $.fn.overlapsX = function (obj) {
        return this.overlaps(obj, isOverlapXRect);
    };
    $.fn.overlapsY = function (obj) {
        return this.overlaps(obj, isOverlapYRect);
    };


}(jQuery));
