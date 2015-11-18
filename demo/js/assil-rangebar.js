/// <reference path="jquery-1.11.3.min.js" />
/// <reference path="jquery-ui.min.js" />
/// <reference path="assil-rangebar.js" />
/**
    events: 
            @param event inherits event from event signature of draggable:drag/resizable:resize
            @param ui inherits ui from ui signature of draggable:drag/resizable:resize
            @param hint overlap params
            @param $bar source bar element
            @param $range source range element overlaping
            @param $obstacle ovelaped object
            function overlap(event, ui, hint, $bar, $range, $obstacle)

            @param event inherits event from event signature of draggable:drag/resizable:resize
            @param ui inherits ui from ui signature of draggable:drag/resizable:resize
            @param $bar source bar element
            @param $range source range element overlaping
            function change(event, ui, $bar, $range)

*/

(function ($) {
    $.widget("assil.rangebar", {
        options: {
            defaultRange: {
                start: 3, end: 9,
                disabled: false,
                css: '',
                canOverlap: false
            },
            min: 0, max: 100,
            ranges: [],
            label: function (range) {
                return parseInt(range.start) + '-' + parseInt(range.end);
            }, // function to computes label display of range
            allowDelete: true, //indicates if can ranges can be removed
            deleteTimeout: 3000
        },
        _create: function () {
            this.element.addClass("range-bar").disableSelection();

            this.setRanges(this.options.ranges);
            //this.element.data("rangebar", this.options);
        },
        _destroy: function () { },
        addRange: function (range) {

            var options = this.options;
            range = $.fn.extend({}, options.defaultRange, range);

            var totalRange = options.max - options.min;

            var $range = $("<div class='range'>").data('range', range);
            var $labelHandle = $range.append("<div class='range-label'>&nbsp;</div>");

            this.element.append($range);

            var point = measureRangeRect(totalRange, this.element.width(), range);

            $range.offset({ left: point.left, top: this.element.offset().top });
            $range.width(point.right - point.left);
            $range.height(this.element.height());

            if (range.css) $range.addClass(range.css);

            syncRange({ target: $range });

            if (range.disabled) {
                $range.addClass("disabled");
                return true;
            }

            $range.resizable({
                containment: this.element,
                handles: "e, w",
                resize: range_resize
            });
            $range.draggable({
                containment: this.element,
                scroll: false,
                axis: "x",
                handle: '.range-label',
                start: range_drag_start,
                drag: range_drag_drag,
                stop: range_drag_stop
            });

            $range.on('click', range_click);

            return $range;
        },
        removeRange: function (rangeId) {
            var $ranges = this.element.chiden();
            $ranges.each(function () {
                var $range = $(this);
                var range = $range.data("range");

                if (range.id != rangeId) return true;

                $el.remove();
                return false;
            });
        },
        setRanges: function (ranges) {
            var _bar = this;
            $(_bar.element.children()).remove();
            $.each(ranges, function () {
                _bar.addRange(this);
            });
        }


    });






    function preventCollision_onDragOrResize(event, ui) {

        var $range = $(event.target);
        var range = $range.data("range");
        var $bar = $(event.target).parent();
        var bar_rect = getRect($bar);
        var range_rect = getRect($range);


        var last_ui_position = $range.data("ui-position") || ui.position;
        
        var current_mouse_offset = { x: ui.position.left - last_ui_position.left, y: ui.position.top - last_ui_position.top };

        console.log("input ui.position:" + JSON.stringify(ui.position));
        console.log("input mouseOffset:" + JSON.stringify(current_mouse_offset));

        if (ui.size) {
            //come from resizable event
            range_rect.w = ui.size.width + current_mouse_offset.x;
            if (ui.position.left + ui.size.width > bar_rect.w) {
                ui.size.width = bar_rect.w - ui.position.left;
            }
            ui.position.left = (ui.position.left < 0 ? 0 : ui.position.left);

        } else {
            //come from draggable event
            range_rect.x = ui.position.left + current_mouse_offset.x;

        }

        console.log("   range position:" + JSON.stringify(range_rect));


        var overlaps = $(range_rect).overlapsX($range.siblings());

        if (overlaps.length > 0 && range.canOverlap) {
            $range.addClass("overlaped");
        } else if (overlaps.length == 0 && range.canOverlap) {
            $range.removeClass("overlaped");
        }

        if (overlaps.length > 0 && !range.canOverlap) {
            $.each(overlaps, function () {
                //var hint = overlaps[0];
                var hint = this;
                var $obstacle = $(hint.obstacle);
                var obstacle_range = $obstacle.data("range");
                if (obstacle_range.canOverlap) {
                    $obstacle.addClass("overlaped");
                    return true;
                }

                $bar.trigger("overlap", [event, ui, hint, $bar, $range, hint.obstacle]);

                var obstacleRect = getRect(hint.obstacle);
                console.log("    obstacle rect:" + JSON.stringify(obstacleRect));

                if (ui.size) {
                    //come from resizable event
                    if (hint.overlap.isOverlapLeft) {
                        ui.position.left = obstacleRect.x + obstacleRect.w;
                        ui.size.width = (ui.originalPosition.left + ui.originalSize.width) - ui.position.left;
                    } else if (hint.overlap.isOverlapRight) {
                        ui.size.width = obstacleRect.x - (range_rect.x);
                    }
                    return true;
                }

                //come from draggable event
                if (hint.overlap.isOverlapLeft) {
                    ui.position.left = obstacleRect.x + obstacleRect.w;
                } else if (hint.overlap.isOverlapRight) {
                    ui.position.left = obstacleRect.x - (range_rect.w );
                }

            });

            ////checks whether the piece is still overlapped
            //range_rect.x = ui.position.left + current_mouse_offset.x;
            //if (ui.size) range_rect.w = ui.size.width;

            //var overlaps = $(range_rect).overlapsX($range.siblings());
            //if (overlaps.length > 0) {
            //    ui.position.left = $range.offset().left;
            //    if (ui.size) ui.size.width = $range.width();
            //}

            $bar.trigger("change", [event, ui, $bar, $range]);

            console.log("      source rect:" + JSON.stringify(range_rect));
        }

        console.log("result          :" + JSON.stringify(ui.position));
    };
    function range_resize(event, ui) {
        preventCollision_onDragOrResize(event, ui);
        syncRange(event, ui);
    };
    function range_drag_start(event, ui) {
        syncRange(event, ui);
        $(event.target).addClass("dragging");
    };
    function range_drag_drag( event, ui ){
        preventCollision_onDragOrResize(event, ui);
        syncRange(event, ui);
    };
    function range_drag_stop( event, ui ){
        syncRange(event, ui);
        $(event.target).removeClass("dragging");
    };
    function range_click(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        var $range = $(this);
        var $bar = $range.parent();
        var options = $bar.data("rangebar");

        if (ev.which !== 2 || !options.allowDelete) return;

        if ($range.data('deleteConfirm')) {
            $bar.removeRange($range.data("range").id);
            clearTimeout($el.data('deleteTimeout'));
        } else {
            $range.addClass('delete-confirm');
            $range.data('deleteConfirm', true);

            this.deleteTimeout = setTimeout(function () {
                $range.removeClass('delete-confirm');
                $range.data('deleteConfirm', false);
            }, options.deleteTimeout);
        }
    };

    function syncRange(event, ui) {
        var $range = $(event.target);
        var range = $range.data("range");
        var $bar = $range.parent();
        var options = $bar.data("assilRangebar").options;
        var totalRange = options.max-options.min;
        var parentWidth = $bar.width();
        var left = (ui ? ui.position.left : $range.offset().left);

        range = $.fn.extend(range, {
            start: valueFromPercent(totalRange, percentOf(parentWidth, left)), 
            end: valueFromPercent(totalRange, percentOf(parentWidth, left + (ui && ui.size ? ui.size.width : $range.width()))), 
        });

        //$range.offset({ top: $bar.offset().top });
        $range.height($bar.height());
        $range.data("range", range);
        $(".range-label", $range).text(options.label($range, range));
        
    }
    function measureRangeRect(totalRange, componentWidth, range){
        return {
            left: valueFromPercent(componentWidth, percentOf(totalRange, range.start)), 
            right: valueFromPercent(componentWidth, percentOf(totalRange, range.end))
        };
    };
    function percentOf(total, value){return (value*100)/total;};
    function valueFromPercent(total, percent){return (total*percent)/100;};

}(jQuery));

function getRect(obj) {
    if (!obj) return obj;
    if (obj.x && obj.y && obj.w && obj.h) return obj;


    var p = $(obj).offset();
    return {
        x: p.left,
        y: p.top,
        w: $(obj).width(),
        h: $(obj).height()
    };
};
function isOverlapRect(rect1, rect2) {
    // overlapping indicators, indicate which part of the reference object (Rectangle1) overlap one obstacle.
    var ret = {
        isOverlapRight: (rect1.x + rect1.w >= rect2.x && rect1.x <= rect2.x),
        isOverlapLeft: (rect1.x <= rect2.x + rect2.w && rect1.x >= rect2.x),
        isOverlapBottom: (rect1.y + rect1.h > rect2.y && rect1.y <= rect2.y),
        isOverlapTop: (rect1.y <= rect2.y + rect2.h && rect1.y >= rect2.y)
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
        isOverlapRight: (rect1.x + rect1.w >= rect2.x && rect1.x <= rect2.x),
        isOverlapLeft: (rect1.x <= rect2.x + rect2.w && rect1.x >= rect2.x)
    }; 
    ret.isOverlaped = (ret.isOverlapLeft || ret.isOverlapRight);
    return ret;
};
function isOverlapYRect(rect1, rect2) {
    var ret = {
        isOverlapBottom: (rect1.y + rect1.h >= rect2.y && rect1.y <= rect2.y),
        isOverlapTop: (rect1.y <= rect2.y + rect2.h && rect1.y >= rect2.y)
    }; 
    ret.isOverlaped = (ret.isOverlapTop || ret.isOverlapBottom);
    return ret;
};

(function ($) {

    $.fn.measureRects = function () {
        var rects = [];
        this.each(function () {
            rects.push(getRect(this));
        });
        return rects;
    };

    /**
     * checks if selector ui elements overlaps over any rectangle passed in parameter
     * @param rects type="[{x: 0, y:0, w:0, h:0}]" is an array of rectangles</param>
     * @param func_isOverlapRect It is the function that will calculate a rectangle collides with another and returning a {isOverlaped: true / false} if not mSQL value defaults to 'isOverlapRect'
     */
    $.fn.pointOverlaps = function (rects, func_isOverlapRect) {
        
        var elems = [];
        var computOverlaps = func_isOverlapRect || isOverlapRect;
        this.each(function () {
            var this_selector = this;
            var $this = $(this_selector);
            var rect1 = getRect(this);
            
            $.each(rects, function () {
                var this_obstacle = this;
                var rect2 = getRect(this_obstacle);

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
    $.fn.pointOverlapsX = function (rects) {
        return this.pointOverlaps(rects, isOverlapXRect);
    };
    $.fn.pointOverlapsY = function (rects) {
        return this.pointOverlaps(rects, isOverlapYRect);
    };

    /**
     * checks if selector ui elements overlaps over any other ui elements
     * @param obstacles is an array of DOM or JQuery selector \r
     * @param func_isOverlapRect It is the function that will calculate a rectangle collides with another and returning a {isOverlaped: true / false} if not mSQL value defaults to 'isOverlapRect'
     */
    $.fn.overlaps = function (obstacles, func_isOverlapRect) {
        try {
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

        } catch (e) {
            console.log(e);
        }
    };
    $.fn.overlapsX = function (obj) {
        return this.overlaps(obj, isOverlapXRect);
    };
    $.fn.overlapsY = function (obj) {
        return this.overlaps(obj, isOverlapYRect);
    };


}(jQuery));