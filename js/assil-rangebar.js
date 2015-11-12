/// <reference path="jquery.js" />
/// <reference path="jquery-ui.js" />
/// <reference path="jquery.overlaps.js" />
/// <reference path="linq.min.js" />

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
                
                $range.offset({left: point.left});
                $range.width(point.right - point.left);
                
                if(!range.disabled) {
                    $range.resizable({
                        containment: $bar,
                        handles: "e, w", 
                        resize: function(event, ui ){
                            syncRange(event, ui);
                        }

                    });
                    $range.draggable({
                        containment: $bar,
                        preventCollision: true,
                        obstacle: ".range",
                        scroll: false, 
                        axis: "x", 
                        handle: '.range-label', 
                        start: range_drag_start,
                        drag: range_drag_drag,
                        stop: range_drag_stop
                    })
                    .on('mousedown', range_mousedown)
                    .on('mousemove', range_mousemove)
                    .on('click', range_click);
                }
                
                syncRange({target: $range});
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
    function range_drag_start(event, ui ){
        syncRange(event, ui);
    };
    function range_drag_drag( event, ui ){
        syncRange(event, ui);
    };
    function range_drag_stop( event, ui ){
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

(function ($) {
    function getRect(obj) {
        var p = $(obj).offset();
        return {
            x: p.left,
            y: p.top,
            w: $(obj).width(),
            h: $(obj).height()
        };
    };
    function isOverlapRect(rect1, rect2) {
        return( 
            (rect1.x <= rect2.x + rect2.w && rect1.x + rect1.w >= rect2.x) &&
            (rect1.y <= rect2.y + rect2.h && rect1.y + rect1.h >= rect2.y)
        ); 
    };
    function isOverlapXRect(rect1, rect2) {
        return (rect1.x <= rect2.x + rect2.w && rect1.x + rect1.w >= rect2.x);
    };
    function isOverlapYRect(rect1, rect2) {
        return (rect1.y <= rect2.y + rect2.h && rect1.y + rect1.h >= rect2.y);
    };

    $.fn.overlaps = function (obj) {
        var elems = [];
        var rect1 = getRect(obj);
        this.each(function () {
            var rect2 = getRect(this);
            if (isOverlapRect(rect1, rect2)) {
                elems.push(this);
            }
        });

        return elems;
    };
    $.fn.overlapsX = function (obj) {
        var elems = [];
        var rect1 = getRect(obj);
        this.each(function () {
            var rect2 = getRect(this);
            if (isOverlapXRect(rect1, rect2)) {
                elems.push(this);
            }
        });

        return elems;
    };
    $.fn.overlapsY = function (obj) {
        var elems = [];
        var rect1 = getRect(obj);
        this.each(function () {
            var rect2 = getRect(this);
            if (isOverlapYRect(rect1, rect2)) {
                elems.push(this);
            }
        });

        return elems;
    };


}(jQuery));
