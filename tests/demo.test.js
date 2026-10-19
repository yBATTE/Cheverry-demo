import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';
test('demo opens only supplied course, validates env login, preserves role and disables real payments', async()=>{
 process.env.DEMO_MODE='true'; process.env.APP_URL='http://localhost:5178';
 process.env.DEMO_STUDENT_EMAIL='alumno@test.demo';process.env.DEMO_STUDENT_PASSWORD='DemoTest123!';
 async function call(action,body,cookie){const headers={};let value;const res={setHeader(k,v){headers[k]=v},end(v){value=v},statusCode:200};await handler({url:'/api?'+action,method:body?'POST':'GET',headers:{origin:process.env.APP_URL,'content-type':'application/json',cookie},body,socket:{remoteAddress:'test'}},res);return {status:res.statusCode,data:JSON.parse(value),headers};}
 assert.equal((await call('action=classroom&courseId=papeleria-automotor')).data.lessons.length,5);
 assert.equal((await call('action=classroom&courseId=venta-de-vehiculos')).status,404);
 assert.equal((await call('action=my-courses')).status,401);
 assert.equal((await call('action=login',{email:'alumno@test.demo',password:'wrong'})).status,401);
 const login=await call('action=login',{email:'alumno@test.demo',password:'DemoTest123!'});
 assert.equal(login.data.user.role,'student');assert.ok(login.headers['Set-Cookie'].includes('HttpOnly'));
 const cookie=login.headers['Set-Cookie'].split(';')[0];
 assert.equal((await call('action=my-courses',undefined,cookie)).data.courses.length,1);
 assert.equal((await call('action=approve',{id:'x'},cookie)).status,503);
 assert.equal((await call('action=progress',{courseId:'papeleria-automotor',progress:{done:[0,1,100,-1,'3']}},cookie)).status,200);
 assert.deepEqual((await call('action=classroom&courseId=papeleria-automotor',undefined,cookie)).data.progress.done,[0,1]);
 assert.equal((await call('action=logout',{},cookie)).status,200);
 assert.equal((await call('action=me',undefined,cookie)).data.user,null);
 delete process.env.DEMO_MODE;
});
