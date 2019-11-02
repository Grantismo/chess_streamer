# chess_streamer
Chrome extension for replacing chess pieces with images (memes).

Currently supports:
  * lichess.org
  * chess.com

# Chrome Extension
https://chrome.google.com/webstore/detail/chess-streamer/cmkheomdbjliabpcdchpglkgimmaeebc?hl=en&gl=US

# Usage
1. Click on the horse icon at the top of chrome when on a chess website.
1. Define piece replacement rules within the text area (details below).
1. Click Apply. Pieces should be replaced based on your rules. The rules will always be applied when you visit any chess site until you reset or modify the rules.
1. Click 'Reset' to undo your changes.

# Replacement rules

    white king, https://cdn160.picsart.com/upscale-272578841007211.png?r1024x1024
    [match keywords (space separated)], [replacement image url]

Multiple replacment rules can be applied by separating by a newline (hit enter).
Use one or multiple matching keywords (separate by a space) to define a replacement match.

## Match a piece
Match a specific type of piece: king, queen, rook, knight, bishop, pawn

## Match a color
Match a specific color: black, white

Match your color or the oponent's color: us, them (may require a page refresh).

## Example images:
https://docs.google.com/document/d/1ENomG68cuYPbb2zQePWGmXUKZaGpnjiQfBeG5Ve6sOQ/edit?usp=sharing

## blorppppp
I stream sometimes on twitch: https://www.twitch.tv/blorppppp

## License
[MIT][license-url]

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
