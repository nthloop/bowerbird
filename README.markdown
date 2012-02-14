# Bowerbird

Bowerbird is a Chrome Extension that helps you work with colors on a
webpage. You can see what colors a page uses (and see the CSS behind
them), find unused colors, and even edit colors.

Please report any issues you find at
<https://github.com/nthloop/bowerbird/issues>.

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

## Pending

  * Creating a Safari extension.
  * Sometimes, stylesheets can't be parsed — figure out why, and use
    workarounds.
  * Add a color picker when editing colors.
  * Parse complex CSS values like gradients.

## License

Bowerbird is under an MIT license.

We use some code from Webkit's excellent developer tools, the files are
present un-modified in the vendor directory.

## About Us

Bowerbird is the first app by [nth loop][], a startup by [@Anks][] and
[@xrivatsan][].

  [nth loop]:  http://nthloop.com
  [@Anks]: http://ankitsolanki.com
  [@xrivatsan]: http://xrivatsan.com
