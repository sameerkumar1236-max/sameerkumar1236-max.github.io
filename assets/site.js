/* DIP SHIZZZZ — shared behaviour */
(function(){
  // TODO before launch: replace with the real brand WhatsApp number (country code, no +).
  var WA_NUMBER='910000000000';
  var KEY='dipshizz_cart_v1';
  var reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  // nav: solid on scroll + mobile menu
  var nav=document.getElementById('nav'),tg=document.getElementById('navtoggle');
  function closeMenu(){if(nav&&nav.classList.contains('menuopen')){nav.classList.remove('menuopen');tg&&tg.setAttribute('aria-expanded','false');return true}return false}
  if(nav){
    var onScroll=function(){nav.classList.toggle('stuck',scrollY>30)};
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    if(tg)tg.addEventListener('click',function(){var o=nav.classList.toggle('menuopen');tg.setAttribute('aria-expanded',o)});
    nav.querySelectorAll('.mobmenu a').forEach(function(a){a.addEventListener('click',closeMenu)});
  }

  // reveal on scroll
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  }else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')})}

  // hero word rotor
  var rotor=document.getElementById('rotor');
  if(rotor&&!reduceMotion){
    var words=['dunk it.','scoop it.','slather it.','pile it on.','the good shizz.'],wi=0;
    setInterval(function(){wi=(wi+1)%words.length;rotor.style.opacity=0;setTimeout(function(){rotor.textContent=words[wi];rotor.style.opacity=1},180)},1600);
  }

  // hero ingredients: gentle pointer parallax (desktop, fine pointers only)
  var hero=document.querySelector('.hero');
  if(hero&&!reduceMotion&&matchMedia('(pointer: fine)').matches){
    var raf=0,px=0,py=0;
    hero.addEventListener('pointermove',function(e){
      var r=hero.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;
      if(!raf)raf=requestAnimationFrame(function(){raf=0;hero.style.setProperty('--px',px.toFixed(3));hero.style.setProperty('--py',py.toFixed(3))});
    });
    hero.addEventListener('pointerleave',function(){hero.style.setProperty('--px',0);hero.style.setProperty('--py',0)});
  }

  // ---------- cart ----------
  // Storage is per-device and user-editable: keep only well-formed lines, and only local image paths.
  function sane(c){
    if(!c||typeof c!=='object'||Array.isArray(c))return {};
    Object.keys(c).forEach(function(id){
      var it=c[id];
      if(!it||typeof it.name!=='string'||typeof it.size!=='string'||!(it.qty>0)||!(it.price>0)){delete c[id];return}
      it.qty=Math.min(Math.floor(it.qty),20);
      if(typeof it.img!=='string'||!/^assets\/[\w.\/-]+$/.test(it.img))it.img='';
    });
    return c;
  }
  function load(){try{return sane(JSON.parse(localStorage.getItem(KEY)))}catch(e){return {}}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
  var cart=load();

  var elItems=document.getElementById('items'),elSub=document.getElementById('sub'),elGo=document.getElementById('checkout'),elLive=document.getElementById('cartlive');
  function fmt(n){return '₹'+n.toLocaleString('en-IN')}
  function count(){var n=0;for(var k in cart)n+=cart[k].qty;return n}
  function subtotal(){var s=0;for(var k in cart)s+=cart[k].qty*cart[k].price;return s}
  function h(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function items(n){return n+' item'+(n===1?'':'s')}

  function render(announce){
    var n=count();
    document.querySelectorAll('.bag').forEach(function(b){
      var c=b.querySelector('.n');if(c){c.textContent=n;c.classList.toggle('hide',n===0)}
      b.setAttribute('aria-label',n?'Open bag, '+items(n):'Open bag');
    });
    if(elItems){
      // remember which control had focus so keyboard users keep their place after a rebuild
      var a=document.activeElement,keep=a&&elItems.contains(a)&&a.dataset&&a.dataset.a?{a:a.dataset.a,id:a.dataset.id}:null;
      elItems.textContent='';
      var ids=Object.keys(cart);
      if(!ids.length){
        var em=h('div','empty');em.appendChild(h('span','e','🫙'));em.appendChild(document.createTextNode('Your bag is empty. Tragic.'));
        em.appendChild(document.createElement('br'));em.appendChild(document.createTextNode('Go grab some good shizz.'));
        elItems.appendChild(em);
      }
      ids.forEach(function(id){
        var it=cart[id],row=h('div','ci'),img=h('img');
        img.src=it.img;img.alt='';row.appendChild(img);
        var mid=h('div');mid.appendChild(h('div','n',it.name));mid.appendChild(h('div','s',it.size));
        var q=h('div','qty'),dec=h('button',null,'−'),inc=h('button',null,'+');
        dec.type=inc.type='button';dec.dataset.a='dec';inc.dataset.a='inc';dec.dataset.id=inc.dataset.id=id;
        dec.setAttribute('aria-label','One less '+it.name+' '+it.size);inc.setAttribute('aria-label','One more '+it.name+' '+it.size);
        q.appendChild(dec);q.appendChild(h('span',null,it.qty));q.appendChild(inc);mid.appendChild(q);row.appendChild(mid);
        var rt=h('div','rt');rt.appendChild(h('div','p',fmt(it.qty*it.price)));
        var rm=h('button','rm','Remove');rm.type='button';rm.dataset.a='rm';rm.dataset.id=id;rm.setAttribute('aria-label','Remove '+it.name+' '+it.size);
        rt.appendChild(rm);row.appendChild(rt);
        elItems.appendChild(row);
      });
      if(keep){
        var t=null;elItems.querySelectorAll('button[data-a]').forEach(function(b){if(!t&&b.dataset.a===keep.a&&b.dataset.id===keep.id)t=b});
        (t||elItems.querySelector('button')||document.getElementById('cartx')).focus();
      }
    }
    if(elSub)elSub.textContent=fmt(subtotal());
    if(elGo)elGo.disabled=n===0;
    if(announce&&elLive)elLive.textContent='Bag updated: '+items(n)+', subtotal '+fmt(subtotal());
  }

  // stay in sync with other tabs and with pages restored from the back/forward cache
  addEventListener('storage',function(e){if(e.key===KEY){cart=load();render()}});
  addEventListener('pageshow',function(e){if(e.persisted){cart=load();render()}});

  // ---------- drawer (modal dialog) ----------
  var drawer=document.getElementById('cart'),ov=document.getElementById('ov'),lastFocus=null,openedAt=0;
  function isOpen(){return !!drawer&&drawer.classList.contains('open')}
  function background(){return Array.prototype.filter.call(document.body.children,function(el){return el!==drawer&&el!==ov&&el.tagName!=='SCRIPT'})}
  function openCart(){
    if(!drawer||isOpen())return;
    lastFocus=document.activeElement;openedAt=Date.now();closeMenu();
    drawer.inert=false;drawer.removeAttribute('aria-hidden');drawer.classList.add('open');ov.classList.add('open');
    background().forEach(function(el){el.inert=true});
    document.body.style.overflow='hidden';
    var x=document.getElementById('cartx');x&&x.focus();
  }
  function closeCart(){
    if(!isOpen())return;
    drawer.classList.remove('open');ov.classList.remove('open');drawer.setAttribute('aria-hidden','true');drawer.inert=true;
    background().forEach(function(el){el.inert=false});
    document.body.style.overflow='';
    if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus();
    lastFocus=null;
  }
  if(drawer){drawer.inert=true}
  document.querySelectorAll('.bag').forEach(function(b){b.addEventListener('click',openCart)});
  var cx=document.getElementById('cartx');cx&&cx.addEventListener('click',closeCart);
  // ignore the overlay for a moment after opening, so a fast double-click on "Add" doesn't close the bag it just opened
  ov&&ov.addEventListener('click',function(){if(Date.now()-openedAt>400)closeCart()});
  addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(isOpen())closeCart();else if(closeMenu()&&tg)tg.focus();
  });
  // keep Tab inside the open drawer
  drawer&&drawer.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var f=Array.prototype.filter.call(drawer.querySelectorAll('button,a[href]'),function(b){return !b.disabled&&b.offsetParent!==null});
    if(!f.length)return;var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });

  elItems&&elItems.addEventListener('click',function(e){
    var b=e.target.closest('[data-a]');if(!b)return;var id=b.dataset.id;
    cart=load();if(!cart[id]){render();return}
    if(b.dataset.a==='inc')cart[id].qty=Math.min(cart[id].qty+1,20);
    else if(b.dataset.a==='dec'){cart[id].qty--;if(cart[id].qty<=0)delete cart[id]}
    else delete cart[id];
    save();render(true);
  });

  function add(k,name,size,price,img){
    cart=load();
    var id=k+'_'+size;
    if(cart[id])cart[id].qty=Math.min(cart[id].qty+1,20);else cart[id]={name:name,size:size,price:price,qty:1,img:img};
    save();render(true);openCart();
  }

  elGo&&elGo.addEventListener('click',function(){
    cart=load();render();
    if(!count())return;
    var lines=Object.keys(cart).map(function(id){var it=cart[id];return '• '+it.qty+' x '+it.name+' ('+it.size+') - Rs '+(it.qty*it.price)});
    var msg='Hey Dip Shizzzz! I want the good shizz:\n'+lines.join('\n')+'\n\nSubtotal: Rs '+subtotal();
    window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
  });

  // ---------- shop cards ----------
  document.querySelectorAll('[data-product]').forEach(function(card){
    var btn=card.querySelector('.add');if(!btn)return;
    var label=btn.firstChild.textContent,timer;
    function price(){var p=btn.querySelector('.ap');if(p)p.textContent='₹'+btn.dataset.price}
    card.querySelectorAll('.size').forEach(function(s){
      s.addEventListener('click',function(){
        card.querySelectorAll('.size').forEach(function(x){x.setAttribute('aria-pressed','false')});
        s.setAttribute('aria-pressed','true');btn.dataset.size=s.dataset.size;btn.dataset.price=s.dataset.price;price();
      });
    });
    btn.addEventListener('click',function(){
      add(card.dataset.product,btn.dataset.name,btn.dataset.size,parseInt(btn.dataset.price,10),card.querySelector('img').getAttribute('src'));
      clearTimeout(timer);btn.classList.add('done');btn.textContent='In the bag ✓';
      timer=setTimeout(function(){btn.classList.remove('done');btn.textContent=label;btn.appendChild(h('span','ap','₹'+btn.dataset.price))},1200);
    });
  });

  render();
})();
