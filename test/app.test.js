const test=require('node:test');
const assert=require('node:assert/strict');
const {server,services}=require('../server');

test('catalog contains all 17 support areas from the supplied architecture',()=>{
  assert.equal(services.length,17);
  assert.ok(services.includes('Online therapy'));
  assert.ok(services.includes('Postpartum mental health'));
  assert.ok(services.includes("Veterans' support"));
});

test('HTTP backend exposes health and catalogue and validates demo consent',async t=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base='http://127.0.0.1:'+server.address().port;
  const health=await fetch(base+'/api/health');
  assert.equal(health.status,200);
  assert.deepEqual(await health.json(),{status:'ok',app:'Anon',mode:'prototype'});
  const catalog=await fetch(base+'/api/catalog');
  assert.equal(catalog.status,200);
  const payload=await catalog.json();
  assert.equal(payload.services.length,17);
  assert.ok(payload.methods.length>0);
  const noConsent=await fetch(base+'/api/requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({service:services[0],consent:false})});
  assert.equal(noConsent.status,400);
  const invalidService=await fetch(base+'/api/requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({service:'Not a real pathway',consent:true})});
  assert.equal(invalidService.status,400);
});

test('homepage is served with the new SEO title and privacy content',async t=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const response=await fetch('http://127.0.0.1:'+server.address().port+'/');
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/<title>Anon by GABS/);
  assert.match(html,/application\/ld\+json/);
  assert.match(html,/No digital service can guarantee anonymity/);
});
