# \<planar-range\>

*\<planar-range\>* is a custom-element akin to HTML's standard input range. Instead of one thumb that moves linearly, this element can have as many thumbs as required, and they move in two dimensions. (*2kb gzipped*)

Each thumb is represented as a *\<planar-range-thumb\>* custom-element and can have an `x` and `y` value. The values are always between `0` and `1`. 
  
![Planar range demo](https://user-images.githubusercontent.com/833927/79674185-71592800-8195-11ea-868f-a340524cda38.gif)

```html
<script type="module" src="......./planar-range.js"></script>

<planar-range>
  <planar-range-thumb x="0.2" y="0.8"></planar-range-thumb>
</planar-range>

```

## Installing 
Available on npm
```
npm install planar-range --save
```

Or source it in your page
```html
<script type="module" src="https://unpkg.com/planar-range@latest"></script>
```

## Styling

The range element and the thumbs can be styled via CSS. The element doesn't need to be square. The values of `x` and `y` (between 0 and 1) interpolate with the width and height.

![Planar range demo](https://user-images.githubusercontent.com/833927/79674189-75854580-8195-11ea-9d45-9cde244d028b.gif)

```html
<style>
  planar-range {
    border: none;
    background: pink;
    width: 500px;
    height: 200px;
  }
  planar-range-thumb {
    width: 20px;
    height: 20px;
    border: none;
  }
  planar-range-thumb[name="p1"] {
    background: red;
  }
  planar-range-thumb[name="p3"] {
    background: blue;
  }
</style>

<planar-range>
  <planar-range-thumb name="p1" x="0" y="0"></planar-range-thumb>
  <planar-range-thumb name="p2" x="0.2" y="0.2"></planar-range-thumb>
  <planar-range-thumb name="p3" x="0.8" y="0.8"></planar-range-thumb>
</planar-range>
```

## Uses

## Events

Each thumb fires a `change` event. The `event.detail` object gives the `x`, `y` value of the thumb and its `name` attribute. 

```html
<planar-range>
  <planar-range-thumb name="p1" x="0" y="0"></planar-range-thumb>
  <planar-range-thumb name="p2" x="0.2" y="0.2"></planar-range-thumb>
</planar-range>

<script>
  // attach to range element
  document.querySelector('planar-range')
    .addEventListener('change', ({ detail }) => {
      console.log(detail.x, detail.y, detail.name);
      // 0.2 0.2 p2
    });
  
  // Or attach to individual thumb
  document.querySelector('#p2')
    .addEventListener('change', ({ detail }) => {
      console.log(detail.x, detail.y, detail.name);
      // 0.2 0.2 p2
    });
</script>
```

## PlanarRangeThumb *\<planar-range-thumb\>* properties

**x**: The numeric `x` value of the thumb. The range is between `[0, 1]`. 

**y**: The numeric `y` value of the thumb. The range is between `[0, 1]`. 

**value**: A 2D array of `[x, y]` value. e.g. `thumb.value = [0.2, 0.6];`

## PlanarRange *\<planar-range\>*  properties

**values**: Readonly property to get the values of all the thumbs in the range. An array of Objects. Each object has the `x`, `y` value of the thumb, and its `name` attribute.
