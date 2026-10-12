const esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/saints-account.js'],bundle:true,minify:true,target:['es2020'],outfile:'assets/saints/account.bundle.js'});

esbuild.buildSync({entryPoints:['src/saints-player.js'],bundle:true,minify:true,target:['es2020'],outfile:'assets/saints/player.bundle.js'});
