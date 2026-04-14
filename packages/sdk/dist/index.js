"use strict";var r=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var c=Object.prototype.hasOwnProperty;var p=(n,e)=>{for(var t in e)r(n,t,{get:e[t],enumerable:!0})},v=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of d(e))!c.call(n,s)&&s!==t&&r(n,s,{get:()=>e[s],enumerable:!(i=l(e,s))||i.enumerable});return n};var h=n=>v(r({},"__esModule",{value:!0}),n);var g={};p(g,{default:()=>f,init:()=>a});module.exports=h(g);var o=class{config;eventListeners=new Map;sessionId=null;modalElement=null;checkInterval=null;constructor(e){this.config=e,this.eventListeners=new Map}on(e,t){return this.eventListeners.has(e)||this.eventListeners.set(e,[]),this.eventListeners.get(e).push(t),this}off(e,t){let i=this.eventListeners.get(e);if(i){let s=i.indexOf(t);s>-1&&i.splice(s,1)}return this}emit(e,t){let i=this.eventListeners.get(e);i&&i.forEach(s=>s(t))}getVerificationAppOrigin(){let e=this.config.redirectUrl;try{if(e.startsWith("http"))return new URL(e).origin}catch{}return typeof window<"u"?window.location.origin:""}async createSession(){let e=this.getVerificationAppOrigin(),t=await fetch(`${e}/api/mock/session`,{method:"POST"});if(!t.ok)throw new Error(`Failed to create verification session (${t.status})`);return(await t.json()).sessionId}isMobile(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}getQRCodeUrl(e){let t=this.getVerificationUrl(e);return`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t)}`}getVerificationUrl(e){let t=this.getVerificationAppOrigin(),i=encodeURIComponent(window.location.href);return`${t}/verify/${e}?returnUrl=${i}`}async start(){try{this.emit("started"),this.sessionId=await this.createSession(),this.isMobile()?window.location.href=this.getVerificationUrl(this.sessionId):this.showModal()}catch(e){this.emit("error",e)}}showModal(){if(!this.sessionId)return;let e=this.config.theme?.primaryColor||"#000000",t=this.config.theme?.borderRadius||"12px",i=this.getVerificationUrl(this.sessionId),s=this.getQRCodeUrl(this.sessionId);this.modalElement=document.createElement("div"),this.modalElement.id="sebeverify-modal",this.modalElement.innerHTML=`
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
            <img src="${s}" alt="QR Code" />
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
    `,document.body.appendChild(this.modalElement),this.modalElement.querySelector("#sv-close-btn")?.addEventListener("click",()=>this.close()),this.modalElement.querySelector("#sv-send-btn")?.addEventListener("click",()=>this.sendLink()),this.startStatusPolling(),window.addEventListener("message",this.handleMessage.bind(this))}sendLink(){let t=document.querySelector("#sv-contact-input")?.value;if(!t){alert("Please enter an email or phone number");return}console.log("[SebeVerify] Sending link to:",t),alert(`Verification link sent to ${t}`),this.emit("mobile_opened")}startStatusPolling(){let e=()=>{let t=new URLSearchParams(window.location.search),i=t.get("status"),s=t.get("session");i&&s===this.sessionId&&(i==="success"?this.handleSuccess():i==="cancelled"&&this.handleCancel(),window.history.replaceState({},"",window.location.pathname))};e(),this.checkInterval=setInterval(e,1e3)}handleMessage(e){if(e.data?.type==="sebeverify_result"){let{status:t,sessionId:i}=e.data;i===this.sessionId&&(t==="success"?this.handleSuccess():t==="error"&&this.handleError(new Error(e.data.message||"Verification failed")))}}handleSuccess(){let e={sessionId:this.sessionId,status:"submitted",submissionData:{documentType:"national_id",submittedAt:new Date().toISOString(),message:"Your verification is being processed. You will be notified once complete."}},t=document.querySelector("#sv-status");t&&(t.className="sv-status",t.innerHTML=`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span>Documents submitted for review!</span>
      `),this.emit("success",e),setTimeout(()=>this.close(),2e3)}handleError(e){this.emit("error",e),this.close()}handleCancel(){let e={sessionId:this.sessionId,status:"cancelled"};this.emit("cancelled",e),this.close()}close(){this.checkInterval&&(clearInterval(this.checkInterval),this.checkInterval=null),window.removeEventListener("message",this.handleMessage.bind(this)),this.modalElement&&(this.modalElement.remove(),this.modalElement=null)}destroy(){this.close(),this.eventListeners.clear(),this.sessionId=null}};function a(n){if(!n.apiKey)throw new Error("SebeVerify: apiKey is required");if(!n.redirectUrl)throw new Error("SebeVerify: redirectUrl is required");return new o(n)}var u={init:a},f=u;0&&(module.exports={init});
