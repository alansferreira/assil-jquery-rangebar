
(function ($) {

    $.fn.rangeBar = function(options){
        var opts = $.extend({}, $.fn.rangeBar.defaultOptions, options);

        return this.each(function () {
            var $bar = $(this).append("<div>  </div>");
            
            $bar.data("rangebar", opts);
            
            $.fn.rangeBar.setRanges($bar, opts.ranges);
            
        });

    };
    $.fn.rangeBar.setRanges = function($bar, ranges){
        $bar.each(function () {
            $.each(ranges, function(i, range){
                
                var $range = $("<div class='range'>").data('range', range);
                var $leftHandle = $range.append("<div class='range-resize-handle left'>");
                var $labelHandle = $range.append("<div class='range-label'>"+JSON.stringify(range)+"</div>");
                var $rightHandle = $range.append("<div class='range-resize-handle right'>");
                
                //$labelHandle.append(JSON.stringify(range));
                
                $bar.append($range);
                
                if(!range.disabled) {
                    $range.resizable({
                        containment: $bar,
                        handles: "e, w", 

                    });
                    $range.draggable({
                        containment: $bar, 
                        scroll: false, 
                        axis: "x", 
                        handle: '.range-label'
                    });
                    
                }
                
                //$range.offset({})
                
                
            });
        });
    };
    
    
    $.fn.rangeBar.defaultOptions = {

    };


    $.fn.rangeBar.defaultOptions = {
        ranges: [{
            start: 0, end: 0, 
            disabled: false, 
            css: '', 
            
        }]

    };
}(jQuery));
