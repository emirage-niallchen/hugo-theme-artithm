(function(){
  // 常规：日语「はい/ワン」（像狗一样回答）。稀有彩蛋 2%：中文/混排短语
  var rare=[
    {t:'汪',cn:true},
    {t:'城の鼠',cn:false},
    {t:'乡の鼠',cn:true},
    {t:'尸体在说话',cn:true}
  ];
  document.addEventListener('click',function(e){
    var t=e.target;
    if(t&&t.closest&&t.closest('a,button,input,textarea,select,label,[role=button]'))return;
    var el=document.createElement('span');
    el.className='mkm-bark';
    if(Math.random()<0.02){
      var r=rare[(Math.random()*rare.length)|0];
      el.textContent=r.t;
      if(r.cn)el.className+=' cn';
    }else{
      el.textContent=(Math.random()<0.5?'はい':'ワン');
    }
    el.style.left=e.clientX+'px';
    el.style.top=e.clientY+'px';
    document.body.appendChild(el);
    el.addEventListener('animationend',function(){el.remove();});
    setTimeout(function(){if(el.parentNode)el.remove();},900);
  },true);
})();
