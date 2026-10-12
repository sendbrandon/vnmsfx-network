'use strict';
const episodes=[
 {id:'saints-01',title:'Get Her Back',number:1,free:true,released:true,duration:311,poster:'/assets/saints/hero.png',playbackEnv:'MUX_SAINTS_01_PLAYBACK_ID'},
 {id:'saints-02',title:'Before the bad luck',number:2,free:false,released:false,preorder:true,duration:null,poster:'/assets/saints/e02-c01-preview.jpg',playbackEnv:'MUX_SAINTS_02_PLAYBACK_ID'}
];
const products={
 'saints-02':{amount:299,mode:'payment',priceEnv:'STRIPE_SAINTS_02_PRICE',episode:'saints-02'},
 monthly:{amount:799,mode:'subscription',priceEnv:'STRIPE_SAINTS_MONTHLY_PRICE',months:1},
 six:{amount:3999,mode:'subscription',priceEnv:'STRIPE_SAINTS_SIX_MONTH_PRICE',months:6},
 annual:{amount:6999,mode:'subscription',priceEnv:'STRIPE_SAINTS_ANNUAL_PRICE',months:12}
};
module.exports={episodes,products};
