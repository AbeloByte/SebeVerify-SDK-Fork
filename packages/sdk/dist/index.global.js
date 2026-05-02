"use strict";var SebeVerify=(()=>{var p=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var y=Object.prototype.hasOwnProperty;var v=(i,e)=>{for(var t in e)p(i,t,{get:e[t],enumerable:!0})},I=(i,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of b(e))!y.call(i,n)&&n!==t&&p(i,n,{get:()=>e[n],enumerable:!(s=h(e,n))||s.enumerable});return i};var w=i=>I(p({},"__esModule",{value:!0}),i);var S={};v(S,{SebeVerifySDK:()=>c,createVerificationSession:()=>x,default:()=>m,getVerificationStatus:()=>U,initiateVerification:()=>k,verifyUser:()=>_});var c=class{config;eventListeners=new Map;sessionId=null;requestId=null;documentType="national-id";documentId="";modalElement=null;backendUrl;frontendUrl="";webAppUrl="";constructor(e){if(!e.apiKey)throw new Error("apiKey is required");if(!e.projectId)throw new Error("projectId is required");this.config=e,this.eventListeners=new Map,this.backendUrl=e.backendUrl||"http://localhost:8000",typeof window<"u"&&(this.frontendUrl=window.location.origin,this.webAppUrl=e.webAppUrl||this.frontendUrl)}on(e,t){return this.eventListeners.has(e)||this.eventListeners.set(e,[]),this.eventListeners.get(e).push(t),this}off(e,t){let s=this.eventListeners.get(e);if(s){let n=s.indexOf(t);n>-1&&s.splice(n,1)}return this}emit(e,t){(this.eventListeners.get(e)||[]).forEach(n=>{try{n(t)}catch(r){console.error(`Error in ${e} handler:`,r)}})}getApiHeaders(){return{"Content-Type":"application/json","X-API-Key":this.config.apiKey}}async createSession(){this.documentId=`user_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;let e=`${this.backendUrl}/projects/${this.config.projectId}/verification/session/start`,t=await fetch(e,{method:"POST",headers:this.getApiHeaders(),body:JSON.stringify({document_type:this.documentType,document_id:this.documentId})});if(!t.ok){let n=await t.json().catch(()=>({detail:"Failed to create session"}));throw new Error(n.detail||`Failed to create session (${t.status})`)}let s=await t.json();return this.sessionId=s.session_id,s.session_id}async uploadDocument(e,t,s,n,r,u){let a=`${this.backendUrl}/projects/${this.config.projectId}/verification/image`,o=new FormData;o.append("session_id",e),o.append("document_type",t),o.append("document_id",s),o.append("document_image",n,"document_front.jpg"),o.append("person_image",u,"selfie.jpg"),r&&o.append("document_image_back",r,"document_back.jpg");let d=await fetch(a,{method:"POST",headers:{"X-API-Key":this.config.apiKey},body:o});if(!d.ok){let f=await d.json().catch(()=>({detail:"Failed to upload document"}));throw new Error(f.detail||`Failed to upload document (${d.status})`)}let g=await d.json();return this.requestId=g.request_id,g.request_id}createModal(e){if(this.modalElement)return;let t=document.createElement("div");t.style.cssText=`
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.9); z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;let s=document.createElement("div");s.style.cssText=`
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px; padding: 40px;
      max-width: 420px; text-align: center; color: white;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    `,s.innerHTML=`
      <div style="font-size: 56px; margin-bottom: 20px;">\u{1F512}</div>
      <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 600;">Verification Ready</h2>
      <p style="color: #9ca3af; margin: 0 0 32px; line-height: 1.5;">
        Click below to complete your identity verification
      </p>
      <a href="${e}" style="
        display: block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 20px;
      ">Start Verification</a>
      <button id="sdk-cancel-btn" style="
        background: transparent;
        border: 1px solid #4b5563;
        color: #9ca3af;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
      ">Cancel</button>
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #374151;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          You'll be redirected to complete verification
        </p>
      </div>
    `;let n=s.querySelector("#sdk-cancel-btn");n&&n.addEventListener("click",()=>{this.closeModal(),this.emit("cancelled")}),t.appendChild(s),document.body.appendChild(t),this.modalElement=t}closeModal(){this.modalElement&&(this.modalElement.remove(),this.modalElement=null)}isMobile(){return typeof window>"u"?!1:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}async start(){try{this.emit("started");let e=await this.createSession(),t=`${this.webAppUrl}/verify/${e}?returnUrl=${encodeURIComponent(this.config.redirectUrl)}&backendUrl=${encodeURIComponent(this.backendUrl)}&projectId=${encodeURIComponent(this.config.projectId)}&apiKey=${encodeURIComponent(this.config.apiKey)}`;if(this.isMobile()){window.location.href=t,this.emit("mobile_opened");return}this.createModal(t)}catch(e){this.closeModal();let t=e instanceof Error?e.message:"Unknown error";throw this.emit("error",new Error(t)),e}}async submitDocument(e){if(!this.sessionId)throw new Error("No active session. Call start() first.");try{let t=e.documentType||this.documentType;await this.uploadDocument(this.sessionId,t,this.documentId,e.frontImage,e.backImage||null,e.selfieImage),this.emit("success",{sessionId:this.sessionId,status:"submitted",requestId:this.requestId||void 0,submissionData:{documentType:t,submittedAt:new Date().toISOString(),message:"Document uploaded successfully"}})}catch(t){let s=t instanceof Error?t.message:"Upload failed";throw this.emit("error",new Error(s)),t}}destroy(){this.closeModal(),this.eventListeners.clear(),this.sessionId=null,this.requestId=null}};function m(i){return new c(i)}var l=new Map;async function x(i){let e=i.backendUrl||"http://localhost:8000",t=i.documentType||"national-id",s=i.documentId||`user_${Date.now()}_${Math.random().toString(36).slice(2,11)}`,n=`${e}/projects/${i.projectId}/verification/session/start`,r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":i.apiKey},body:JSON.stringify({document_type:t,document_id:s})});if(!r.ok){let a=await r.json().catch(()=>({detail:"Failed to create verification session"})),o=typeof a?.detail=="string"?a.detail:JSON.stringify(a?.detail??a);throw new Error(`${o||"Failed to create verification session"} (${r.status})`)}return{sessionId:(await r.json()).session_id,backendUrl:e,projectId:i.projectId}}function k(i){let e=`sess_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,t=i.backendUrl||"http://localhost:3000",s={success:!0,sessionId:e,status:"pending"};return l.set(e,s),{sessionId:e,verificationUrl:`${t}/verify/${e}`}}function _(i){if(!l.get(i.sessionId))return{success:!1,sessionId:i.sessionId,status:"rejected",message:"Session not found"};let t={success:!0,sessionId:i.sessionId,status:"approved",message:"Verification completed successfully",requestId:`req_${Date.now()}`,verifiedAt:new Date().toISOString()};return l.set(i.sessionId,t),t}function U(i){return l.get(i)||null}return w(S);})();
