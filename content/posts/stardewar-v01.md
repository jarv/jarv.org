+++
title = "A Trade Wars 2002 inspired pocket game" 
date = "2025-05-26"
slug = "stardewar-v01"
tags = ["stardewar"]
+++

As I mentioned in [my last post](/posts/drunkards-walk-with-hiding-spots/) in my free-time I've been tinkering around with multi-player space themed game.
The game is called STAR DEWAR, and will be a tribute to an old BBS game called Trade Wars 2002 that I played as a kid.

[Trade Wars](https://en.wikipedia.org/wiki/Trade_Wars) was a classic multi-player BBS game that had its peak popularity in the 1990s.
It was one of the insiprations for Eve Online (early 2000s) and plenty of other games that focus on space exploration and trading.

I've always thought about extracting some of the elements I loved the most in the game and turning it into a "pocket game", or something that is approachable by the more casual gamer.
This is the first (hopefully not only) journal entry, to help keep myself motivated and to chart progress as the game develops.

The first version is quite minimal; it includes map generation, player tracking, ship navigation and support for multiple simultaneous clients.
One of the main goals was to write something that works well on mobile devices which is a challenge when your main inspiration is game played on a text based interface.

If any of this sounds interesting, please read on, or if you would like to see what is working so far check out <https://stardewar.com/v01>.

1. When the game server starts, a random hex based sector map is generated.
1. When you connect your browser, I assign you a player name (stored in a session cookie) and place your ship on the map.
1. All other players are automatically get "limpet mines" that allow you to see where they are.
1. You can move around the map and see other player movement in real time.

That's it for now! Notthing terribly exciting but getting this far did take a fair bit of time thinking about design and writing code.

### The universe

The classic TradeWars 2002 BBS game had a map divided up into sectors.
Each sector might contain a planet, a trading port, as well as other ships, mines, fighters, etc.
The typical TW2002 map had around 1000 sectors that were represented as a directed graph.
Adjacent sectors were both bidirectional or one-way.

My first obstacle was to think about how to replicate the experience of exploration, finding optimal trade routes, and looking for places that aren't easily discovered by other players.
For this inspired version, I went with a tiled map with hexigon tiles.
For now, all movement is bidirectional but that could change if I can manage to come up with a nice way to show that visually.

It is quite different than the original, where there wasn't a 2D representation of space.
What I think I would like to add later is the ability to connect distant sectors using wormhole paths.

<a href="https://stardewar.com/v01"><img src="/img/sector-map.png" style="width:300px"></a>

_The universe fully zoomed out with all sectors discovered_

After five minutes, a "Big Bang" button will appear allowing anyone to restart the game server and start from scratch.

### Development

I've never written code for a game like this and definitely never have written a 2D game UI for the browser.
Here were some of the more challenging parts:

- Sequencing movement on a 2d board for multiple players
- Zoom, drag, and select with touch events
- Centrally managing multiplayer real-time map updates
- Tracking per player visited sectors and fog-of-war
- Dealing with a hexagon tile map on both the front-end and back-end

#### Front-end

For developing the front-end, I decided to use [phaser.io](https://phaser.io/).
I probably could have gotten away without using a game engine at all, but Phaser has been a great tool so for managing sprites and animating them.

Funny one of the more difficult parts of the front-end (something I take for granted), was coding a natural way to  distinguishing a drag, select and a pinch zoom.
Modern browsers allow you use multiple pointers for pinch detection.
That, along with manual event tracking of how long the pointer is down made it possible to handle all three on a 2D map.

The other part was queuing movement and animations.
Because the backend is authoritative for player state, all movement needs to be sent over a websocket.
The "shortest path" calculation is done on the backend as well.
When you click to a cell that is on a different spot in the map (even if you haven't explored tiles in-between), the backend generates the calculated route.
If multiple movements commands are issued before the movement animation completes they need to be queued up.
The same applies to other player movements that are broadcast to players that have tracking mines attached to the ship.

Movement updates from the server provide only the new movement path (so we don't redraw the entire map on every move), however, any time there is a reconnection is lost or if the browser loses focus the map is redrawn from scratch.

#### Back-end

On the back-end I decided to use Go as I'm already familiar with writing Go for non-game software.
Most of the work was coming up with a schema and queries and then generating code with [sqlc](https://github.com/sqlc-dev/sqlc).
All player state is tracked in sqlite

The map generation is done on the back-end and for more details see [my earlier post on my variation of Drunkard's Walk](/posts/drunkards-walk-with-hiding-spots/).
After playing around with it a bit I went with spherical map that sets a boundary using a radius from the center.

For package dependencies I used the following:

- github.com/coder/websocket
- github.com/dustinkirkland/golang-petname (for generating player names)
- github.com/gorilla/sessions v1.4.0 (for tracking players in cookie based sessions)
- github.com/ncruces/go-sqlite3

Using [embed](https://pkg.go.dev/embed), all assets are compiled into the binary making deployments a breeze, especially with a in-memory db to start.

### What next?

The most challenging part of modern adaptations of games like Trade Wars, is coming up with the mechanics around trading.
This was a central part of the original game and I would like to keep it that way with this "pocket size version".
Doing that, but also not making it too much of a grinding game going back-and-forth between ports is a challenge.
Right now, I'm thinking that I want to keep the trading routes concept of `Fuel Ore`, `Organics` and `Equipment` but also have a way to set up trading routes to automatically use-up unused turns to trade.

For the next addition, what I have in mind is to create artwork and framework for placing ports.
Who knows how long that will take or whether I can keep up, but my love and nostalgia for this game is keeping me motivated.

If you would like to receive updates when I make future posts like these, submit your email on <https://stardewar.com>.
