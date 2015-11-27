# assil-jquery-rangebar

#Getting Started
```html
<script src="js/jquery.resize.js"></script>
<link rel="stylesheet" type="text/css" href="css/assil-rangebar.css">
<script src="js/assil-rangebar.js"></script>
```

```javascript
var range_label = function ($el, range) {
    if (range.canOverlap) return "can Over: in:" + parseInt(range.start) + '-' + parseInt(range.end);

    return "can´t Over: in:" + parseInt(range.start) + '-' + parseInt(range.end);
};
$(".range-bar").rangebar({
    label: range_label,
    ranges:[
        {
            id: "left", start: 1, end: 4,

            css: { range: 'bg-success' }
        },
        { id: "disabled", start: 30, end: 50, disabled: true },
        { id: "right", start: 55, end: 70, css: { range: 'custom-range-orange' }, canOverlap: true, allowDelete: false }
    ],
    renderRange: function ($range, range) {
        $range.tooltip({ title: range_label($range, range) });
    },
    updateRange: function ($range, range) {
        $range.attr("title", range_label($range, range)).tooltip('fixTitle');
    }
}).on("change", function (event, ui, $bar, $range) {
    $(".change").text(JSON.stringify($(event.target).rangebar('getRanges', {})));
});
});
```
