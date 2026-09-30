/* DIP SHIZZZZ — shared behaviour */
(function(){
  // TODO before launch: replace with the real brand WhatsApp number (country code, no +).
  var WA_NUMBER='910000000000';
  var KEY='dipshizz_cart_v1';

  document.documentElement.classList.add('js');

  // nav: solid on scroll + mobile menu
  var nav=document.getElementById('nav');
  if(nav){
    var onScroll=function(){nav.classList.toggle('stuck',scrollY>30)};
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    var tg=document.getElementById('navtoggle');
    if(tg)tg.addEventListener('click',function(){var o=nav.classList.toggle('menuopen');tg.setAttribute('aria-expanded',o)});
    nav.querySelectorAll('.mobmenu a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('menuopen');tg&&tg.setAttribute('aria-expanded','false')})});
  }

  // reveal on scroll
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  }else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')})}

  // hero word rotor
  var rotor=document.getElementById('rotor');
  if(rotor&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var words=['dunk it.','scoop it.','slather it.','pile it on.','the good shizz.'],wi=0;
    setInterval(function(){wi=(wi+1)%words.length;rotor.style.opacity=0;setTimeout(function(){rotor.textContent=words[wi];rotor.style.opacity=1},180)},1600);
  }

  // ---------- cart ----------
  function load(){try{var c=JSON.parse(localStorage.getItem(KEY));return c&&typeof c==='object'?c:{}}catch(e){return {}}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
  var cart=load();
  // drop anything malformed from storage
  Object.keys(cart).forEach(function(id){var it=cart[id];if(!it||typeof it.name!=='string'||!(it.qty>0)||!(it.price>0))delete cart[id]});

  var elItems=document.getElementById('items'),elSub=document.getElementById('sub'),elGo=document.getElementById('checkout');
  function fmt(n){return '₹'+n.toLocaleString('en-IN')}
  function count(){var n=0;for(var k in cart)n+=cart[k].qty;return n}
  function subtotal(){var s=0;for(var k in cart)s+=cart[k].qty*cart[k].price;return s}
  function h(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}

  function render(){
    var n=count();
    document.querySelectorAll('.bag .n').forEach(function(b){b.textContent=n;b.classList.toggle('hide',n===0)});
    if(elItems){
      elItems.textContent='';
      var ids=Object.keys(cart);
      if(!ids.length){
        var em=h('div','empty');em.appendChild(h('span','e','🫙'));em.appendChild(document.createTextNode('Your bag is empty. Tragic.'));
        em.appendChild(document.createElement('br'));em.appendChild(document.createTextNode('Go grab some good shizz.'));
        elItems.appendChild(em);
      }
      ids.forEach(function(id){
        var it=cart[id],row=h('div','ci'),img=h('img');
        img.src=it.img||'';img.alt='';row.appendChild(img);
        var mid=h('div');mid.appendChild(h('div','n',it.name));mid.appendChild(h('div','s',it.size));
        var q=h('div','qty'),dec=h('button',null,'−'),inc=h('button',null,'+');
        dec.dataset.a='dec';inc.dataset.a='inc';dec.dataset.id=inc.dataset.id=id;
        dec.setAttribute('aria-label','One less '+it.name);inc.setAttribute('aria-label','One more '+it.name);
        q.appendChild(dec);q.appendChild(h('span',null,it.qty));q.appendChild(inc);mid.appendChild(q);row.appendChild(mid);
        var rt=h('div','rt');rt.appendChild(h('div','p',fmt(it.qty*it.price)));
        var rm=h('button','rm','Remove');rm.dataset.a='rm';rm.dataset.id=id;rt.appendChild(rm);row.appendChild(rt);
        elItems.appendChild(row);
      });
    }
    if(elSub)elSub.textContent=fmt(subtotal());
    if(elGo)elGo.disabled=n===0;
  }

  var drawer=document.getElementById('cart'),ov=document.getElementById('ov'),lastFocus=null;
  function openCart(){if(!drawer)return;lastFocus=document.activeElement;drawer.classList.add('open');ov.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var x=document.getElementById('cartx');x&&x.focus()}
  function closeCart(){if(!drawer)return;drawer.classList.remove('open');ov.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus&&lastFocus.focus&&lastFocus.focus()}
  document.querySelectorAll('.bag').forEach(function(b){b.addEventListener('click',openCart)});
  var cx=document.getElementById('cartx');cx&&cx.addEventListener('click',closeCart);
  ov&&ov.addEventListener('click',closeCart);
  addEventListener('keydown',function(e){if(e.key==='Escape')closeCart()});

  elItems&&elItems.addEventListener('click',function(e){
    var b=e.target.closest('[data-a]');if(!b)return;var id=b.dataset.id;if(!cart[id])return;
    if(b.dataset.a==='inc')cart[id].qty=Math.min(cart[id].qty+1,20);
    else if(b.dataset.a==='dec'){cart[id].qty--;if(cart[id].qty<=0)delete cart[id]}
    else delete cart[id];
    save();render();
  });

  function add(k,name,size,price,img){
    var id=k+'_'+size;
    if(cart[id])cart[id].qty=Math.min(cart[id].qty+1,20);else cart[id]={name:name,size:size,price:price,qty:1,img:img};
    save();render();openCart();
  }

  elGo&&elGo.addEventListener('click',function(){
    if(!count())return;
    var lines=Object.keys(cart).map(function(id){var it=cart[id];return '• '+it.qty+' x '+it.name+' ('+it.size+') - Rs '+(it.qty*it.price)});
    var msg='Hey Dip Shizzzz! I want the good shizz:\n'+lines.join('\n')+'\n\nSubtotal: Rs '+subtotal();
    window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
  });

  // ---------- shop cards ----------
  document.querySelectorAll('[data-product]').forEach(function(card){
    var btn=card.querySelector('.add'),price=card.querySelector('.ap');
    card.querySelectorAll('.size').forEach(function(s){
      s.addEventListener('click',function(){
        card.querySelectorAll('.size').forEach(function(x){x.setAttribute('aria-pressed','false')});
        s.setAttribute('aria-pressed','true');btn.dataset.size=s.dataset.size;btn.dataset.price=s.dataset.price;price.textContent='₹'+s.dataset.price;
      });
    });
    var label=btn.firstChild.textContent,timer;
    btn.addEventListener('click',function(){
      add(card.dataset.product,btn.dataset.name,btn.dataset.size,parseInt(btn.dataset.price,10),card.querySelector('img').getAttribute('src'));
      clearTimeout(timer);btn.classList.add('done');btn.textContent='In the bag ✓';
      timer=setTimeout(function(){
        btn.classList.remove('done');btn.textContent=label;
        price=h('span','ap','₹'+btn.dataset.price);btn.appendChild(price);
      },1200);
    });
  });

  render();
})();
