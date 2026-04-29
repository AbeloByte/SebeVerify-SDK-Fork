"use strict";var SebeVerify=(()=>{var p=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var v=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var m=(r,e)=>{for(var s in e)p(r,s,{get:e[s],enumerable:!0})},b=(r,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of v(e))!f.call(r,i)&&i!==s&&p(r,i,{get:()=>e[i],enumerable:!(t=g(e,i))||t.enumerable});return r};var y=r=>b(p({},"__esModule",{value:!0}),r);var k={};m(k,{default:()=>x,init:()=>h});var u=class{config;eventListeners=new Map;sessionId=null;modalElement=null;checkInterval=null;backendUrl;sessionToken=null;constructor(e){this.config=e,this.eventListeners=new Map,this.backendUrl=e.backendUrl||this.getDefaultBackendUrl()}getDefaultBackendUrl(){return typeof window<"u"?window.location.origin:""}on(e,s){return this.eventListeners.has(e)||this.eventListeners.set(e,[]),this.eventListeners.get(e).push(s),this}off(e,s){let t=this.eventListeners.get(e);if(t){let i=t.indexOf(s);i>-1&&t.splice(i,1)}return this}emit(e,s){let t=this.eventListeners.get(e);t&&t.forEach(i=>i(s))}getVerificationAppOrigin(){let e=this.config.redirectUrl;try{if(e.startsWith("http"))return new URL(e).origin}catch{}return typeof window<"u"?window.location.origin:""}async createSession(){let e=`${this.backendUrl}/v1/sessions`,s=this.config.apiKey,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":s},body:JSON.stringify({user_id:this.config.userId,redirect_url:this.config.redirectUrl,document_types:["national_id","passport"]})});if(!t.ok){let n=await t.json().catch(()=>({detail:"Failed to create session"}));throw new Error(n.detail||`Failed to create verification session (${t.status})`)}let i=await t.json();return this.sessionToken=i.session_token,{sessionId:i.session_id,sessionToken:i.session_token}}async getSessionStatus(e){let s=this.config.apiKey;try{let t={};this.sessionToken?t["X-Session-Token"]=this.sessionToken:t["X-API-Key"]=s;let i=await fetch(`${this.backendUrl}/v1/sessions/${e}`,{headers:t});return i.ok?await i.json():null}catch{return null}}async uploadVerificationImages(e,s,t,i,n,c,a){let o=new FormData;o.append("document_type",s),o.append("document_id",t),o.append("document_image",i,"document_front.jpg"),o.append("person_image",c,"selfie.jpg"),n&&o.append("document_image_back",n,"document_back.jpg"),a.forEach((l,d)=>{o.append("liveness_images",l,`liveness_${d+1}.jpg`)});try{let l=this.config.apiKey;return(await fetch(`${this.backendUrl}/v1/sessions/${e}/upload`,{method:"POST",headers:this.sessionToken?{"X-Session-Token":this.sessionToken}:{"X-API-Key":l},body:o})).ok}catch{return!1}}async completeSession(e,s,t){let i=this.config.apiKey;try{let n=await fetch(`${this.backendUrl}/v1/sessions/${e}/complete`,{method:"POST",headers:this.sessionToken?{"Content-Type":"application/json","X-Session-Token":this.sessionToken}:{"Content-Type":"application/json","X-API-Key":i},body:JSON.stringify({document_type:s,document_id:t})});return n.ok?await n.json():{success:!1}}catch{return{success:!1}}}base64ToBlob(e,s,t){let i=e.replace(/^data:image\/\w+;base64,/,""),n=atob(i),c=new Array(n.length);for(let o=0;o<n.length;o++)c[o]=n.charCodeAt(o);let a=new Uint8Array(c);return new Blob([a],{type:t})}isMobile(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}getQRCodeUrl(e){let s=this.getVerificationUrl(e);return`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(s)}`}getVerificationUrl(e){let s=this.getVerificationAppOrigin(),t=encodeURIComponent(window.location.href),i=encodeURIComponent(this.backendUrl),n=encodeURIComponent(this.sessionToken||"");return`${s}/verify/${e}?returnUrl=${t}&backendUrl=${i}&sessionToken=${n}`}async start(){try{this.emit("started");let e=await this.createSession();this.sessionId=e.sessionId,this.isMobile()?window.location.href=this.getVerificationUrl(this.sessionId):this.showModal()}catch(e){this.emit("error",e)}}async submitVerification(e){if(!this.sessionId){let l=await this.createSession();this.sessionId=l.sessionId}let s=this.base64ToBlob(e.frontImage,"front.jpg","image/jpeg"),t=this.base64ToBlob(e.selfieImage,"selfie.jpg","image/jpeg"),i=null;e.backImage&&(i=this.base64ToBlob(e.backImage,"back.jpg","image/jpeg"));let n=(e.livenessImages||[]).map((l,d)=>this.base64ToBlob(l,`liveness_${d+1}.jpg`,"image/jpeg"));if(!await this.uploadVerificationImages(this.sessionId,e.documentType,e.documentId,s,i,t,n))throw new Error("Failed to upload verification images");let a=await this.completeSession(this.sessionId,e.documentType,e.documentId),o={sessionId:this.sessionId,status:a.success?"submitted":"failed",requestId:a.requestId,submissionData:{documentType:e.documentType,submittedAt:new Date().toISOString(),message:a.success?"Your verification is being processed. You will be notified once complete.":"Verification submission failed. Please try again."}};return a.success?this.emit("success",o):this.emit("error",new Error("Verification submission failed")),o}showModal(){if(!this.sessionId)return;let e=this.config.theme?.primaryColor||"#000000",s=this.config.theme?.borderRadius||"12px",t=this.getVerificationUrl(this.sessionId),i=this.getQRCodeUrl(this.sessionId);this.modalElement=document.createElement("div"),this.modalElement.id="sebeverify-modal",this.modalElement.innerHTML=`
      <style>
        #sebeverify-modal {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          font-family: system-ui, -apple-system, sans-serif;
        }
        #sebeverify-modal * {
          box-sizing: border-box;
        }
        .sv-modal-content {
          background: white;
          border-radius: ${s};
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: sv-slide-up 0.3s ease;
        }
        @keyframes sv-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sv-logo {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          background: ${e};
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sv-logo svg {
          width: 28px;
          height: 28px;
          color: white;
        }
        .sv-title {
          font-size: 20px;
          font-weight: 600;
          color: #111;
          margin: 0 0 8px;
        }
        .sv-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0 0 24px;
        }
        .sv-qr-container {
          background: #f9fafb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .sv-qr-code {
          width: 180px;
          height: 180px;
          margin: 0 auto 16px;
          border-radius: 8px;
          background: white;
          padding: 8px;
        }
        .sv-qr-code img {
          width: 100%;
          height: 100%;
        }
        .sv-instruction {
          font-size: 13px;
          color: #666;
          margin: 0;
        }
        .sv-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }
        .sv-divider-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
        .sv-divider-text {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
        }
        .sv-send-link {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .sv-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }
        .sv-input:focus {
          border-color: ${e};
        }
        .sv-btn {
          padding: 12px 20px;
          background: ${e};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .sv-btn:hover {
          opacity: 0.9;
        }
        .sv-btn-outline {
          background: transparent;
          color: #666;
          border: 1px solid #e5e7eb;
        }
        .sv-btn-outline:hover {
          background: #f9fafb;
        }
        .sv-close {
          width: 100%;
          margin-top: 8px;
        }
        .sv-footer {
          font-size: 11px;
          color: #999;
          margin-top: 16px;
        }
        .sv-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #f0fdf4;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #166534;
          font-size: 14px;
        }
        .sv-status.waiting {
          background: #fef3c7;
          color: #92400e;
        }
        .sv-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: sv-spin 1s linear infinite;
        }
        @keyframes sv-spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="sv-modal-content">
        <div class="sv-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h2 class="sv-title">Verify Your Identity</h2>
        <p class="sv-subtitle">Scan the QR code with your phone to continue verification</p>

        <div class="sv-status waiting" id="sv-status">
          <div class="sv-spinner"></div>
          <span>Waiting for document submission...</span>
        </div>

        <div class="sv-qr-container">
          <div class="sv-qr-code">
            <img src="${i}" alt="QR Code" />
          </div>
          <p class="sv-instruction">Point your camera at the QR code</p>
        </div>

        <div class="sv-divider">
          <div class="sv-divider-line"></div>
          <span class="sv-divider-text">or send link</span>
          <div class="sv-divider-line"></div>
        </div>

        <div class="sv-send-link">
          <input type="email" class="sv-input" placeholder="Enter email or phone" id="sv-contact-input" />
          <button class="sv-btn" id="sv-send-btn">Send</button>
        </div>

        <button class="sv-btn sv-btn-outline sv-close" id="sv-close-btn">Cancel</button>

        <p class="sv-footer">Powered by SebeVerify</p>
      </div>
    `,document.body.appendChild(this.modalElement),this.modalElement.querySelector("#sv-close-btn")?.addEventListener("click",()=>this.close()),this.modalElement.querySelector("#sv-send-btn")?.addEventListener("click",()=>this.sendLink()),this.startStatusPolling(),window.addEventListener("message",this.handleMessage.bind(this))}sendLink(){let s=document.querySelector("#sv-contact-input")?.value;if(!s){alert("Please enter an email or phone number");return}console.log("[SebeVerify] Sending link to:",s),alert(`Verification link sent to ${s}`),this.emit("mobile_opened")}startStatusPolling(){let e=async()=>{let s=new URLSearchParams(window.location.search),t=s.get("status"),i=s.get("session");if(t&&i===this.sessionId){t==="success"?this.handleSuccess():t==="cancelled"&&this.handleCancel(),window.history.replaceState({},"",window.location.pathname);return}if(!this.sessionId)return;let n=await this.getSessionStatus(this.sessionId);n&&(n.status==="approved"?this.handleSuccess():n.status==="rejected"&&this.handleSuccess())};e(),this.checkInterval=setInterval(()=>{e()},1500)}handleMessage(e){if(e.data?.type==="sebeverify_result"){let{status:s,sessionId:t}=e.data;t===this.sessionId&&(s==="success"?this.handleSuccess():s==="error"&&this.handleError(new Error(e.data.message||"Verification failed")))}}handleSuccess(){let e={sessionId:this.sessionId,status:"submitted",submissionData:{documentType:"national_id",submittedAt:new Date().toISOString(),message:"Your verification is being processed. You will be notified once complete."}},s=document.querySelector("#sv-status");s&&(s.className="sv-status",s.innerHTML=`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span>Documents submitted for review!</span>
      `),this.emit("success",e),setTimeout(()=>this.close(),2e3)}handleError(e){this.emit("error",e),this.close()}handleCancel(){let e={sessionId:this.sessionId,status:"cancelled"};this.emit("cancelled",e),this.close()}close(){this.checkInterval&&(clearInterval(this.checkInterval),this.checkInterval=null),window.removeEventListener("message",this.handleMessage.bind(this)),this.modalElement&&(this.modalElement.remove(),this.modalElement=null)}destroy(){this.close(),this.eventListeners.clear(),this.sessionId=null,this.sessionToken=null}};function h(r){if(!r.apiKey)throw new Error("SebeVerify: apiKey is required");if(!r.redirectUrl)throw new Error("SebeVerify: redirectUrl is required");return new u(r)}var w={init:h},x=w;return y(k);})();
