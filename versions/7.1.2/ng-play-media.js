/* Shared invented store titles only. Rendering and resources use angler Phonesky. */
(() => {
  'use strict';
  const DATA = {
    2: [['Northern Lights', 'Drama', '#37474f', '▶', 3.99], ['The Last Summit', 'Adventure', '#5d4037', '▶', 4.99], ['City of Glass', 'Thriller', '#283593', '▶', 3.99], ['Paper Kites', 'Family', '#00897b', '▶', 2.99], ['Midnight Diner', 'Comedy', '#6a1b9a', '▶', 3.99], ['Ocean Deep', 'Documentary', '#0277bd', '▶', 1.99]],
    3: [['Quiet Hours', 'The Lanterns', '#ef6c00', '♫', 9.99], ['Neon Rivers', 'Polar Cities', '#ad1457', '♫', 8.99], ['Wild Fields', 'Maple & Oak', '#558b2f', '♫', 7.99], ['Echo Park', 'Sunday Drive', '#4527a0', '♫', 9.49], ['Low Tide', 'Harbor Lights', '#00838f', '♫', 6.99], ['Ten Rooms', 'Static Bloom', '#c62828', '♫', 8.49]],
    4: [['The Lighthouse Keeper', 'A. M. Rowan', '#039be5', '❦', 7.99], ['Small Gardens', 'Lena Hart', '#43a047', '❦', 5.99], ['A Map of Rain', 'Owen Pike', '#5e35b1', '❦', 6.99], ['Winter Trains', 'Ida Brook', '#546e7a', '❦', 4.99], ['The Clockmaker', 'Sam Ellery', '#8d6e63', '❦', 8.99], ['Field Notes', 'June Ashby', '#00897b', '❦', 3.99]],
    5: [['Outdoor Life', 'Monthly', '#9c27b0', '✎', 2.99], ['Tech Today', 'Weekly', '#3949ab', '✎', 1.99], ['Kitchen Table', 'Monthly', '#f4511e', '✎', 2.49], ['Pocket Science', 'Monthly', '#00897b', '✎', 2.99], ['City Arts', 'Quarterly', '#6d4c41', '✎', 4.99], ['Travel Light', 'Monthly', '#0288d1', '✎', 2.99]]
  };
  const corpus={2:{title:'corpus_title_movies',color:'#ff1744',status:'#d9143a'},3:{title:'corpus_title_music',color:'#ff5722',status:'#d91827'},4:{title:'corpus_title_books',color:'#039be5',status:'#0384c3'},5:{title:'corpus_title_newsstand',color:'#9c27b0',status:'#852196'}};
  const items=Object.entries(DATA).flatMap(([key,list])=>list.map(([name,dev,color,glyph,price],i)=>{const media=+key,height=media===3?96:140;const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 ${height}"><rect width="96" height="${height}" fill="${color}"/><circle cx="48" cy="${height/2}" r="34" fill="white" fill-opacity=".12"/><text x="48" y="${height/2+17}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="50">${glyph}</text></svg>`;return {id:`m${key}-${i}`,media,name,dev,color,glyph,price,rating:4.1+i%5/10,cat:dev,bytes:0,desc:'',icon:'data:image/svg+xml,'+encodeURIComponent(svg)};}));
  NG.playMedia={corpus,items,find:id=>items.find(it=>it.id===id),price:(c,it,price=it.price)=>new Intl.NumberFormat(c.locale(),{style:'currency',currency:'USD'}).format(price)};
})();
