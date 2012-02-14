# Bowerbird

Bowerbird helps you work with colors on a webpage. You can see what
colors a page uses (and see the CSS behind them), find unused colors,
and even edit colors.

## How it works

We grab colors from two different places:

  * The `document.styleSheets` API is used (when available) to go
    through all CSS rules present and extract colors mentioned. This
    gives us a list of colors mentioned in stylesheets, some of which
    may not even be present on the page.

    There are a few restrictions to this API, though. It is not
    available for `file:///` URLs, and sometimes fails for stylesheets
    loaded from a third-party URL.

  * We also iterate over each element on the page and use
    `getComputedStyle` in order to get all the colors _currently
    present_ on the page.

## Limitations / TODOs

  * Sometimes, stylesheets can't be parsed.
  * Pending: add a color picker when editing colors.
  * We grab colors used for background, text and borders. Some colors
    may be missed, and complex CSS values like gradients aren't parsed.
  * Finally, Bowerbird does not look at image data.

## Help required

We aren't really sure about the right way to sort colors when presenting
them to the user. Any pointers for this issue are welcome :)

## License

Bowerbird is under an MIT license.

We use some code from Webkit's excellent developer tools, the files are
present un-modified in the vendor directory.
