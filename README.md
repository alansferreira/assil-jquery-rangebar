# assil-jquery-rangebar

#Getting Started
```html
<link rel="stylesheet" type="text/css" href="css/assil-rangebar.css">
<script src="js/assil-rangebar.js"></script>
```

```javascript
$(".range-bar").rangeBar({
    label: function ($el, range) {
        if (range.canOverlap) return "can Over: in:" + parseInt(range.start) + '-' + parseInt(range.end);
        return "can´t Over: in:" + parseInt(range.start) + '-' + parseInt(range.end);
    },
    ranges:[
        { id: "myCustomId1", start: 1, end: 4, },
        { id: "myCustomId2", start: 8, end: 15, },
        { id: "myCustomId3", start: 30, end: 50, disabled: true },
        { id: "myCustomId4", start: 55, end: 70, css: 'custom-range-orange', canOverlap: true }
    ]
});
```
