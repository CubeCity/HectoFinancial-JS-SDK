/**
 * HectoPG v1.3
 * 
 * BSD 3-Clause License
 * 
 * Original Work: https://npg.settlebank.co.kr/resources/js/v1/SettlePG_v1.2.js
 * Copyright (C) 2023 Hecto Financial Co., Ltd. <info_F@hecto.co.kr>
 * Copyright (C) 2024 CubeCity Co., Ltd. <support@cube.city>
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions, and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions, and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    names of its contributors may be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var Util = {
	isMobile: function () {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
};

var Msg = {
	popup_err: "[헥토파이낸셜] 팝업 차단 설정이 되어 있습니다.\n해제 후 다시 이용해 주세요.",
	pay_err: "[헥토파이낸셜] SETTLE_PG.pay() 호출 시스템 에러",
	validation_err: "[헥토파이낸셜] 호출 파라미터 오류"
};

var SETTLE_PG = {
	_SETTLE_AREA_ID: "SETTLE_AREA_DIV",
	_DIM_ID: "SETTLE_LAYER_DIM",
	_IFRAME_ID: "SETTLE_IFRAME",
	_IFRAME_DIV_ID: "SETTLE_IFRAME_DIV",
	_FORM_ID: "SETTLE_FORM",
	_POPUP_ID: "SETTLE_POPUP",
	_CALLBACK: null,
	_PARAMS: ['mchtId', 'method', 'trdDt', 'trdTm', 'mchtTrdNo', 'mchtName', 'mchtEName', 'pmtPrdtNm', 'trdAmt', 'mchtCustNm', 'custAcntSumry', 'expireDt', 'notiUrl', 'nextUrl', 'cancUrl', 'mchtParam', 'cphoneNo', 'email', 'telecomCd', 'prdtTerm', 'mchtCustId', 'taxTypeCd', 'taxAmt', 'vatAmt', 'taxFreeAmt', 'svcAmt', 'cardType', 'chainUserId', 'cardGb', 'clipCustNm', 'clipCustCi', 'clipCustPhoneNo', 'certNotiUrl', 'skipCd', 'multiPay', 'autoPayType', 'linkMethod', 'appScheme', 'custIp', 'pktHash', 'corpPayCode', 'corpPayType', 'cashRcptUIYn', 'instmtMon', 'bankCd', 'csrcIssReqYn', 'cashRcptPrposDivCd', 'csrcRegNoDivCd', 'csrcRegNo'],

	_VALIDATION_MANDATORY_PARAMS: ['mchtId', 'method', 'mchtTrdNo', 'trdDt', 'trdTm', 'trdAmt', 'mchtName', 'notiUrl', 'nextUrl', 'cancUrl', 'pmtPrdtNm', 'pktHash'],
	_VALIDATION_CALLBACK_PARAMS: ['nextUrl', 'cancUrl'],
	_VALIDATION_METHOD_PARAMS: ['card', 'mobile', 'bank', 'vbank', 'vbank010', 'tmoney', 'point', 'culturecash', 'booknlife', 'happymoney', 'smartcash', 'teencash', 'corp'],

	pay: function (obj, callback) {
		this._CALLBACK = callback;
		var isError = false;
		try {
			if (!this.isNull(obj.env)) {
				this._SERVER_CONTEXT = obj.env;
			} else {
				alert("env is null");
				isError = true;
			}

			if (!this.isNull(obj.ui)) {
				var validation = this.validation(obj);

				this.definePgUrl(obj);

				if (validation.isSeccess) {
					var type = obj.ui.type;

					if (type == "iframe") {
						SETTLE_PG.makeArea();
						SETTLE_PG.makeDim();
						SETTLE_PG.makeIframe(obj);
						SETTLE_PG.makeForm(obj);
					} else if (type == "popup") {
						SETTLE_PG.makeForm(obj);
						SETTLE_PG.makePopup();
					} else if (type == "self") {
						SETTLE_PG.makeForm(obj);
					} else if (type == "blank") {
						SETTLE_PG.makeForm(obj);
					}
				} else {
					alert(Msg.validation_err + " (" + validation.errMsg + ")");
				}
			} else {
				alert("ui is null");
				isError = true;
			}
		} catch (e) {
			console.log(e);
			alert(Msg.pay_err + " (" + e + ")");
			isError = true;
			this.deleteDim();
			SETTLE_PG.removePostMessage();
		}
		if (!isError) SETTLE_PG.makeFormSubmit();
	},

	definePgUrl: function (obj) {
		switch (obj.method) {
			case 'card':
				this._PG_URL = (obj.methodSub === 'direct') ? "/card/cardDirect.do" :
					(obj.methodSub === 'abroad') ? "/card/abroad/main.do" : "/card/main.do";
				break;
			case 'bank':
				this._PG_URL = "/bank/main.do";
				break;
			case 'vbank':
				this._PG_URL = (obj.methodSub === 'escro') ? "/vbank/escro.do" : "/vbank/main.do";
				break;
			case 'vbank010':
				this._PG_URL = "/vbank010/main.do";
				break;
			case 'mobile':
				this._PG_URL = (obj.methodSub === 'mtype') ? "/mobile/m/main.do" : "/mobile/main.do";
				break;
			case 'teencash':
				this._PG_URL = "/gift/teenCash/main.do";
				break;
			case 'happymoney':
				this._PG_URL = "/gift/happyMoney/main.do";
				break;
			case 'culturecash':
				this._PG_URL = "/gift/cultureCash/main.do";
				break;
			case 'smartcash':
				this._PG_URL = "/gift/smartCash/main.do";
				break;
			case 'booknlife':
				this._PG_URL = "/gift/booknlife/main.do";
				break;
			case 'tmoney':
				this._PG_URL = "/tmoney/main.do";
				break;
			case 'point':
				this._PG_URL = "/point/main.do";
				break;
			case 'corp':
				this._PG_URL = "/corp/main.do";
				break;
			default:
				this._PG_URL = "/undefined";
		}
	},

	makeArea: function () {
		var rand = Math.floor(Math.random() * 99999999);
		this._SETTLE_AREA_ID = "SETTLE_AREA_DIV_" + rand;

		var el = document.createElement("div");
		el.setAttribute("id", this._SETTLE_AREA_ID);

		document.getElementsByTagName("body")[0].appendChild(el);
	},

	makeIframe: function (obj) {
		var el = document.getElementById(this._SETTLE_AREA_ID);
		var ifrDiv = document.createElement("div");
		ifrDiv.setAttribute("id", this._IFRAME_DIV_ID);
		ifrDiv.style.position = "fixed";
		ifrDiv.style.width = "100%";
		ifrDiv.style.height = "100%";
		ifrDiv.style.top = "0";
		ifrDiv.style.left = "0";
		ifrDiv.style.zIndex = "100001";
		ifrDiv.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
		ifrDiv.style.backdropFilter = "blur(10px)";
		ifrDiv.style.display = "flex";
		ifrDiv.style.alignItems = "center";
		ifrDiv.style.justifyContent = "center";
		ifrDiv.style.transitionDuration = "0.75s";

		var iframeContainer = document.createElement("div");
		iframeContainer.style.position = "relative";
		iframeContainer.style.display = "inline-block";
  		
  		var styleSheet = document.createElement('style');
  		styleSheet.textContent = '@media print { /* ... */ }';
  		document.body.appendChild(styleSheet, 'beforeend');

		var iframe = document.createElement("iframe");
		iframe.setAttribute("frameborder", "0");
		iframe.setAttribute("scrolling", "auto");
		iframe.setAttribute("id", this._IFRAME_ID);
		iframe.setAttribute("name", this._IFRAME_ID);
		iframe.style.backgroundColor = "#fff";
		iframe.style.borderRadius = obj.ui.cornerRadius ? obj.ui.cornerRadius + "px" : "0px";
		iframe.style.width = (obj.ui.width ? obj.ui.width : '400') + "px";
		iframe.style.height = (obj.ui.height ? obj.ui.height : '700') + "px";
		this.addMediaQuery();

		iframeContainer.appendChild(iframe);

		if (obj.ui.showCloseButton === true) {
			var closeButton = document.createElement("button");
			closeButton.innerHTML =
				'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
				'<line x1="1" y1="1" x2="23" y2="23" stroke="black" stroke-width="2" />' +
				'<line x1="1" y1="23" x2="23" y2="1" stroke="black" stroke-width="2" />' +
				'</svg>';
			closeButton.style.position = "absolute";
			closeButton.style.top = "10px";
			closeButton.style.right = "10px";
			closeButton.style.zIndex = "100002";
			closeButton.style.background = "#fcfcfc";
			closeButton.style.border = "1px solid #ccc";
			closeButton.style.borderRadius = "4px";
			closeButton.style.padding = "5px";
			closeButton.style.cursor = "pointer";
			closeButton.onclick = function () {
				window.parent.postMessage(JSON.stringify({ action: "HECTO_IFRAME_CLOSE" }), "*");
			};
			iframeContainer.appendChild(closeButton);
		}

		ifrDiv.appendChild(iframeContainer);
		el.appendChild(ifrDiv);

		window.addEventListener("resize", this.iframeResize);
		SETTLE_PG.addPostMessage();
	},
	
	addMediaQuery: function () {
		var style = document.createElement('style');
		style.type = 'text/css';

		var mediaQuery = "@media (max-width: 500px) { " +
			"#" + this._IFRAME_DIV_ID + ", " +
			"#" + this._IFRAME_ID + " { " +
				"width: 100vw !important; " +
				"height: 100vh !important; " +
			"} " +
			"#" + this._IFRAME_DIV_ID + " { " +
				"top: 0 !important; " +
				"left: 0 !important; " +
				"bottom: 0 !important; " +
				"right: 0 !important; " +
			"} " +
		"}";

		style.innerHTML = mediaQuery;
		document.head.appendChild(style);
	},

	iframeResize: function () {
		var el = document.getElementById(SETTLE_PG._IFRAME_DIV_ID);
		if (el) {
			el.style.width = "100%";
			el.style.height = "100%";
		}
	},

	makeDim: function () {
		var el = document.createElement("div");
		el.setAttribute("id", this._DIM_ID);
		el.setAttribute("style", "width:100%; height: 100%; z-index:9999; position:fixed; top:0px; left:0px; opacity: 0.4;");

		document.getElementById(this._SETTLE_AREA_ID).appendChild(el);
	},

	deleteDim: function () {
		var el = document.getElementById(this._SETTLE_AREA_ID);
		if (el) el.remove();
	},

	makePopup: function () {
		var xpos = Math.max((screen.width - 500) / 2, 0);
		var ypos = Math.max((screen.height - 800) / 3, 0);
		var windowStatus = 'left=' + xpos + ',top=' + ypos + ',height=800,width=500,location=no,menubar=no,scrollbars=yes,status=no,titlebar=no,toolbar=no,resizable=yes';

		var payPopup = window.open("", this._POPUP_ID, windowStatus);
		setTimeout(function () {
			if (payPopup == null) alert(Msg.popup_err);
		}, 1000);
	},

	isNull: function (obj) {
		return obj === undefined || obj === '';
	},

	validation: function (obj) {
		var result = { isSeccess: true };

		if (!this.isNull(obj.ui)) {
			if (obj.ui.type !== 'iframe') {
				for (var i = 0; i < this._VALIDATION_CALLBACK_PARAMS.length; i++) {
					if (this.isNull(obj[this._VALIDATION_CALLBACK_PARAMS[i]])) {
						result.isSeccess = false;
						result.errMsg = this._VALIDATION_CALLBACK_PARAMS[i] + " is null";
						break;
					}
				}
			}

			for (var i = 0; i < this._VALIDATION_MANDATORY_PARAMS.length; i++) {
				if (this._VALIDATION_MANDATORY_PARAMS[i] === "method" &&
					this._VALIDATION_METHOD_PARAMS.indexOf(obj[this._VALIDATION_MANDATORY_PARAMS[i]]) === -1) {
					result.isSeccess = false;
					result.errMsg = this._VALIDATION_MANDATORY_PARAMS[i] + " is wrong";
					break;
				}
				if (this.isNull(obj[this._VALIDATION_MANDATORY_PARAMS[i]])) {
					result.isSeccess = false;
					result.errMsg = this._VALIDATION_MANDATORY_PARAMS[i] + " is null";
					break;
				}
			}
		} else {
			result.isSeccess = false;
			result.errMsg = "ui is null";
		}
		return result;
	},

	makeForm: function (obj) {
		var el = document.getElementsByTagName("body")[0];
		var settleForm = document.createElement("form");
		settleForm.setAttribute("id", this._FORM_ID);
		settleForm.setAttribute("method", "POST");
		settleForm.setAttribute("action", this._SERVER_CONTEXT + this._PG_URL);

		if (obj.ui.type === "iframe") {
			settleForm.setAttribute("target", this._IFRAME_ID);
		} else if (obj.ui.type === "popup") {
			settleForm.setAttribute("target", this._POPUP_ID);
		} else if (obj.ui.type === "self") {
			settleForm.setAttribute("target", "_self");
		} else if (obj.ui.type === "blank") {
			settleForm.setAttribute("target", "_blank");
		}

		settleForm.appendChild(this.makeFormInput("type", obj.ui.type));
		for (var i = 0; i < this._PARAMS.length; i++) {
			var tmp = obj[this._PARAMS[i]];
			if (this.isNull(tmp)) tmp = "";
			settleForm.appendChild(this.makeFormInput(this._PARAMS[i], tmp));
		}
		el.appendChild(settleForm);
	},

	makeFormInput: function (name, value) {
		var settleInput = document.createElement("input");
		settleInput.setAttribute("type", "hidden");
		settleInput.setAttribute("name", name);
		settleInput.setAttribute("value", value);
		return settleInput;
	},

	makeFormSubmit: function () {
		var el = document.getElementById(this._FORM_ID);
		if (el) {
			el.submit();
			setTimeout(function () {
				if (el.parentNode) {
					el.parentNode.removeChild(el);
				}
			}, 1000);
		}
	},

	addPostMessage: function () {
		window.addEventListener("message", this.procPostMessage, false);
	},

	removePostMessage: function () {
		window.removeEventListener("message", this.procPostMessage, false);
	},

	procPostMessage: function (event) {
		var data;
		try {
			data = JSON.parse(event.data);
		} catch (e) {
			console.log(e);
		}

		if (data && data.action === "HECTO_IFRAME_CLOSE") {
			SETTLE_PG.closeIframe(data.params);
		} else if (data && data.action === "HECTO_IFRAME_RESIZE") {
			SETTLE_PG.resizeIframe(data.params);
		} else if (data && data.action === "HECTO_IFRAME_RETURNSIZE") {
			SETTLE_PG.returnSizeIframe();
		}
	},

	closeIframe: function (data) {
		this.deleteDim();
		this._CALLBACK(data);
		SETTLE_PG.removePostMessage();
	},

	resizeIframe: function (data) {
		this._LAYER_WIDTH = data.width;
		var el = document.getElementById(this._IFRAME_ID);
		el.setAttribute("width", this._LAYER_WIDTH);
		this.iframeResize();
	},

	returnSizeIframe: function () {
		this._LAYER_WIDTH = 500;
		var el = document.getElementById(this._IFRAME_ID);
		el.setAttribute("width", this._LAYER_WIDTH);
		this.iframeResize();
	}
};