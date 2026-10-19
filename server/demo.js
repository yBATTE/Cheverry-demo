import { timingSafeEqual } from "node:crypto";
import { lessons } from "../private/lessons.js";
import { defaultCourses } from "../src/catalog.js";
import { assert, token, digest } from "./security.js";
const sessions = new Map();
const attempts = new Map();
const equal = (a,b) => timingSafeEqual(Buffer.from(digest(String(a || ""))), Buffer.from(digest(String(b || ""))));
const courseId = "papeleria-automotor";
export function demoEnabled() { return process.env.DEMO_MODE === "true"; }
export async function demoHandler(req,res,{action,body,url,json}) {
 const courses = defaultCourses.map(c => c.id === courseId ? {...c, demoOpen:true, syllabus:lessons.map(l=>l.title)} : c);
 const raw = (req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("cheverry_demo="))?.split("=")[1];
 const now = Date.now();
 for (const [k,v] of sessions) if (v.expires <= now) sessions.delete(k);
 for (const [k,v] of attempts) if (v.expires <= now) attempts.delete(k);
 const session = raw ? sessions.get(digest(raw)) : null;
 const user = session ? {id:"demo-student",name:process.env.DEMO_STUDENT_NAME || "Alumno demo",email:process.env.DEMO_STUDENT_EMAIL,role:"student"} : null;
 const setCookie = (value,age) => res.setHeader("Set-Cookie",`cheverry_demo=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${process.env.VERCEL || process.env.APP_URL?.startsWith("https:") ? "; Secure" : ""}`);
 if (action === "catalog") return json(res,200,{courses,payment:{},demo:true});
 if (action === "me") return json(res,200,{user});
 if (action === "login") {
   const key = req.socket?.remoteAddress || "demo";
   const attempt = attempts.get(key) || {count:0,expires:now+900000};
   attempt.count++; attempts.set(key,attempt);
   assert(attempt.count<=15,429,"Demasiados intentos. Probá más tarde.");
   assert(process.env.DEMO_STUDENT_EMAIL && process.env.DEMO_STUDENT_PASSWORD,503,"Configurá el usuario demo en el .env.");
   assert(equal(String(body.email || "").toLowerCase(),process.env.DEMO_STUDENT_EMAIL.toLowerCase()) && equal(body.password,process.env.DEMO_STUDENT_PASSWORD),401,"Correo o contraseña incorrectos.");
   const secret=token(); sessions.set(digest(secret),{expires:now+8*3600000,progress:{done:[],checks:[]}}); setCookie(secret,8*3600);
   return json(res,200,{user:{id:"demo-student",name:process.env.DEMO_STUDENT_NAME || "Alumno demo",email:process.env.DEMO_STUDENT_EMAIL,role:"student"}});
 }
 if (action === "logout") {if(raw) sessions.delete(digest(raw));setCookie("",0);return json(res,200,{ok:true});}
 if (action === "my-courses") {assert(user,401,"Ingresá con tu cuenta demo.");return json(res,200,{courses:courses.filter(c=>c.id===courseId)});}
 if (action === "classroom") {
   assert(url.searchParams.get("courseId")===courseId,404,"Curso no disponible.");
   return json(res,200,{course:courses[0],lessons,progress:session?.progress || {done:[],checks:[]},demo:true});
 }
 if (action === "progress") {
   assert(body.courseId===courseId,404,"Curso no disponible.");
   const done=Array.isArray(body.progress?.done)?[...new Set(body.progress.done)].filter(n=>Number.isInteger(n)&&n>=0&&n<lessons.length):[];
   if(session)session.progress={done,checks:[]};
   return json(res,200,{ok:true});
 }
 assert(false,503,"Esta función requiere la versión con base de datos. La demo permite recorrer el aula y probar el acceso del alumno.");
}
