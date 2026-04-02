"use strict";var SebeVerify=(()=>{var c=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var g=(r,e)=>{for(var t in e)c(r,t,{get:e[t],enumerable:!0})},b=(r,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of f(e))!m.call(r,i)&&i!==t&&c(r,i,{get:()=>e[i],enumerable:!(s=u(e,i))||s.enumerable});return r};var x=r=>b(c({},"__esModule",{value:!0}),r);var p=(r,e,t)=>new Promise((s,i)=>{var a=n=>{try{o(t.next(n))}catch(d){i(d)}},l=n=>{try{o(t.throw(n))}catch(d){i(d)}},o=n=>n.done?s(n.value):Promise.resolve(n.value).then(a,l);o((t=t.apply(r,e)).next())});var E={};g(E,{default:()=>w,init:()=>h});var v=class{constructor(e){this.eventListeners=new Map;this.sessionId=null;this.modalElement=null;this.checkInterval=null;this.config=e,this.eventListeners=new Map}on(e,t){return this.eventListeners.has(e)||this.eventListeners.set(e,[]),this.eventListeners.get(e).push(t),this}off(e,t){let s=this.eventListeners.get(e);if(s){let i=s.indexOf(t);i>-1&&s.splice(i,1)}return this}emit(e,t){let s=this.eventListeners.get(e);s&&s.forEach(i=>i(t))}createSession(){return p(this,null,function*(){let e=`sv_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;return yield new Promise(t=>setTimeout(t,500)),e})}isMobile(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}getQRCodeUrl(e){let t=this.getVerificationUrl(e);return`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t)}`}getVerificationUrl(e){let t=this.config.redirectUrl||window.location.origin+"/verify",s=encodeURIComponent(window.location.href);return`${t}?session=${e}&returnUrl=${s}`}start(){return p(this,null,function*(){try{this.emit("started"),this.sessionId=yield this.createSession(),this.isMobile()?window.location.href=this.getVerificationUrl(this.sessionId):this.showModal()}catch(e){this.emit("error",e)}})}showModal(){var o,n;if(!this.sessionId)return;let e=((o=this.config.theme)==null?void 0:o.primaryColor)||"#2563eb",t=((n=this.config.theme)==null?void 0:n.borderRadius)||"12px",s=this.getVerificationUrl(this.sessionId),i=this.getQRCodeUrl(this.sessionId);this.modalElement=document.createElement("div"),this.modalElement.id="sebeverify-modal",this.modalElement.innerHTML=`
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
          border-radius: ${t};
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
    `,document.body.appendChild(this.modalElement);let a=this.modalElement.querySelector("#sv-close-btn");a==null||a.addEventListener("click",()=>this.close());let l=this.modalElement.querySelector("#sv-send-btn");l==null||l.addEventListener("click",()=>this.sendLink()),this.startStatusPolling(),window.addEventListener("message",this.handleMessage.bind(this))}sendLink(){let e=document.querySelector("#sv-contact-input"),t=e==null?void 0:e.value;if(!t){alert("Please enter an email or phone number");return}console.log("[SebeVerify] Sending link to:",t),alert(`Verification link sent to ${t}`),this.emit("mobile_opened")}startStatusPolling(){let e=()=>{let t=new URLSearchParams(window.location.search),s=t.get("status"),i=t.get("session");s&&i===this.sessionId&&(s==="success"?this.handleSuccess():s==="cancelled"&&this.handleCancel(),window.history.replaceState({},"",window.location.pathname))};e(),this.checkInterval=setInterval(e,1e3)}handleMessage(e){var t;if(((t=e.data)==null?void 0:t.type)==="sebeverify_result"){let{status:s,sessionId:i}=e.data;i===this.sessionId&&(s==="success"?this.handleSuccess():s==="error"&&this.handleError(new Error(e.data.message||"Verification failed")))}}handleSuccess(){let e={sessionId:this.sessionId,status:"submitted",submissionData:{documentType:"national_id",submittedAt:new Date().toISOString(),message:"Your verification is being processed. You will be notified once complete."}},t=document.querySelector("#sv-status");t&&(t.className="sv-status",t.innerHTML=`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span>Documents submitted for review!</span>
      `),this.emit("success",e),setTimeout(()=>this.close(),2e3)}handleError(e){this.emit("error",e),this.close()}handleCancel(){let e={sessionId:this.sessionId,status:"cancelled"};this.emit("cancelled",e),this.close()}close(){this.checkInterval&&(clearInterval(this.checkInterval),this.checkInterval=null),window.removeEventListener("message",this.handleMessage.bind(this)),this.modalElement&&(this.modalElement.remove(),this.modalElement=null)}destroy(){this.close(),this.eventListeners.clear(),this.sessionId=null}};function h(r){if(!r.apiKey)throw new Error("SebeVerify: apiKey is required");if(!r.redirectUrl)throw new Error("SebeVerify: redirectUrl is required");return new v(r)}var y={init:h},w=y;return x(E);})();
