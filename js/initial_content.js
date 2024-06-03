const INITIAL_CONTENT = `
air 0 #000
sand 1 #fc0
water 2 #08f
fire 3 #f00
steam 4 #ccc
wall 5 #222
virus 6 #f0f
rock 7 #888
lava 8 #400

falls := [sand virus water rock lava]
fallinto := [water lava air steam fire]
sandlike := [sand virus]
hot := [fire lava]
slides := [water lava steam]
slideinto := [air steam fire]

falls@1
fallinto@2
=>
@2
@1

sym:h
sandlike@2
*,fallinto@1
=>
@1
*,@2

chance:50 sym:h
slides@2,slideinto@1
=>
@1,@2

chance:20
fire => air

chance:60 sym:r
fire,slideinto@1 => @1,fire

sym:r
hot,sandlike => *,fire

chance:1
steam => water

sym:r
hot,water => *,steam

air
steam
=>
steam
air

sym:r
virus,![wall air] => *,virus

air
lava
=>
fire
*
`.slice(1, -1);