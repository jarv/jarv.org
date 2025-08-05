+++
title = "Thinking about Trade Wars trading mechanics" 
date = "2025-08-05"
slug = "stardewar-v02"
tags = ["stardewar"]
+++

It's been a while (3 months!) since my previous post on this little game I've been writing in my free time, so I thought it was probably a good time to give an update.

The game is called [STAR DEWAR](https://stardewar.com) which is a space trading game that is inspired by the early BBS game [Trade Wars](https://en.wikipedia.org/wiki/Trade_Wars).
Three months ago, I had created the basic hexagon map generation, multiplayer, and movement UI, but that was about it.
This update includes a few more features:

1. Trading at ports!
2. Updated UI
3. Navigation computer messages

<b>tldr; you can play a [(pre-alpha) demo here](https://stardewar.com/v02) that illustrates the new trading mechanics.</b>

There isn't much to discuss regarding (2) or (3), you can see these changes yourself by playing the demo.
The trading mechanics seemed interesting enough to warrant a post explaining how they're implemented.

In the game, you have three commodities, `Fuel Ore`, `Organics` and `Equipment`.
I found myself going back to the original game (yes, there are still a small number of people who play) to remind myself how trading worked, how negotiations functioned, and how prices were set.

In general, I wanted to implement something that captures the original feeling of the BBS game and trading experience while giving it a modern interface.

To start, every port is designated with `B` or `S` for each commodity and shown on the mini-map like this:

<img src="/img/tw2002-ports.png" style="width:300px">

In the original game, when you traded at a port, a commodity table would be presented like this:

```text
  Docking...
   One turn deducted, 14 turns left.

   Commerce Report for Tarsus: 08/19/05 02:01:48 PM

   -=-=-        Docking Log         -=-=-
   USS Enterprise NCC-1701-D docked 1 day(s) ago.

   Items      Status  Trading % of max OnBoard
   -----      ------  ------- -------- -------
   Fuel Ore   Buying      23      4%       0
   Organics   Buying     193     17%       0
   Equipment  Selling    741     42%       0
```

The way I understand it worked in the original game, there was a finite limit of resources for each type, and they would slowly get replenished on a daily interval.
There was also a negotiation step where you could offer more or fewer credits than the original offer.

The counter-offer's success was based on various factors including the port's characteristics, your experience, and probably other things I don't remember.

The trading screen in STAR DEWAR has a similar look with some notable differences:

<img src="/img/tw2002-trading-screen.png" style="width:300px">

There's no text input for trades, so negotiations are fixed at "full price," "10%," or "20%" more or less than the offer.
Accepting or rejecting a trade is where things get interesting, there's a deterministic score given to every trade that sets bounds for the minimum and maximum accepted values.
This determination uses the following factors:

1. How experienced the player is (experience points)
2. The port's willingness to negotiate (set per port)
3. How much of the commodity is present at the port
4. How reasonable the price is

In STAR DEWAR, each of these factors is assigned a weight, which results in a minimum and maximum trade value for the commodity.
Like the original game, a successful negotiation will give you some experience.
Conversely, a trade rejection will result in losing experience.
As the port reaches its maximum capacity, it will be less inclined to negotiate.
If the port is rejecting many trades, it will reduce its willingness to haggle.
Lastly, successful trades will self-reinforce future successful trades as players increase their experience.

Counter-offers are where some randomness comes into play.
If an offer comes in that's outside the port's acceptable range, there's a 50% chance of a counter-offer, which will be a random value within the acceptable range.
Upon receiving the offer, the player can either accept it for the full amount or take an additional chance and try to get a better deal.

I've been thinking a little bit about how to make trading less of a grind and more interesting, which was a problem that was definitely present in the original game.
Maybe automating trade routes that consume unused turns?

You can check out how trading works [by playing the pre-alpha demo](https://stardewar.com/v02), which is a universe loaded up with a large number of ports to illustrate how it works.
If you have any feedback or suggestions, please don't hesitate to [reach out](/contact/) or [submit your email for these infrequent updates](https://stardewar.com/).
