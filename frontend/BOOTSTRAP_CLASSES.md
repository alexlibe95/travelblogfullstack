# Bootstrap 5 Utility Classes Reference

Complete guide to all Bootstrap 5 utility classes available in this project.

## Table of Contents
1. [Typography](#typography)
2. [Colors](#colors)
3. [Spacing](#spacing)
4. [Sizing](#sizing)
5. [Display](#display)
6. [Flexbox](#flexbox)
7. [Grid](#grid)
8. [Position](#position)
9. [Borders](#borders)
10. [Shadows](#shadows)
11. [Opacity](#opacity)
12. [Overflow](#overflow)
13. [Text Utilities](#text-utilities)
14. [Vertical Alignment](#vertical-alignment)
15. [Visibility](#visibility)
16. [Object Fit](#object-fit)

---

## Typography

### Text Sizing
```html
<p class="fs-1">Font size 1 (2.5rem)</p>
<p class="fs-2">Font size 2 (2rem)</p>
<p class="fs-3">Font size 3 (1.75rem)</p>
<p class="fs-4">Font size 4 (1.5rem)</p>
<p class="fs-5">Font size 5 (1.25rem)</p>
<p class="fs-6">Font size 6 (1rem)</p>
```

### Font Weight
```html
<p class="fw-bold">Bold text</p>
<p class="fw-bolder">Bolder text</p>
<p class="fw-normal">Normal weight</p>
<p class="fw-light">Light weight</p>
<p class="fw-lighter">Lighter weight</p>
```

### Font Style
```html
<p class="fst-italic">Italic text</p>
<p class="fst-normal">Normal style</p>
```

### Text Alignment
```html
<p class="text-start">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-end">Right aligned</p>
```

### Text Transform
```html
<p class="text-lowercase">LOWERCASE TEXT</p>
<p class="text-uppercase">uppercase text</p>
<p class="text-capitalize">capitalize text</p>
```

### Text Decoration
```html
<p class="text-decoration-underline">Underlined</p>
<p class="text-decoration-line-through">Strikethrough</p>
<p class="text-decoration-none">No decoration</p>
```

### Line Height
```html
<p class="lh-1">Line height 1</p>
<p class="lh-sm">Small line height</p>
<p class="lh-base">Base line height</p>
<p class="lh-lg">Large line height</p>
```

---

## Colors

### Text Colors
```html
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-success">Success text</p>
<p class="text-danger">Danger text</p>
<p class="text-warning">Warning text</p>
<p class="text-info">Info text</p>
<p class="text-light">Light text</p>
<p class="text-dark">Dark text</p>
<p class="text-body">Body text</p>
<p class="text-muted">Muted text</p>
<p class="text-white">White text</p>
<p class="text-black-50">50% black</p>
<p class="text-white-50">50% white</p>
```

### Background Colors
```html
<div class="bg-primary">Primary background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-success">Success background</div>
<div class="bg-danger">Danger background</div>
<div class="bg-warning">Warning background</div>
<div class="bg-info">Info background</div>
<div class="bg-light">Light background</div>
<div class="bg-dark">Dark background</div>
<div class="bg-white">White background</div>
<div class="bg-transparent">Transparent background</div>
```

### Background Gradient
```html
<div class="bg-primary bg-gradient">Gradient primary</div>
```

---

## Spacing

### Margin
```html
<!-- All sides -->
<div class="m-0">margin: 0</div>
<div class="m-1">margin: 0.25rem</div>
<div class="m-2">margin: 0.5rem</div>
<div class="m-3">margin: 1rem</div>
<div class="m-4">margin: 1.5rem</div>
<div class="m-5">margin: 3rem</div>
<div class="m-auto">margin: auto</div>

<!-- Top -->
<div class="mt-0">margin-top</div>
<div class="mt-1">margin-top: 0.25rem</div>
<div class="mt-2">margin-top: 0.5rem</div>
<div class="mt-3">margin-top: 1rem</div>
<div class="mt-4">margin-top: 1.5rem</div>
<div class="mt-5">margin-top: 3rem</div>
<div class="mt-auto">margin-top: auto</div>

<!-- Bottom -->
<div class="mb-0">margin-bottom</div>
<div class="mb-1">margin-bottom: 0.25rem</div>
<div class="mb-2">margin-bottom: 0.5rem</div>
<div class="mb-3">margin-bottom: 1rem</div>
<div class="mb-4">margin-bottom: 1.5rem</div>
<div class="mb-5">margin-bottom: 3rem</div>
<div class="mb-auto">margin-bottom: auto</div>

<!-- Start (left in LTR) -->
<div class="ms-0">margin-start</div>
<div class="ms-1">margin-start: 0.25rem</div>
<div class="ms-2">margin-start: 0.5rem</div>
<div class="ms-3">margin-start: 1rem</div>
<div class="ms-4">margin-start: 1.5rem</div>
<div class="ms-5">margin-start: 3rem</div>
<div class="ms-auto">margin-start: auto</div>

<!-- End (right in LTR) -->
<div class="me-0">margin-end</div>
<div class="me-1">margin-end: 0.25rem</div>
<div class="me-2">margin-end: 0.5rem</div>
<div class="me-3">margin-end: 1rem</div>
<div class="me-4">margin-end: 1.5rem</div>
<div class="me-5">margin-end: 3rem</div>
<div class="me-auto">margin-end: auto</div>

<!-- Horizontal (left & right) -->
<div class="mx-0">margin-x</div>
<div class="mx-1">margin-x: 0.25rem</div>
<div class="mx-2">margin-x: 0.5rem</div>
<div class="mx-3">margin-x: 1rem</div>
<div class="mx-4">margin-x: 1.5rem</div>
<div class="mx-5">margin-x: 3rem</div>
<div class="mx-auto">margin-x: auto</div>

<!-- Vertical (top & bottom) -->
<div class="my-0">margin-y</div>
<div class="my-1">margin-y: 0.25rem</div>
<div class="my-2">margin-y: 0.5rem</div>
<div class="my-3">margin-y: 1rem</div>
<div class="my-4">margin-y: 1.5rem</div>
<div class="my-5">margin-y: 3rem</div>
<div class="my-auto">margin-y: auto</div>
```

### Padding
```html
<!-- All sides -->
<div class="p-0">padding: 0</div>
<div class="p-1">padding: 0.25rem</div>
<div class="p-2">padding: 0.5rem</div>
<div class="p-3">padding: 1rem</div>
<div class="p-4">padding: 1.5rem</div>
<div class="p-5">padding: 3rem</div>

<!-- Top -->
<div class="pt-0">padding-top</div>
<div class="pt-1">padding-top: 0.25rem</div>
<div class="pt-2">padding-top: 0.5rem</div>
<div class="pt-3">padding-top: 1rem</div>
<div class="pt-4">padding-top: 1.5rem</div>
<div class="pt-5">padding-top: 3rem</div>

<!-- Bottom -->
<div class="pb-0">padding-bottom</div>
<div class="pb-1">padding-bottom: 0.25rem</div>
<div class="pb-2">padding-bottom: 0.5rem</div>
<div class="pb-3">padding-bottom: 1rem</div>
<div class="pb-4">padding-bottom: 1.5rem</div>
<div class="pb-5">padding-bottom: 3rem</div>

<!-- Start (left in LTR) -->
<div class="ps-0">padding-start</div>
<div class="ps-1">padding-start: 0.25rem</div>
<div class="ps-2">padding-start: 0.5rem</div>
<div class="ps-3">padding-start: 1rem</div>
<div class="ps-4">padding-start: 1.5rem</div>
<div class="ps-5">padding-start: 3rem</div>

<!-- End (right in LTR) -->
<div class="pe-0">padding-end</div>
<div class="pe-1">padding-end: 0.25rem</div>
<div class="pe-2">padding-end: 0.5rem</div>
<div class="pe-3">padding-end: 1rem</div>
<div class="pe-4">padding-end: 1.5rem</div>
<div class="pe-5">padding-end: 3rem</div>

<!-- Horizontal (left & right) -->
<div class="px-0">padding-x</div>
<div class="px-1">padding-x: 0.25rem</div>
<div class="px-2">padding-x: 0.5rem</div>
<div class="px-3">padding-x: 1rem</div>
<div class="px-4">padding-x: 1.5rem</div>
<div class="px-5">padding-x: 3rem</div>

<!-- Vertical (top & bottom) -->
<div class="py-0">padding-y</div>
<div class="py-1">padding-y: 0.25rem</div>
<div class="py-2">padding-y: 0.5rem</div>
<div class="py-3">padding-y: 1rem</div>
<div class="py-4">padding-y: 1.5rem</div>
<div class="py-5">padding-y: 3rem</div>
```

**Spacing Scale:**
- `0` = 0
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `3` = 1rem (16px)
- `4` = 1.5rem (24px)
- `5` = 3rem (48px)

---

## Sizing

### Width
```html
<div class="w-25">Width 25%</div>
<div class="w-50">Width 50%</div>
<div class="w-75">Width 75%</div>
<div class="w-100">Width 100%</div>
<div class="w-auto">Width auto</div>
```

### Height
```html
<div class="h-25">Height 25%</div>
<div class="h-50">Height 50%</div>
<div class="h-75">Height 75%</div>
<div class="h-100">Height 100%</div>
<div class="h-auto">Height auto</div>
```

### Max Width/Height
```html
<div class="mw-100">Max width 100%</div>
<div class="mh-100">Max height 100%</div>
```

### Viewport Width/Height
```html
<div class="vw-100">Viewport width 100%</div>
<div class="vh-100">Viewport height 100%</div>
<div class="min-vw-100">Min viewport width 100%</div>
<div class="min-vh-100">Min viewport height 100%</div>
```

---

## Display

```html
<div class="d-none">Display none</div>
<div class="d-inline">Display inline</div>
<div class="d-inline-block">Display inline-block</div>
<div class="d-block">Display block</div>
<div class="d-grid">Display grid</div>
<div class="d-table">Display table</div>
<div class="d-table-row">Display table-row</div>
<div class="d-table-cell">Display table-cell</div>
<div class="d-flex">Display flex</div>
<div class="d-inline-flex">Display inline-flex</div>
```

### Responsive Display
```html
<!-- Hide on small screens, show on md+ -->
<div class="d-none d-md-block">Hidden on mobile, visible on md+</div>

<!-- Show on small screens, hide on md+ -->
<div class="d-block d-md-none">Visible on mobile, hidden on md+</div>
```

**Breakpoints:** `sm`, `md`, `lg`, `xl`, `xxl`

---

## Flexbox

### Flex Direction
```html
<div class="flex-row">Row (default)</div>
<div class="flex-row-reverse">Row reverse</div>
<div class="flex-column">Column</div>
<div class="flex-column-reverse">Column reverse</div>
```

### Flex Wrap
```html
<div class="flex-wrap">Wrap</div>
<div class="flex-nowrap">No wrap</div>
<div class="flex-wrap-reverse">Wrap reverse</div>
```

### Justify Content
```html
<div class="justify-content-start">Start</div>
<div class="justify-content-end">End</div>
<div class="justify-content-center">Center</div>
<div class="justify-content-between">Space between</div>
<div class="justify-content-around">Space around</div>
<div class="justify-content-evenly">Space evenly</div>
```

### Align Items
```html
<div class="align-items-start">Start</div>
<div class="align-items-end">End</div>
<div class="align-items-center">Center</div>
<div class="align-items-baseline">Baseline</div>
<div class="align-items-stretch">Stretch</div>
```

### Align Self
```html
<div class="align-self-start">Start</div>
<div class="align-self-end">End</div>
<div class="align-self-center">Center</div>
<div class="align-self-baseline">Baseline</div>
<div class="align-self-stretch">Stretch</div>
```

### Flex Fill
```html
<div class="flex-fill">Fill available space</div>
<div class="flex-grow-1">Grow</div>
<div class="flex-shrink-1">Shrink</div>
```

### Gap
```html
<div class="gap-0">Gap 0</div>
<div class="gap-1">Gap 0.25rem</div>
<div class="gap-2">Gap 0.5rem</div>
<div class="gap-3">Gap 1rem</div>
<div class="gap-4">Gap 1.5rem</div>
<div class="gap-5">Gap 3rem</div>
```

---

## Grid

### Grid Columns
```html
<div class="row">
  <div class="col">Auto column</div>
  <div class="col-1">1 column</div>
  <div class="col-2">2 columns</div>
  <div class="col-3">3 columns</div>
  <div class="col-4">4 columns</div>
  <div class="col-5">5 columns</div>
  <div class="col-6">6 columns</div>
  <div class="col-7">7 columns</div>
  <div class="col-8">8 columns</div>
  <div class="col-9">9 columns</div>
  <div class="col-10">10 columns</div>
  <div class="col-11">11 columns</div>
  <div class="col-12">12 columns</div>
</div>
```

### Responsive Grid
```html
<div class="row">
  <div class="col-md-6 col-lg-4">Responsive column</div>
</div>
```

### Offset
```html
<div class="offset-1">Offset 1</div>
<div class="offset-2">Offset 2</div>
<div class="offset-md-3">Offset 3 on md+</div>
```

---

## Position

```html
<div class="position-static">Static</div>
<div class="position-relative">Relative</div>
<div class="position-absolute">Absolute</div>
<div class="position-fixed">Fixed</div>
<div class="position-sticky">Sticky</div>
```

### Position Values
```html
<div class="top-0">Top 0</div>
<div class="top-50">Top 50%</div>
<div class="top-100">Top 100%</div>
<div class="bottom-0">Bottom 0</div>
<div class="start-0">Start 0</div>
<div class="end-0">End 0</div>
```

### Translate
```html
<div class="translate-middle">Translate middle</div>
<div class="translate-middle-x">Translate middle X</div>
<div class="translate-middle-y">Translate middle Y</div>
```

---

## Borders

### Border
```html
<div class="border">Border all sides</div>
<div class="border-top">Border top</div>
<div class="border-end">Border end</div>
<div class="border-bottom">Border bottom</div>
<div class="border-start">Border start</div>
```

### Border Width
```html
<div class="border-0">No border</div>
<div class="border-1">Border width 1</div>
<div class="border-2">Border width 2</div>
<div class="border-3">Border width 3</div>
<div class="border-4">Border width 4</div>
<div class="border-5">Border width 5</div>
```

### Border Color
```html
<div class="border-primary">Primary border</div>
<div class="border-secondary">Secondary border</div>
<div class="border-success">Success border</div>
<div class="border-danger">Danger border</div>
<div class="border-warning">Warning border</div>
<div class="border-info">Info border</div>
<div class="border-light">Light border</div>
<div class="border-dark">Dark border</div>
<div class="border-white">White border</div>
```

### Border Radius
```html
<div class="rounded">Rounded</div>
<div class="rounded-0">No radius</div>
<div class="rounded-1">Small radius</div>
<div class="rounded-2">Medium radius</div>
<div class="rounded-3">Large radius</div>
<div class="rounded-circle">Circle</div>
<div class="rounded-pill">Pill shape</div>
<div class="rounded-top">Top rounded</div>
<div class="rounded-end">End rounded</div>
<div class="rounded-bottom">Bottom rounded</div>
<div class="rounded-start">Start rounded</div>
```

---

## Shadows

```html
<div class="shadow-none">No shadow</div>
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-lg">Large shadow</div>
```

---

## Opacity

```html
<div class="opacity-0">0% opacity</div>
<div class="opacity-25">25% opacity</div>
<div class="opacity-50">50% opacity</div>
<div class="opacity-75">75% opacity</div>
<div class="opacity-100">100% opacity</div>
```

---

## Overflow

```html
<div class="overflow-auto">Auto overflow</div>
<div class="overflow-hidden">Hidden overflow</div>
<div class="overflow-visible">Visible overflow</div>
<div class="overflow-scroll">Scroll overflow</div>
```

---

## Text Utilities

### Text Wrapping
```html
<div class="text-wrap">Wrap text</div>
<div class="text-nowrap">No wrap</div>
<div class="text-break">Break text</div>
```

### Word Break
```html
<div class="text-break">Break words</div>
```

### Text Truncate
```html
<div class="text-truncate">Truncate with ellipsis</div>
```

---

## Vertical Alignment

```html
<span class="align-baseline">Baseline</span>
<span class="align-top">Top</span>
<span class="align-middle">Middle</span>
<span class="align-bottom">Bottom</span>
<span class="align-text-top">Text top</span>
<span class="align-text-bottom">Text bottom</span>
```

---

## Visibility

```html
<div class="visible">Visible</div>
<div class="invisible">Invisible (but takes space)</div>
```

---

## Object Fit

```html
<img class="object-fit-contain">Contain</img>
<img class="object-fit-cover">Cover</img>
<img class="object-fit-fill">Fill</img>
<img class="object-fit-none">None</img>
<img class="object-fit-scale-down">Scale down</img>
```

---

## Common Combinations

### Centered Container
```html
<div class="container">
  <div class="row">
    <div class="col-md-8 mx-auto">
      Centered content
    </div>
  </div>
</div>
```

### Full Width Section
```html
<div class="w-100 vh-100">
  Full viewport section
</div>
```

### Flexbox Centering
```html
<div class="d-flex justify-content-center align-items-center vh-100">
  Centered content
</div>
```

### Responsive Text
```html
<h1 class="fs-1 fs-md-2 fs-lg-3">Responsive heading</h1>
```

### Card with Shadow
```html
<div class="card shadow">
  <div class="card-body">
    Card content
  </div>
</div>
```

---

## Quick Reference

### Most Used Classes
- **Spacing:** `m-*`, `p-*`, `mt-*`, `mb-*`, `mx-*`, `my-*`
- **Sizing:** `w-100`, `h-100`, `vw-100`, `vh-100`
- **Display:** `d-flex`, `d-block`, `d-none`
- **Flexbox:** `justify-content-center`, `align-items-center`, `flex-column`
- **Colors:** `bg-primary`, `text-primary`, `bg-dark`, `text-white`
- **Text:** `text-center`, `fs-*`, `fw-bold`
- **Borders:** `border`, `rounded`, `shadow`
- **Position:** `position-relative`, `position-absolute`, `top-0`, `start-0`

---

**Note:** All classes support responsive breakpoints: `sm`, `md`, `lg`, `xl`, `xxl`

Example: `d-none d-md-block` (hidden on mobile, visible on md+)
