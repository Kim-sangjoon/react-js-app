requires("uiplugin.popup");

// =============================================================================
/**
 * 전체 Scope에서 공유되는 Global 전역 변수, 상수, 공통 함수를 작성한다.
 *
 * @author 박상규
 * @class gcm
 * @namespace gcm
 * @description
- gcm 객체는 WFrame Scope이 고려될 필요가 없고, com 공통 함수 객체나 전역에서 사용할 함수만을 작성한다.
- gcm 객체는 WFrame Scope별로 생성되지 않고, 전역 객체로 1개만 생성된다.
- gcm 객체 내에서는 함수를 호출한 화면의 Scope을 찾을 수 없기 때문에 Scope 확인이 필요한 경우 $p 객체를 파라미터로 전달해야 한다.

※ 주의사항
- gcm 객체 내 변수와 함수는 업무 화면 개발 시에는 사용 금지
 */
// =============================================================================

var gcm = {
	// 서버 통신 서비스 호출을 위한 Context Path
	CONTEXT_PATH : "",

	// 서버 통신 서비스 호출을 위한 Service Url (Context Path 이하 경로)
	SERVICE_URL : "",

	// 서버 통신 기본 모드 ( "asynchronous" / "synchronous")
	DEFAULT_OPTIONS_MODE : "asynchronous",

	// 서버 통신 기본 미디어 타입
	DEFAULT_OPTIONS_MEDIATYPE : "application/json",

	// 통신 상태 코드
	MESSAGE_CODE : {
		STATUS_ERROR : "E",
		STATUS_SUCCESS : "S",
		STATUS_WARNING : "W"
	},

	// 메세지 알림 콜백 Function 정보 저장
	CB_FUNCTION_MANAGER : {
		cbFuncIdx : 0, // 정보 저장 Index Key
		cbFuncSave : {}
	// 정보 저장 객체
	},

	// 메인 레이아웃(MDI, SDI)
	WORK_LAYOUT_TYPE : "SDI",

	// Editor 내에 Import되는 이미지 파일 업로드 URL
	EDITOR_IMAGE_UPLOAD_URL : "/cmm/fileMgmt/v1/createImages",

	// 공통 메시지
	COMMON_MESSAGE : [],

	// 사용자 로그인 정보
	USER_LOGIN_INFO : {},

	// 항목 설정 구분자
	ITEM_DELIMITER : "|",

	WEBSQUARE_MAIN_PAGE : "index.html"
};




// =============================================================================
/**
 * 화면 제어와 관련된 함수를 작성한다.
 *
 * @author 박상규
 * @class win
 * @namespace gcm.win
 */
 // =============================================================================
gcm.win = {}

/**
 * 다국어 처리함수
 *
 * @param {String} xmlUrl 전체 URL중 w2xPath이하의 경로
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 */
gcm.win._getI18NUrl = function(xmlUrl) {

	// 다국어 예제 프로그램(S00001843)만 다국어 처리 로직을 타도록 예외 처리함
	if (xmlUrl.indexOf("/service/p/S00001843") > -1) {
		var baseURL = gcm.CONTEXT_PATH + "/cmm/multiLang/v1/I18N";
		var rsUrl;
		var locale = WebSquare.cookie.getCookie("locale");
		var bXml = "/blank.xml";
		xmlUrl = xmlUrl.replace(/\?.*/, '');
		xmlUrl = xmlUrl.replace(gcm.CONTEXT_PATH, '');

		if (xmlUrl.search(bXml) > -1 && xmlUrl.search(WebSquare.baseURI) == -1) {
			xmlUrl = WebSquare.baseURI + "/blank.xml";
		}
		rsURL = baseURL + "?w2xPath=" + xmlUrl;

		if (locale != null && locale != '') {
			rsURL = rsURL + "&locale=" + unescape(locale);
		}

		return rsURL;
	} else {
		return xmlUrl;
	}
};


/**
 * 브라우저 Back, Forward 발생 시 onPopState 이벤트를 등록한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 * @example gcm.win._setHistoryBackEvent();
 */
gcm.win._setHistoryBackEvent = function() {
	if (window.addEventListener) {
		window.addEventListener("popstate", gcm.win._changePageState);
	} else {
		window.attachEvent("popstate", gcm.win._changePageState);
	}
};

/**
 * history.pushState API를 호출해서 브라우저에서 History 상태를 기록한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.win._pushState(option.dataObject.data, menuInfo);
 */
gcm.win._pushState = function(data, menuInfo) {
	history.pushState({ "data" : data }, menuInfo.menuNm, "index.html?menuId=" + menuInfo.menuId);
};

/**
 * 브라우저 Back, Forward 발생 시 onPopState 이벤트 처리를 수행한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 * @example gcm.win._changePageState();
 */
gcm.win._changePageState = function() {
	if(!com.util.isEmpty(history.state) && !com.util.isEmpty(history.state.data) && !com.util.isEmpty(history.state.data._menuInfo)){
		$p.top().scwin.hideMainLayOut();
		var options = {};
		options.isHistory = false;
		options.isExtend = true;
		com.win.openMenu(history.state.data._menuInfo.menuId, history.state.data, options);
	}else{
		$p.top().scwin.openMainLayout(false);
	}
};


/**
 * Window.onBeforeUnload 이벤트를 추가한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 * @example gcm.win._addEventOnBeforeUnload();
 */
gcm.win._addEventOnBeforeUnload = function() {
	if (window.addEventListener) {
		window.addEventListener("beforeunload", gcm.win._setOnBeforeUnload);
	} else {
		window.attachEvent("onbeforeunload", gcm.win._setOnBeforeUnload);
	}
};


/**
 * Window.onBeforeUnload 이벤트를 삭제한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 * @example gcm.win._removeEventOnBeforeUnload();
 */
gcm.win._removeEventOnBeforeUnload = function() {
	if (window.removeEventListener) {
		window.removeEventListener("beforeunload", gcm.win._setOnBeforeUnload);
	} else {
		window.detachEvent("onbeforeunload", gcm.win._setOnBeforeUnload);
	}
};


/**
 * Window.onBeforeUnload 이벤트 발생 시 페이지를 떠날 것인지 확인한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 * @example gcm.win._setOnBeforeUnload();
 */
gcm.win._setOnBeforeUnload = function(e) {
	var e = e || window.event;

	// For IE and Firefox
	if (e) {
		e.returnValue = 'Leaving the page';
	}

	// For Safari
	return 'Leaving the page';
};


/**
 * Container 영역의 URL을 이동한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @param {String} link Container 영역에 오픈할 URL
 * @param {Object} data 화면 오픈 시 전달할 Data 객체
 * @author 박상규
 * @example gcm.win._setPage("/ui/fee/money_msearch_view1.xml");
 *
 * var data = {}; data.dataInfo = rowData; data.searchParam = dma_searchParam.getJSON(); gcm.win._setPage("/ui/fee/money_msearch_view3.xml", data); // 새로 열리는
 * 화면에 data 객체 전달
 */
gcm.win._setPage = function(link, data) {
	com.win.closeAllPopup();
	gcm.win._removeEventOnBeforeUnload();

	if (com.isEmpty(data)) {
		$p.top().container.setSrc(gcm.CONTEXT_PATH + link);
	} else {
		var options = {
			dataObject : {
				type : "json",
				name : "param",
				data : data
			}
		};
		$p.top().container.setSrc(gcm.CONTEXT_PATH + link, options);
	}
};


/**
 * 특정 컴포넌트가 속한 WFrame Scope을 반환한다.
 *
 * @param {Object} 컴포넌트 객체 또는 아이디(WFrame Scope 경로를 포함한 Full Path Id)
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 */
gcm.win._getScope = function(comObj) {
	if (typeof comObj === "string") {
		var scopeObj = com.util.getComponent(comObj);
		if (scopeObj !== null) {
			return scopeObj.getScopeWindow();
		}
	} else {
		return comObj.getScopeWindow();
	}
};


/**
 * MDI 레이아웃에서 메뉴를 오픈한다.
 *
 * @param {String} menuId 메뉴 아이디
 * @param {Object} paramData 전달할 데이터 객체
 * @param {Boolean} isHistory 브라우저 History에 기록할 지 여부 (기본값은 true)
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 */
gcm.win._openMenuMDI = function(menuId, paramData, openOpt) {
	var menuInfoArr = $p.top().dlt_menu.getMatchedJSON("menuId", menuId);
	var menuInfo = null;

	if (menuInfoArr.length > 0) {
		menuInfo = menuInfoArr[0];
	} else {
		var alertMsg = com.data.getMessage("com.alt.0015") || "<b>페이지를 찾을 수 없습니다.</b> <br><br>요청하신 페이지가 존재하지 않거나 조회 권한이 없습니다.<br> 담당자에게 문의하시기 바랍니다.";
		com.win.alert(alertMsg);
		return;
	}

	if (!com.util.isEmpty(openOpt) && !com.util.isEmpty(openOpt.menuInfo)) {
		if(!com.util.isEmpty(openOpt.menuInfo.menuNm)) {
			menuInfo.menuNm = openOpt.menuInfo.menuNm;
		}

		if(!com.util.isEmpty(openOpt.menuInfo.location)) {
			menuInfo.location = openOpt.menuInfo.location;
		}
	}

	if (com.util.isEmpty(openOpt)) {
		openOpt = {};
	}

	if (com.util.isEmpty(menuInfo.srcPath) === false) {

		var menuId = menuInfo.menuId;


		if(!com.util.isEmpty($p.top())){
			var scwinObj = $p.top().scwin;
			if(!com.util.isEmpty(scwinObj)){
				 if(typeof scwinObj.updateRecMenu  === "function"){
					 scwinObj.updateRecMenu(menuId);
				 }
			}
		}

		if ( menuInfo.popuScrnYn  == "W") {
			window.open(menuInfo.srcPath);
			return;
		}


		var tabObj = {
			label : menuInfo.menuNm,
			closable : true,
			openAction :  openOpt.openAction || "select"
		};

		var data = {};
		if (com.util.isEmpty(paramData) === false) {
			data = paramData;
			data["_menuInfo"] = menuInfo;
		} else {
			data["_menuInfo"] = menuInfo;
		}

		var option = {
			frameMode : "wframePreload",
			scope : true,
			src : menuInfo.srcPath,
			alwaysDraw : false,
			title : menuInfo.menuNm,
			dataObject : {
				type : "json",
				name : "param",
				data : data
			}
		};

		if(menuInfo.popuScrnYn == "N" || menuInfo.popuScrnYn == "H"){
			var tabId = $p.top().tac_content.addTab(menuId, tabObj, option);
		}

		if ((typeof openOpt.isHistory === "undefined") || (openOpt.isHistory === true)  && com.util.isEmpty(tabId)) {
			gcm.win._pushState(option.dataObject.data, menuInfo);
		}

		if ($p.top().tac_content.getSelectedTabID() !== tabId && !com.util.isEmpty($p.top().tac_content.getTabIndex(tabId))) {
			$p.top().tac_content.setSelectedTabIndex($p.top().tac_content.getTabIndex(tabId));
		}

	}
	gcm.win._menuTreeExtend(menuId , {"isExtend" : openOpt.isExtend});
};


/**
 * SDI 레이아웃에서 메뉴를 오픈한다.
 *
 * @param {String} menuId 메뉴 아이디
 * @param {Object} paramData 전달할 데이터 객체
 * @param {Boolean} isHistory 브라우저 History에 기록할 지 여부
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 */
gcm.win._openMenuSDI = function(menuId, paramData, openOpt) {
	var menuInfoArr = $p.top().dlt_menu.getMatchedJSON("menuId", menuId);
	var menuInfo = null;

	if (menuInfoArr.length > 0) {
		menuInfo = menuInfoArr[0];
	} else {
		var alertMsg = com.data.getMessage("com.alt.0015") || "<b>페이지를 찾을 수 없습니다.</b> <br><br>요청하신 페이지가 존재하지 않거나 조회 권한이 없습니다.<br> 담당자에게 문의하시기 바랍니다.";
		com.win.alert(alertMsg);
		return;
	}

	if (!com.util.isEmpty(openOpt) && !com.util.isEmpty(openOpt.menuInfo)) {
		if(!com.util.isEmpty(openOpt.menuInfo.menuNm)) {
			menuInfo.menuNm = openOpt.menuInfo.menuNm;
		}

		if(!com.util.isEmpty(openOpt.menuInfo.location)) {
			menuInfo.location = openOpt.menuInfo.location;
		}
	}

	if (com.util.isEmpty(openOpt)) {
		openOpt = {};
	}

	if (com.util.isEmpty(menuInfo.srcPath) === false) {
			//변경된 데이터가 있는 경우 메뉴이동 여부를 물음
			var topFrame = $p.top();
			if(menuInfo.popuScrnYn !="W") {
				if(!com.util.isEmpty(topFrame) && topFrame.com.util.getComponent("wfm_content")){
					var wfmContent = topFrame.com.util.getComponent("wfm_content");
					if (typeof topFrame.scwin.closeBeforePage ==="function"){
						var isModified = topFrame.scwin.closeBeforePage(wfmContent);
						if(!isModified){
							return false;
						}
					}
				}
			}

			//최근메뉴 기록
			var loginInfo = com.win.getUserLoginInfo();
			if (!$.isEmptyObject(loginInfo)) {
				if(!com.util.isEmpty($p.top())){
					var scwinObj = $p.top().scwin;
					if(!com.util.isEmpty(scwinObj)){
						if(typeof scwinObj.updateRecMenu  === "function"){
							scwinObj.updateRecMenu(menuId);
						}
					}
				}
			}



		if ( menuInfo.popuScrnYn  == "W") {
			window.open(menuInfo.srcPath);
			return;
		}

		var data = {};
		if (com.util.isEmpty(paramData) === false) {
			data = paramData;
			data["_menuInfo"] = menuInfo;
		} else {
			data["_menuInfo"] = menuInfo;
		}

		var option = {
			dataObject : {
				type : "json",
				name : "param",
				data : data
			}
		};

		$p.top().wfm_content.setSrc(menuInfo.srcPath, option);

		if ((typeof openOpt.isHistory === "undefined") || (openOpt.isHistory === true)) {
			gcm.win._pushState(option.dataObject.data, menuInfo);
		}
	}

	gcm.win._menuTreeExtend(menuId , {"isExtend" : openOpt.isExtend});
};



/**
 * 오픈한 메뉴의 트리를 모두 펼친다.
 *
 * @param {String} menuId 메뉴 아이디
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 김응한
 */
gcm.win._menuTreeExtend  = function(menuId ,openOpt) {
	var matchedJSON = $p.top().dlt_menu.getMatchedJSON("menuId",menuId);
	if (com.util.isEmpty(openOpt)) {
		openOpt = {};
	}
	if (matchedJSON.length>0) {
		var indexPath = matchedJSON[0].indexPath;
		if (!com.util.isEmpty(indexPath) && typeof indexPath == "string") {
			var indexArr = indexPath.split(",");

			var topFrame = $p.top();
			if (com.util.isEmpty(topFrame.com)) {
				topFrame = WebSquare.util.getMainFrame();
			}

			var genTopMenu = topFrame.com.util.getComponent("gen_topMenu");
			if(!com.util.isEmpty(genTopMenu)){
				var topCnt = genTopMenu.getChildrenCount();
				if ( topCnt >0 ) {
					var topIdx = indexArr.shift();
					var btnTopMenu = genTopMenu.getChild(topIdx,"btn_topMenu");
					var isCurrent = btnTopMenu.getParent().hasClass("current");

					if (!com.util.isEmpty(btnTopMenu) && !isCurrent) {
						$("#"+genTopMenu.id + " >li").removeClass("current");

						$p.top().scwin.hideMainLayOut();
						var topMenuId = btnTopMenu.getUserData("menuId");
						var menuNm = btnTopMenu.getUserData("menuNm");
						var srcPath = btnTopMenu.getUserData("srcPath");
						var idx = btnTopMenu.getUserData("idx", idx);
						var popuScrnYn = btnTopMenu.getUserData("popuScrnYn");
						if (popuScrnYn !="W") {
							$("#"+genTopMenu.id + " >li").removeClass("current");
							btnTopMenu.getParent().addClass("current");
							var subMenugen  = com.util.getComponent("gen_menuDepth1");
							subMenugen.removeAll();
							var tbxTopMenuNm = $p.top()["tbx_topMenuNm"];
							if(!com.util.isEmpty(tbxTopMenuNm)){
								tbxTopMenuNm.setValue(menuNm);
							}

							var menuLevel = "1";
							var menuList = $p.top().dlt_menu.getMatchedJSON("parentMenuId", topMenuId);
							var genMenuDepth = $p.getComponentById("gen_menuDepth" + 1);
							$p.top().scwin.createSubMenu(genMenuDepth.id, menuLevel, menuList, menuNm,idx);
							$p.top().scwin.setAccordionNav(false);
						}

						if ($('.side').hasClass("on")) {
							$p.top().scwin.btn_myMenu_onclick();
						}

					}
				}
			}
			if (indexArr.length>0) {
				var genIdx = 1;
				var genMenuDepth = $p.top().com.util.getComponent("gen_menuDepth" +genIdx);
				for (var idx = 0; idx < indexArr.length; idx++) {
					var grpMenuDepth = genMenuDepth.getChild(indexArr[idx] ,"grp_menuDepth"+ (idx+1));
					if (!com.util.isEmpty(grpMenuDepth) && !com.util.isEmpty($(grpMenuDepth.render).parent())) {
						if ($(grpMenuDepth.render).parent().hasClass("hasChild") && !$(grpMenuDepth.render).parent().hasClass("on")) {
							$(grpMenuDepth.render).parent().addClass('on');
							if(openOpt.isExtend) {
								$(grpMenuDepth.render).next('ul').slideToggle('fast');
							}
						}
						if (idx+1  == indexArr.length) {
							if(grpMenuDepth.getUserData("srcPath") !="") {
								$('nav.lnb_list li').removeClass('current');
								$(grpMenuDepth.render).parent().addClass('current');
							}
						}
					}
					genMenuDepth = genMenuDepth.getChild(indexArr[idx] ,"gen_menuDepth"+ (idx+2));
				}
			}
		}
	}
};


/**
 * 화면이 오픈될 때 화면의 상태를 설정한다.
 *
 * @private
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 박상규
 */
gcm.win._setWindowStatus = function() {
	if (com.win.isPopup()) {
		$(".sub_wrapper").addClass("wpop");
	}
};


/**
 * 로그인 사용자 정보를 조회한다 완료후에 메뉴를 조회한다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 김응한
 * @param {Boolean} isShow 사이드 메뉴 보기 true or false
 * @example
gcm.win._getRetrieveUserInfo();  //left 메뉴 보기
*/
gcm.win._getRetrieveUserInfo = function () {
	var option = {
			 id : "sbm_retrieveUserInfo",
			 action : gcm.CONTEXT_PATH + "/login/v1/retrieveUserInfo",
			 method : "get",
			 submitDoneHandler : function(res) {
			 	gcm.USER_LOGIN_INFO = res.responseJSON.SERVER_RESULT;
			 	var userName = gcm.USER_LOGIN_INFO.userNm || "" ;
			 	var clsfNm = gcm.USER_LOGIN_INFO.clsfNm || "";

			 	if(typeof gcm.USER_LOGIN_INFO === "object" &&  !$.isEmptyObject(gcm.USER_LOGIN_INFO)) {
			 		if ( com.win.isPopup() === false ) {
			 			gcm.win._loadMenu("10100001");
			 		}else {
			 			if(location.href.indexOf(gcm.WEBSQUARE_MAIN_PAGE)> -1) {
			 				gcm.win._loadMenu("10100001");
			 			}
			 		};

			 		if(typeof $p.top === "function") {
			 			try {
							if ( com.win.isPopup() && !com.util.isEmpty(window.opener.WebSquare)) {
								var topFrame = $p.top();
								if (com.util.isEmpty(topFrame.com)) {
									topFrame = WebSquare.util.getMainFrame();
								}

								topFrame.com.win._loadUserSetInfo();
								topFrame.com.win._setProgramAuthority();
								topFrame.com.win._processCommonData();
				 			}
						} catch (e) {

						}
			 		}
			 	} else {
			 		if ( com.win.isPopup() === false ) {
			 			gcm.win._loadMenu("10100002");
			 		}else {
			 			try {
							if (com.util.isEmpty(window.opener.WebSquare)) {
				 				gcm.win._loadMenu("10100002");
				 			}
						} catch (e) {
							gcm.win._loadMenu("10100002");
						}
			 		};
			 	}

			 	if(!com.util.isEmpty($p.top)) {
			 		if(!com.util.isEmpty($p.top().btn_userNm)) {
				 		if (!com.util.isEmpty(clsfNm)) {
				 			userName = userName + " "+ clsfNm;
				 		}
				 		$p.top().btn_userNm.setValue(userName);
				 	}
				 	else if(!com.util.isEmpty($p.top().wfm_content.getWindow().btn_userNm)) {
				 		if (!com.util.isEmpty(clsfNm)) {
				 			userName = userName + " "+ clsfNm;
				 		}
				 		$p.top().wfm_content.getWindow().btn_userNm.setValue(userName);
				 	}

			 		if(typeof $p.top().scwin == "object" && typeof $p.top().scwin.initPushService == "function") {
			 			$p.top().scwin.initPushService();	// push 연결
			 		}
			 	}
			 }
		};
	com.sbm.executeDynamic(option);
};

/**
 * 메뉴목록을 읽어온다.
 *
 * @memberOf gcm.win
 * @date 2019.11.16
 * @author 김응한
 * @param {String} parentMenuId 최상위 메뉴 아이디
 * @example
gcm.win._loadMenu("10100001");
*/
gcm.win._loadMenu = function ( parentMenuId ) {

	var topFrame = $p.top();
	if (com.util.isEmpty(topFrame.com)) {
		topFrame = WebSquare.util.getMainFrame();
	}

	if(!com.util.isEmpty($p.top().scwin) && typeof topFrame.scwin.loadMenuCall === "function"){
		topFrame.scwin.loadMenuCall(parentMenuId);
	}
};


/**
 * 에러메시지 박스 호출함수 서버에서 전달한 validate message를 보여준다
 *
 * @private
 * @memberOf gcm.win
 * @param {Object} messageStr 오류메시지
 * @param {Object} closeCallbackFncName 콜백함수
 * @param {Object} opts 팝업옵션
 * @date 2019.11.16
 * @author 김응한
 * @example
gcm.win._errMessagBox("에러입니다", "",opts);
gcm.win._errMessagBox("에러입니다 || 에러입니다1", "",opts);
 */
gcm.win._errMessagBox = function(messageStr,closeCallbackFncName, opts) {
	try {
		var messageStr = messageStr || "";
		var popId = "errorPopup";
		popId = popId + (Math.random() * 16).toString().replace(".","");
		//closeCallBackFnc 정보관리
		if (typeof closeCallbackFncName == "function") {
			var cbFuncIdx = ++gcm.CB_FUNCTION_MANAGER["cbFuncIdx"];
			var idx = "__close_callback_Func__" + new Date().getTime() + "_" + cbFuncIdx;
			gcm.CB_FUNCTION_MANAGER["cbFuncSave"][$p.id + idx] = closeCallbackFncName;
			closeCallbackFncName = idx;
		}

		if(com.util.isEmpty(opts)){
			opts = {};
		}

		if(typeof opts.params !=="object"){
			opts.params = {};
		}

		var data = {
			"message": messageStr,
			"callbackFn": closeCallbackFncName,
			"id": popId,
			"params" : opts.params
		};

		var popupHeight = 0;
		if (com.util.isMobile()) {
			popupHeight = 264;
		} else {
			popupHeight = 212;
		}

		var options = {
			id: popId,
			popupName: popId,
			width: 462,
			height: popupHeight,
			className : "messagebox"

		};

		com.win.openPopup("/common/xml/commonErrMessageBox.xml", options, data);
	} catch (ex) {
		console.error(ex);
	}
};


// =============================================================================
/**
 * Top 영역의 전역 DataCollection 및 전역 데이터 제어와 관련된 함수를 작성한다.
 *
 * @author 박상규
 * @class data
 * @namespace gcm.data
 */
// =============================================================================

gcm.data = {}


/**
 * Session Storage에서 데이터를 가져온다.
 *
 * Session Storage에 저장된 데이터는 페이지 세션이 종료되면 바로 지워진다.
 * 페이지 세션은 현재 페이지가 새로고침 되어도 유지된다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 저장된 데이터
 * @example
var value = gcm.data._getSessionStorageItem("userInfo");

// 반환된 데이터가 JSON 객체 문자열인 경우 JSON 객체로 변환
var value = com.util.getJSON(gcm.data._getSessionStorageItem("userInfo"));
 */
gcm.data._getSessionStorageItem = function(key) {
	return sessionStorage.getItem(key);
};


/**
 * Session Storage에 데이터를 저장한다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @param {Object} value 저장할 데이터
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._setSessionStorageItem("userInfo", "A000001");
var userInfo = {
	userId : "A000001",
	userName : "홍길동"
};
gcm.data._setSessionStorageItem("userInfo", com.str.serialize(userInfo));
 */
gcm.data._setSessionStorageItem = function(key, value) {
	sessionStorage.setItem(key, value);
};


/**
 * Session Storage에 저장된 데이터를 삭제한다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @param {Object} value 저장할 데이터
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._removeSessionStorageItem("userInfo");
 */
gcm.data._removeSessionStorageItem = function(key) {
	sessionStorage.removeItem(key);
};


/**
 * Session Storage에 저장된 데이터를 모두 삭제한다.
 *
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._clearSessionStorage();
 */
gcm.data._clearSessionStorage = function() {
	sessionStorage.clear();
};


/**
 * Local Storage에서 데이터를 가져온다.
 *
 * Local Storage에 저장된 데이터는 브라우저가 종료되어도 만료 기간 없이 데이터를 삭제하기 전까지 계속 유지된다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 저장된 데이터
 * @example
var value = gcm.data._getLocalStorageItem("userInfo");

// 반환된 데이터가 JSON 객체 문자열인 경우 JSON 객체로 변환
var value = com.util.getJSON(gcm.data._getLocalStorageItem("userInfo"));
 */
gcm.data._getLocalStorageItem = function(key) {
	return localStorage.getItem(key);
};


/**
 * Local Storage에 데이터를 저장한다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @param {Object} value 저장할 데이터
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._setLocalStorageItem("userInfo", "A000001");
var userInfo = {
	userId : "A000001",
	userName : "홍길동"
};
gcm.data._setLocalStorageItem("userInfo", com.str.serialize(userInfo));
 */
gcm.data._setLocalStorageItem = function(key, value) {
	localStorage.setItem(key, value);
};


/**
 * Local Storage에 저장된 데이터를 삭제한다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @param {Object} value 저장할 데이터
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._removeLocalStorageItem("userInfo");
 */
gcm.data._removeLocalStorageItem = function(key) {
	localStorage.removeItem(key);
};


/**
 * Local Storage에 저장된 데이터를 모두 삭제한다.
 *
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._clearLocalStorage();
 */
gcm.data._clearLocalStorage = function() {
	localStorage.clear();
};


/**
 * Cookie에서 데이터를 가져온다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 저장된 데이터
 * @example
var value = gcm.data._getCookieItem("userInfo");

// 반환된 데이터가 JSON 객체 문자열인 경우 JSON 객체로 변환
var value = com.util.getJSON(gcm.data._getCookieItem("userInfo"));
 */
gcm.data._getCookieItem = function(key) {
	return WebSquare.cookie.getCookie(key);
};


/**
 * Cookie에 데이터를 저장한다.
 *
 * 브라우저가 종료 시 Cookie에 저장된 데이터는 삭제된다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @param {Object} value 저장할 데이터
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._setCookieItem("userInfo", "A000001");
var userInfo = {
	userId : "A000001",
	userName : "홍길동"
};
gcm.data._setCookieItem("userInfo", com.str.serialize(userInfo));
 */
gcm.data._setCookieItem = function(key, value) {
	WebSquare.cookie.setCookie(key, value);
};

/**
 * Cookie에 저장된 데이터를 삭제한다.
 *
 * @param {String} key 데이터가 저장된 Key 값
 * @param {Object} value 저장할 데이터
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._removeCookieItem("userInfo");
 */
gcm.data._removeCookieItem = function(key) {
	WebSquare.cookie.delCookie(key);
};


/**
 * 유효성 검사 결과 메시지를 반환한다.
 *
 * @param {Object} valInfo 유효성 검사 옵션
 * @param {String} value 값
 * @return {Object} msgInfo 유효성 검사 결과 메시지 정보 <br/>
msgInfo.msgType {String} 메시지 타입("1" : 기본 검사 항목, "2" : 사용자 정의 함수(valInfo) 검사 항목) <br/>
msgInfo.message {String} 검사 결과 메시지 내용
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 * @example
gcm.data._getValResultMsg(valInfo, value);
 */
gcm.data._getValResultMsg = function(valInfo, value) {
	var msgInfo = { msgType : "1", message : "" };

	if ((typeof valInfo.mandatory !== "undefined") && (valInfo.mandatory === true) && (value.length === 0)) {
		msgInfo.message = com.data.getMessage("com.alt.0022") || "필수 입력 항목 입니다.";
	} else if ((typeof valInfo.minLength !== "undefined") && (valInfo.minLength > 0) && (value.length < valInfo.minLength)) {
		msgInfo.message = com.data.getMessage("com.alt.0023" , valInfo.minLength) || "최소 길이 " + valInfo.minLength + "자리 이상으로 입력해야 합니다.";
	} else if ((typeof valInfo.minByteLength !== "undefined") && (valInfo.minByteLength > 0) && (com.str.getByteLength(value) < valInfo.minByteLength)) {
		msgInfo.message =  com.data.getMessage("com.alt.0023" , valInfo.minByteLength) || "최소 길이 " + valInfo.minByteLength + "자리 이상으로 입력해야 합니다.";
	} else if ((typeof valInfo.isEmail !== "undefined") && (valInfo.isEmail) && (com.util.isEmpty(value) === false) && (com.str.isEmail(value) === false)) {
		msgInfo.message = "유효한 이메일 주소가 아닙니다.";
	} else if ((typeof valInfo.isPhone !== "undefined") && (valInfo.isPhone) && (com.util.isEmpty(value) === false) && (com.str.isPhone(value) === false)) {
		msgInfo.message = "유효한 전화번호가 아닙니다.";
	} else if (typeof valInfo.valFunc === "function") {
		var resultMsg = valInfo.valFunc(value);
		if (com.util.isEmpty(resultMsg) === false) {
			msgInfo.msgType = "2";
			msgInfo.message = resultMsg;
		}
	}

	return msgInfo;
};


/**
 * InputCalendar Validator를 수행한다.
 *
 * @param {String} value 입력된 날짜 문자열
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 김응한
 */
gcm.data._validateInputCalendar = function(value ,compId) {
	try {
		var compObj = com.util.getComponent(compId);
		if (!com.util.isEmpty(value)) {
			if (!compObj.sub_validator.validate(value)) {
				var msg = com.data.getMessage("com.alt.0021","날짜형식") || "날짜 형식이 올바르지 않습니다.";
				com.win.toast(msg);
			}
		}
		return value;
	} catch (ex) {
		console.error(ex);
		return value;
	}
};


/**
 * 공통 메시지 데이터를 로딩한다.
 *
 * @memberOf gcm.data
 * @date 2019.11.16
 * @author 박상규
 */
gcm.data._loadCommonMessage = function() {

	var topFrame = $p.top();
	if (com.util.isEmpty(topFrame.com)) {
		topFrame = WebSquare.util.getMainFrame();
	};

	var dltGrdComp;
	if (!com.util.isEmpty(topFrame)) {
		dltGrdComp = topFrame.com.util.getComponent("dlt_commonMessage");
	}else{
		dltGrdComp = com.util.getComponent("dlt_commonMessage");
	}
	if(com.util.isEmpty(dltGrdComp)){
		var dcoptions = {
				baseNode : "list",
				repeatNode : "map",
				saveRemovedData : "true"
		};

		if (!com.util.isEmpty(topFrame)) {
			topFrame.com.data.createDataList("dlt_commonMessage", ["sysMsgId","sysMsgNm"], ["text", "text"] , dcoptions);
		}else{
			com.data.createDataList("dlt_commonMessage", ["sysMsgId","sysMsgNm"], ["text", "text"] , dcoptions);
		}

	}
	var lengCode = com.win.getLanguage() || "ko";
	var option = {
			id : "sbm_commonMessage",
			action : gcm.CONTEXT_PATH + "/cmm/sysMsgMgmt/v1/retrieveSysMsgList/null/"+lengCode+"/null/all/null/N",
			method : "get",
			isShowMeg : true,
			submitDoneHandler : function(res) {
				var topFrame = $p.top();
				if (com.util.isEmpty(topFrame.com)) {
					topFrame = WebSquare.util.getMainFrame();
				};

				if (!com.util.isEmpty(topFrame)) {
					dltComp = topFrame.com.util.getComponent("dlt_commonMessage");
				}else{
					dltComp = com.util.getComponent("dlt_commonMessage");
				}
				if(!com.util.isEmpty(dltComp)){
					dltComp.setJSON(res.responseJSON.SERVER_RESULT);
				}
			}
	};

	if (!com.util.isEmpty(topFrame)) {
		topFrame.com.sbm.executeDynamic(option);
	}else{
		com.sbm.executeDynamic(option);
	}

};


// =============================================================================
/**
 * 서비스 통신과 관련된 공통 로직 제어와 관련된 함수를 작성한다.
 *
 * config.xml에 정의된 Submission PreSubmit, CallSubmitFunc, ExnteralHandler 함수를 gcm.sbm 객체 아래에 작성한다.
 *
 * @author 박상규
 * @class sbm
 * @namespace gcm.sbm
 */
// =============================================================================

gcm.sbm = {}

/**
 * submission의 공통 설정에서 사용.
 * submisison 통신 직전 호출.
 * return true일 경우 통신 수행, return false일 경우 통신 중단
 *
 * @param {Object} sbmObj 서브미션 객체
 * @memberOf gcm.sbm
 * @date 2019.11.16
 * @author 박상규
 * @return {Boolean} true or false
 */
gcm.sbm._preSubmitFunction = function(sbmObj) {
	if (sbmObj.action.indexOf(gcm.CONTEXT_PATH) === -1) {
		sbmObj.action = gcm.CONTEXT_PATH + sbmObj.action;
	}

	if (com.util.isEmpty(sbmObj.submitDoneHandler) === false) {
		var userEventList = [];
		for (var idx in sbmObj.userEventList) {
			if (sbmObj.userEventList[idx].name !== "xforms-submit-done") {
				userEventList.push(sbmObj.userEventList[idx]);
			}
			sbmObj.userEventList = userEventList;
		}
	}
};


/**
 * 모든 submission의 defaultCallback - com.sbm_errorHandler 보다 먼저 수행됨. (400 Error) config.xml에 설정
 *
 * @param {Object} resObj responseData 객체
 * @param {Object} sbmObj Submission 객체
 * @memberOf gcm.sbm
 * @date 2019.11.16
 * @author 박상규
 */
gcm.sbm._callbackSubmitFunction = function(result, sbmObj) {
	var responseData = com.util.getJSON(result.responseJSON);
	var resObj = responseData.SERVER_RESULT;
	var msgObj = responseData.SERVER_MESSAGE;

	if ((com.util.isEmpty(msgObj) === false) && (msgObj.code === "401")) {
		com.win.alert(msgObj.message,
			function() {
				window.location = "/";
			}
		);
	} else if ((com.util.isEmpty(msgObj) === false) && (msgObj.code != "200") && (com.util.isEmpty(sbmObj.submitErrorHandler))) {
		var msgCd = msgObj.code;
		var vldObj = msgObj.validate;
		var errMsg;
		if (com.util.isEmpty(vldObj) === false){
			var errMsgArr =[];
			for(key in vldObj){
				errMsgArr.push(vldObj[key]);
			}
			errMsg = errMsgArr.join("||");

		} else if ( msgObj.message !="" ) {
			errMsg = msgObj.message;
		}

		if( !com.util.isEmpty(errMsg) ) {
			var paramObj = {"code":msgCd,"message":errMsg};
			var options ={
				"params":paramObj,
			}
			gcm.win._errMessagBox(errMsg, "",options);
		}

	} else if ((com.util.isEmpty(msgObj) === false) && (msgObj.code != "200") && (com.util.isEmpty(sbmObj.submitErrorHandler) === false)) {
		var submitErrorHandlerStr = sbmObj.getScopeWindow().$p.getFrameId() + "_" + sbmObj.submitErrorHandler;
		var submitErrorHandler = WebSquare.util.getGlobalFunction(submitErrorHandlerStr);
		submitErrorHandler(result);

	} else if (com.util.isEmpty(sbmObj.submitDoneHandler) === false) {
		if (typeof sbmObj.submitDoneHandler === "function") {
			 sbmObj.submitDoneHandler(result);
		} else {
			var submitDoneHandlerStr = sbmObj.getScopeWindow().$p.getFrameId() + "_" + sbmObj.submitDoneHandler;
			var submitDoneHandler = WebSquare.util.getGlobalFunction(submitDoneHandlerStr);
			submitDoneHandler(result);
		}
	}
};


/**
 * submission중 에러가 발생한 경우 호출되는 함수 - 서버 오류(500 error)
 *
 * @param {Object} resObj responseData 객체
 * @memberOf gcm.sbm
 * @date 2019.11.16
 * @author 박상규
 */
gcm.sbm._errorHandler = function(resObj) {

};


/**
 * Submission에 대한 Request를 서버에 보내기 전에, 서버에 전송할 데이터를 가공 처리 한다.
 *
 * @param {String} value Request Data
 * @param {String} submissionId Submission Id
 * @memberOf gcm.sbm
 * @date 2019.11.16
 * @author 박상규
 */
gcm.sbm._externalFunction = function(value, submissionId) {
	try {
		var sbmObj = com.util.getComponent(submissionId);
		if ((com.util.isEmpty(sbmObj.refSingleMode) === false) && (sbmObj.refSingleMode === true)) {
			var jsonObj = com.util.getJSON(value);
			var jsonKey = Object.keys(jsonObj);

			if (jsonKey.length === 1) {
				return com.str.serialize(jsonObj[jsonKey[0]]);
			}
		}
	} catch (ex) {
		console.error(ex);
	}
	return value;
};


/**
 * Submission에 대한 Response가 서버에서 오면, 화면에 데이터를 전달되기 전에, 데이터에 대한 가공 처리를 한다.
 *
 * @param {String} value Response Data
 * @param {String} submissionId Submission Id
 * @memberOf gcm.sbm
 * @date 2019.11.16
 * @author 박상규
 */
gcm.sbm._externalResponseFunction = function(value, submissionId) {
	try {
		var responseData = com.util.getJSON(value);
		var resObj = responseData.SERVER_RESULT;
		var msgObj = responseData.SERVER_MESSAGE;

		if ((com.util.isEmpty(resObj) === false) && (com.util.isArray(resObj) === false) && com.util.isJSON(resObj[Object.keys(resObj)[0]])) {
			for (var i = 0; i < resObj.length; i++) {
				for (var key in resObj[i]) {
					responseData[key] = resObj[i][key];
				}
			}

			if (resObj.length) {
				delete responseData.SERVER_RESULT;
			} else {
				for (var key in resObj) {
					responseData[key] = resObj[key];
				}
				delete responseData.SERVER_RESULT;
			}
			return com.str.serialize(responseData);
		} else {
			return value;
		}
	} catch (ex) {
		console.error(ex);
	}

	return value;
};


// =============================================================================
/**
 * 웹스퀘어 컴포넌트 제어, 엑셀 파일 업로드/다운로드, 파일 업로드/다운로드, 기타 함수를 작성한다.
 *
 * @author 박상규
 * @class util
 * @namespace gcm.util
 */
 // =============================================================================

gcm.util = {}

/**
 * 접속한 사용자의 웹 브라우저 종류를 반환한다.
 *
 * @memberOf gcm.util
 * @date 2019.11.16
 * @return {String} 브라우져명
 * @author  박상규
 * @example
var userAgent = gcm.util._getUserAgent();
 */
gcm.util._getUserAgent = function() {
	try {
		var agt = navigator.userAgent.toLowerCase();
		if (agt.indexOf("chrome") != -1) {
			return 'Chrome';
		} else if (agt.indexOf("opera") != -1) {
			return 'Opera';
		} else if (agt.indexOf("staroffice") != -1) {
			return 'Star Office';
		} else if (agt.indexOf("webtv") != -1) {
			return 'WebTV';
		} else if (agt.indexOf("beonex") != -1) {
			return 'Beonex';
		} else if (agt.indexOf("chimera") != -1) {
			return 'Chimera';
		} else if (agt.indexOf("netpositive") != -1) {
			return 'NetPositive';
		} else if (agt.indexOf("phoenix") != -1) {
			return 'Phoenix';
		} else if (agt.indexOf("firefox") != -1) {
			return 'Firefox';
		} else if (agt.indexOf("safari") != -1) {
			return 'Safari';
		} else if (agt.indexOf("skipstone") != -1) {
			return 'SkipStone';
		} else if (agt.indexOf("msie") != -1 || agt.indexOf("trident") != -1) {
			return 'msie';
		} else if (agt.indexOf("netscape") != -1) {
			return 'Netscape';
		} else if (agt.indexOf("mozilla/5.0") != -1) {
			return 'Mozilla';
		} else {
			return '';
		}
	} catch (e) {
		console.error(e);
		return '';
	}
};


/**
 * Chrome Version을 반환한다.
 *
 * @memberOf gcm.util
 * @date 2019.11.16
 * @return {Integer} 크롬 버전
 * @author 박상규
 * @example var chromeVersion = gcm.util._getChromeVersion();
 */
gcm.util._getChromeVersion = function() {
	var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
	return raw ? parseInt(raw[2], 10) : false;
};


// =============================================================================
/**
 * 외부 솔루션 연동과 관련된 함수를 작성한다.
 *
 * ex. Namo Web Editor, Toast UI Editor 등
 *
 * @author 박상규
 * @class ext
 * @namespace gcm.ext
 */
// =============================================================================

gcm.ext = {}

//=============================================================================
/**
 * base64 인코딩 , 디코딩 함수 객체를 정의한다.
 *
 * ex. Namo Web Editor, Toast UI Editor 등
 *
 * @author 김응한
 * @class base64
 * @namespace gcm.base64
 */
// =============================================================================

gcm.base64 = {


_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


	encode: function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = gcm.base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
			    enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
			    enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},


	decode: function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
			    output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
			    output = output + String.fromCharCode(chr3);
			}

		}

		output = gcm.base64._utf8_decode(output);

		return output;

	},

	_utf8_encode: function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
			    utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
			    utftext += String.fromCharCode((c >> 6) | 192);
			    utftext += String.fromCharCode((c & 63) | 128);
			} else {
			    utftext += String.fromCharCode((c >> 12) | 224);
			    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			    utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	_utf8_decode: function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}



