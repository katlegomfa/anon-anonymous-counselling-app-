const test=require('node:test');
const assert=require('node:assert/strict');
const {server,services,demoIntakeConfigured}=require('../server');

test('catalog contains all 17 support areas from the supplied architecture',()=>{
  assert.equal(services.length,17);
  assert.ok(services.includes('Online therapy'));
  assert.ok(services.includes('Postpartum mental health'));
  assert.ok(services.includes("Veterans' support"));
});

test('HTTP backend exposes health and catalogue and safely disables intake without a secret',async t=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base='http://127.0.0.1:'+server.address().port;
  const health=await fetch(base+'/api/health');
  assert.equal(health.status,200);
  const healthBody=await health.json();
  assert.equal(healthBody.status,'ok');
  assert.equal(healthBody.app,'Anon');
  assert.equal(healthBody.mode,'prototype');
  assert.equal(healthBody.demoIntakeConfigured,false);
  assert.equal(demoIntakeConfigured,false);
  const catalog=await fetch(base+'/api/catalog');
  assert.equal(catalog.status,200);
  const payload=await catalog.json();
  assert.equal(payload.services.length,17);
  assert.ok(payload.methods.length>0);
  const noConsent=await fetch(base+'/api/requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({service:services[0],consent:false})});
  assert.equal(noConsent.status,400);
  const invalidService=await fetch(base+'/api/requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({service:'Not a real pathway',consent:true})});
  assert.equal(invalidService.status,400);
  const unavailable=await fetch(base+'/api/requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({service:services[0],consent:true})});
  assert.equal(unavailable.status,503);
  assert.match((await unavailable.json()).error,/Secure demo storage is not configured/);
});

test('homepage is served with SEO metadata, privacy content and no display-name field',async t=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const response=await fetch('http://127.0.0.1:'+server.address().port+'/');
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/<title>Anon by GABS/);
  assert.match(html,/application\\/ld\\+json/);
  assert.match(html,/No digital service can guarantee anonymity/);
  assert.doesNotMatch(html,/id="alias"/);
});
