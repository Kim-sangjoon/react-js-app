// =============================================================================
/**
 * 각 WFrame Scope별로 공유되는 Scope 전역 변수와 공통 함수를 작성한다.
 *
 * @date 2019.11.16
 * @author 박상규
 * @class com
 * @namespace com
 * @description
- com 객체는 WFrame Scope 업무 개발자가 호출해야할 공통 함수나 속성을 정의한다.
- com 객체는 WFrame Scope 별로 생성되기 때문에 com 객체 내에 정의된 함수에서의 선언된 $p 객체는
  해당 함수를 호출한 화면의 WFrame Scope 내의 $p를 참조하게 된다.
 */
// =============================================================================

var com = {
	MESSAGE_BOX_SEQ : 1
};

// =============================================================================
/**
 * WebSquare의 Submission과 Workflow 기능을 활용한 데이터 서비스 통신을 위한 공통 함수를 제공한다.<br>
 * Submssion은 Ajax 기술 기반의 통신 기능을 제공하며, WebSquare Studio IDE를 활요한 정적 생성 및 소스 코드에서 동적 생성이 가능하다.<br>
 * Workflow는 여러 비동기 방식의 Submission 간의 처리 순서를 제어하는 기능을 제공한다.
 *
 * @author 박상규
 * @class sbm
 * @namespace com.sbm
 */
 // =============================================================================

com.sbm = {}

/**
 * 데이터 서비스 통신을 위한 Submission을 실행한다.
 *
 * @date 2019.11.16
 * @param {Object} sbmObj submission 객체 또는 submission 아이디
 * @param {Object} opt execute의 options[Default : null]
 * @param {Object} opt.requestData [Default : null, JSON, XML] 요청 데이터로 submission에 등록된 ref를 무시하고 현재의 값이 할당된다.
 * @param {Object} opt.compObj [Default : null] 전송중 disable시킬 컴퍼넌트
 * @param {Object} opt.refSingleMode [Default : true] 서버에 전송할 JSON 데이터의 최상위 Key가 1개일 경우, 최상위 Key를 제외하고 전송하는 옵션
 * @memberOf com.sbm
 * @author 김응한
 * @example
// Submission ID : sbm_init 존재할 경우
com.sbm.execute(sbm_Init);
// return 예시) sbm_init 통신 실행

// Submission ID : sbm_init 존재하지 않을 경우
com.sbm.execute(sbm_Init);
// return 예시) alert - submission 객체[sbm_init]가 존재하지 않습니다.
*/
com.sbm.execute = function(submissionId, opt) {
	try {
		if (submissionId) {
			var sbmObj = (typeof submissionId == 'object') ? submissionId : (typeof submissionId == 'string') ? $p.getSubmission(submissionId) : submissionId;
			opt = (com.util.isEmpty(opt)) ? {} : opt;
			var procMsgIdx = opt.procMsgIdx || 0;
			var requestData = opt.requestData || undefined;
			var compObj = opt.compObj || undefined;

			if (!sbmObj.action) {
				var alertMsg = com.data.getMessage("com.alt.0007","action") || "action 은(는) 필수입력값입니다.";
				com.win.alert(alertMsg);
				return false;
			}

			com.sbm.setRestAction(submissionId, opt);
			$p.executeSubmission(sbmObj, requestData, compObj);
		}
	} catch (e) {
		console.log("[com.sbm.execute] Exception :: " + e);
	}
};


/**
 * Restful 방식을 지원하는 웹 서비스를 호출하기 위한 Submission Action을 설정하는 기능을 수행한다.<br>
 * Submission에 Ref에 정의된 DataMap의 데이터(페이징 정보 및 검색 조건)를 Action URI에 자동으로 붙여준다.<br>
 * com.sbm.executeWorkflow 함수를 실행하기 전에 Submission Action을 변경해야할 필요가 있을 경우, com.sbm.setRestAction 함수를 호출한다.<br>
 * com.sbm.execute에서는 내부에서 자동으로 호출하기 때문에 별도로 호출 필요없다.
 *
 * @date 2019.11.16
 * @param {Object} sbmObj submission 객체
 * @param {Object} opt submission 옵션
 * @memberOf com.sbm
 * @author 김응한
 * @example
치환 예시
  /menu/menuMgmt/v1/retrieveDoc/{stdzDocId} 를 /menu/menuMgmt/v1/retrieveDoc/12314

com.sbm.setRestAction(sbm_programAuthority1);
com.sbm.setRestAction(sbm_programAuthority2);
com.sbm.executeWorkflow(wkf_basicInfo)
*/

com.sbm.setRestAction = function (submissionId, opt) {
	if (submissionId) {
		var sbmObj = (typeof submissionId == 'object') ? submissionId : (typeof submissionId == 'string') ? $p.getSubmission(submissionId) : submissionId;
		opt = (com.util.isEmpty(opt)) ? {} : opt;
		var procMsgIdx = opt.procMsgIdx || 0;
		var requestData = opt.requestData || undefined;
		var compObj = opt.compObj || undefined;

		if (!sbmObj.action) {
			var alertMsg = com.data.getMessage("com.alt.0007","action") || "action 은(는) 필수입력값입니다.";
			com.win.alert(alertMsg);
			return false;
		}

		var sbmObj = (typeof submissionId == 'object') ? submissionId : (typeof submissionId == 'string') ? $p.getSubmission(submissionId) : submissionId;
		opt = (com.util.isEmpty(opt)) ? {} : opt;
		var addQueryStringObj = "";

		try {
			var rtnObj = JSON.parse(com.sbm._getCollectionCondition(sbmObj.ref).condition);
		} catch (e) {
			var rtnObj = {};
		}

		if (com.util.isEmpty(sbmObj.isDefultSubmissionAction)) {
			sbmObj.isDefultSubmissionAction = true;
		}

		if (sbmObj.isDefultSubmissionAction) {
			sbmObj.defultSubmissionAction = sbmObj.action;
			sbmObj.isDefultSubmissionAction = false;
		}

		sbmObj.action = sbmObj.defultSubmissionAction;

		var addQueryString = "";
		var pattern = /\{([^}]+)\}/gm;
		var paramVar = sbmObj.action.match(pattern);
		var actionUrlLog = sbmObj.action;
		for (var key in rtnObj) {
			var compNm = rtnObj[key].id ? rtnObj[key].id : key == "unique" ? rtnObj[0] : rtnObj[key];
			var dCobj = sbmObj.scope_id ? com.util.getComponent(sbmObj.scope_id + "_" + compNm) : com.util.getComponent(compNm);

			if (com.util.isEmpty(dCobj)) {
				console.log("submission의 전송 DataCollection 확인 하세요!");
				break;
				return false;
			}

			if (dCobj.initializeType == "dataMap") {
				addQueryStringObj = com.util.getComponent(dCobj.id).getJSON();
				for ( var fKey in addQueryStringObj) {
					var addQueryStringObjString = (typeof addQueryStringObj[fKey] == "number") ? addQueryStringObj[fKey] : (com.str.trim(addQueryStringObj[fKey]) == "") ? "" : "'" + addQueryStringObj[fKey] + "'";
					if (sbmObj.method == "get") {
						if (fKey == "pageNo") {
							addQueryString += "&page=" + com.str.replaceAll(addQueryStringObjString, "'", "");
						}
						else if (fKey == "rowSize") {
							addQueryString += "&rowSize=" + com.str.replaceAll(addQueryStringObjString, "'", "");
						}
						else if (fKey == "pageSize") {
							addQueryString += "&pageSize=" + com.str.replaceAll(addQueryStringObjString, "'", "");
						}
						else if (fKey == "totalPage") {
							addQueryString += "&totalPage=" + com.str.replaceAll(addQueryStringObjString, "'", "");
						}
					}
					if (paramVar) {
						for (var i = 0; i < paramVar.length; i++) {
							if (fKey == paramVar[i].replace(pattern, '$1')) {
								sbmObj.action = sbmObj.action.replaceAll(paramVar[i], (com.str.trim(addQueryStringObj[fKey]) == "") ? "null"
										: encodeURIComponent(addQueryStringObj[fKey]));
							}
						}
					} else {
						if (sbmObj.method == "get") {
							if (fKey != "last" && fKey != "pageNo" && fKey != "totalPage" && fKey != "start" && fKey != "pageSize" && fKey != "totalRecord" && fKey != "rowSize") {
								sbmObj.action = sbmObj.action + "/" +(addQueryStringObj[fKey] == "" ? "null": encodeURIComponent(addQueryStringObj[fKey]));
								actionUrlLog = actionUrlLog + "/{"+fKey+"}"
							}
						}
					}

					if ((com.util.isEmpty(opt) === false) && (com.util.isEmpty(opt.refSingleMode) === false)) {
						sbmObj.refSingleMode = opt.refSingleMode;
					} else {
						sbmObj.refSingleMode = true;
					}
				}
			}
		}

		var postFixQureyString = (sbmObj.action.indexOf("?") != -1) ? "" : "?";
		if (!com.util.isEmpty(opt.saveExlQs)) {
			postFixQureyString = postFixQureyString + opt.saveExlQs;
		}

		if (postFixQureyString == "?" && addQueryString.indexOf("&") == 0) {
			addQueryString = addQueryString.substring(1);
		}

		if (sbmObj.method == "get") {
			if (postFixQureyString + addQueryString=="?") {
				sbmObj.action = sbmObj.action;
			} else {
				sbmObj.action = sbmObj.action + postFixQureyString + addQueryString;
			}
		} else {
			sbmObj.action = sbmObj.action;
		}

		console.log("Request URL: " + sbmObj.action);
		console.log("Request Pattern: " + actionUrlLog);
	}
}


/**
 * Submission를 동적으로 생성해서 실행한다.
 *
 * @date 2019.11.16
 * @param {Object} options com.sbm.create의 options 참고
 * @param {Object} requestData 요청 데이터
 * @param {Object} obj 전송중 disable시킬 컴퍼넌트
 * @memberOf com.sbm
 * @author 박상규
 * @example
var searchCodeGrpOption = {
	 id : "sbm_searchCodeGrp",
	 action : "serviceId=CD0001&action=R",
	 target : 'data:json,{"id":"dlt_codeGrp","key":"data"}',
	 submitDoneHandler : scwin.searchCodeGrpCallback, isShowMeg : false };
com.sbm.executeDynamic(searchCodeGrpOption);
 */
com.sbm.executeDynamic = function(options, requestData, obj) {
	var submissionObj = com.util.getComponent(options.id);

	if (submissionObj === null) {
		com.sbm.create(options);
		submissionObj = com.util.getComponent(options.id);
	} else {
		$p.deleteSubmission(options.id);
		com.sbm.create(options);
		submissionObj = com.util.getComponent(options.id);
	}

	var option = {
		requestData : requestData || undefined,
		compObj : obj || undefined
	};

	com.sbm.execute(submissionObj, option);
};

/**
 * workflow를 실행한다.
 *
 * @date 2019.11.16
 * @param {Object} options workflow 객체 or workflow 아이디
 * @memberOf com.sbm
 * @author 박상규
 * @example
com.sbm.executeWorkflow(wkf_basicInfo);
 */
com.sbm.executeWorkflow = function(workflowObj) {
	$p.executeWorkflow(workflowObj);
};


/**
 * Submission을 동적으로 생성한다.
 *
 * @date 2019.11.16
 * @param {Object} options Submission 생성 옵션 JSON 객체
 * @param {String} options.id submission 객체의 ID. 통신 모듈 실행 시 필요.
 * @param {String} options.ref 서버로 보낼(request) DataCollection의 조건 표현식.(조건에 때라 표현식이 복잡하다) 또는 Instance Data의 XPath.
 * @param {String} options.target 서버로 응답(response) 받은 데이터가 위치 할 DataCollection의 조건 표현식. 또는 Instance Data의 XPath.
 * @param {String} options.action 통신 할 서버 측 URI.(브라우저 보안 정책으로 crossDomain은 지원되지 않는다.)
 * @param {String} options.method [default: get, post, urlencoded-post]
 * - get : 파라메타를 url에 붙이는 방식 (HTML과 동일).
 * - post : 파라메타를 body 구간에 담는 방식 (HTML과 동일)
 * - urlencoded-post : urlencoded-post.
 * @param {String} options.mediatype [default: application/xml, text/xml, application/json, application/x-www-form-urlencoded]
 * application/x-www-form-urlencoded 웹 form 방식(HTML방식). application/json : json 방식. application/xml : XML 방식. text/xml : xml방식
 * (두 개 차이는 http://stackoverflow._com/questions/4832357 참조)
 * @param {String} options.mode [default: synchronous, synchronous] 서버와의 통신 방식.  asynchronous:비동기식.  synchronous:동기식
 * @param {String} options.encoding [default: utf-8, euc-kr, utf-16] 서버 측 encoding 타입 설정 (euc-kr/utf-16/utf-8)
 * @param {String} options.replace [default: none, all, instance] action으로부터 받은 response data를 적용 구분 값.
 *   - all : 문서 전체를 서버로부터 온 응답데이터로 교체.
 *   - instance : 해당되는 데이터 구간.
 *   - none : 교체안함.
 * @param {String} options.processMsg submission 통신 중 보여줄 메세지.
 * @param {String} options.errorHandler submission오류 발생 시 실행 할 함수명.
 * @param {String} options.customHandler submssion호출 시 실행 할 함수명.
 * @param {requestCallback} options.submitHandler {script type="javascript" ev:event="xforms-submit"} 에 대응하는 함수.
 * @param {requestCallback} options.submitDoneHandler {script type="javascript" ev:event="xforms-submit-done"} 에 대응하는 함수
 * @param {requestCallback} options.submitErrorHandler {script type="javascript" ev:event="xforms-submit-error"} 에 대응하는 함수
 * @memberOf com.sbm
 * @author 박상규
 * @example
com.sbm.create(options);
 */
com.sbm.create = function(options) {
	var ref = options.ref || "";
	var target = options.target || "";
	var action = gcm.CONTEXT_PATH + gcm.SERVICE_URL + options.action; // ajax 요청주소
	var mode = options.mode || gcm.DEFAULT_OPTIONS_MODE; // asynchronous(default)/synchronous
	var mediatype = options.mediatype || gcm.DEFAULT_OPTIONS_MEDIATYPE; // application/x-www-form-urlencoded
	var method = (options.method || "post").toLowerCase(); // get/post/put/delete
	var processMsg = options.processMsg || "";
	var instance = options.instance || "none";

	var submitHandler = (typeof options.submitHandler === "function") ? options.submitHandler
			: ((typeof options.submitHandler === "string") ? $p.id + options.submitHandler : "");
	var submitDoneHandler = (typeof options.submitDoneHandler === "function") ? options.submitDoneHandler
			: ((typeof options.submitDoneHandler === "string") ? $p.id + options.submitDoneHandler : "");
	var submitErrorHandler = (typeof options.submitErrorHandler === "function") ? options.submitErrorHandler
			: ((typeof options.submitErrorHandler === "string") ? $p.id + options.submitErrorHandler : "");

	var isShowMeg = false;
	var resJson = null;

	if ((options.isProcessMsg === true) && (processMsg === "")) {
		processMsg = "해당 작업을 처리중입니다";
	}

	if (typeof options.isShowMeg !== "undefined") {
		isShowMeg = options.isShowMeg;
	}

	var submissionObj = {
		"id" : options.id, // submission 객체의 ID. 통신 모듈 실행 시 필요.
		"ref" : ref, // 서버로 보낼(request) DataCollection의 조건 표현식.(조건에 때라 표현식이 복잡하다) 또는 Instance Data의 XPath.
		"target" : target, // 서버로 응답(response) 받은 데이터가 위치 할 DataCollection의 조건 표현식. 또는 Instance Data의 XPath.
		"action" : action, // 통신 할 서버 측 URI.(브라우저 보안 정책으로 crossDomain은 지원되지 않는다.)
		"method" : method, // [default: post, get, urlencoded-post] get:파라메타를 url에 붙이는 방식 (HTML과 동일).
		// post:파라메타를 body 구간에 담는 방식 (HTML과 동일). urlencoded-post:urlencoded-post.
		"mediatype" : mediatype, // application/json
		"encoding" : "UTF-8", // [default: utf-8, euc-kr, utf-16] 서버 측 encoding 타입 설정 (euc-kr/utf-16/utf-8)
		"mode" : mode, // [default: synchronous, synchronous] 서버와의 통신 방식. asynchronous:비동기식. synchronous:동기식
		"processMsg" : processMsg, // submission 통신 중 보여줄 메세지.
		"submitHandler" : submitHandler,
		"submitDoneHandler" : submitDoneHandler,
		"submitErrorHandler" : submitErrorHandler
	};

	$p.createSubmission(submissionObj);
};

/**
 * submission내 데이터컬랙션을 반환한다.
 *
 * @date 2019.11.16
 * @private
 * @memberOf com
 * @param {String} target 데이타컬렉션
 * @author 김응한
 * @return 데이타컬렉션명
 * @example
com.sbm._getCollectionCondition(target);
 */
com.sbm._getCollectionCondition = function(target) {
    var rtnObj = {};
    rtnObj.type = "";
    rtnObj.condition = "";
    var procStr = "";
    var tmpa = null;
    if (target.indexOf("data:") == 0) {
        procStr = target.substr(5, target.length).wq_trim();
        if (procStr.indexOf(",") > 0) {
            var tmpb = procStr.indexOf(",");
            rtnObj.type = procStr.substring(0, tmpb).wq_trim();
            var tmpc = procStr.substring(tmpb + 1, procStr.length).wq_trim();
            if (tmpc.indexOf("'") > -1) {
                tmpc = tmpc.wq_replaceAll("'", "\"");
            }
            if (tmpc.indexOf("[") == 0) {} else {
                tmpc = "[" + tmpc + "]";
            }
            tmpc = tmpc.replace(/([\[\,])([^\'\"\{\}\s])/g, "$1" + "\"" + "$2").replace(/([^\'\"\{\}])([\]\,])/g, "$1" + "\"" + "$2");
            rtnObj.condition = tmpc;
        } else {
            rtnObj.type = procStr;
        }
    }
    return rtnObj;
};

/**
 * submission action을 변경한다.<br>
 * com.sbm.setRestAction는 ref에 지정된 DataMap을 Action URI에 붙여주는 작업을 수행하지만, com.sbm.setAction은 전달한 action을 그대로 submission의 action 속성에 세팅한다.
 *
 * @date 2019.11.16
 * @memberOf com
 * @param {Object} sbmObj 서브미션 객체
 * @param {String} sbmAction 서브미션 action
 * @author 김응한
 * @example
com.sbm.setAction(sbm_search,"/cust/crgd/v1/user");
 */
com.sbm.setAction = function(sbmObj, sbmAction) {
	try{
		if (!com.util.isEmpty(sbmObj)) {
			sbmObj.isDefultSubmissionAction = null;
			sbmObj.action = sbmAction || "";
		}
	} catch(ex) {
		console.error(ex);
	}
};

// =============================================================================
/**
 * 공통 코드 & 메세지, DataCollection(DataList, DataMap) 제어, 화면 간 데이터 전달, 데이터 유효성 검사, 엑셀 다운로드&업로드 관련 함수를 제공한다.
 *
 * @date 2019.11.16
 * @author 박상규
 * @class data
 * @namespace com.data
 */
 // =============================================================================

com.data = {}

/**
 * 화면 내에서 필요한 공통 코드 데이터를 공통 코드 조회 서비스에 요청해서, 화면에 각 공통 코드 그룹 별로 DataList를 생성한 후에, 지정한 컴포넌트에 바인딩을 수행한다.
 *
 * @date 2019.11.16
 * @param {Object} codeOptions {"cdGrp" : "코드그룹", "compID" : "적용할 컴포넌트명"}
 * @param {requestCallback} callbackFunc 콜백 함수
 * @memberOf com.data
 * @author 박상규
 * @example
var codeOptions = [ { cdGrp : "00001", compID : "sbx_Duty" },
					{ cdGrp : "00002", compID : "sbx_Postion" },
					{ cdGrp : "00021", compID : "sbx_JoinClass" },
					{ cdGrp : "00005", compID : "sbx_CommCodePart1, sbx_CommCodePart2"},
					{ cdGrp : "00024", compID :"grd_CommCodeSample:JOB_CD"} ];
com.data.setCommonCode(codeOptions);
 */
com.data.setCommonCode = function(codeOptions, callbackFunc) {
	var codeOptionsLen = 0;
	var codeDltNm = "dlt_cdGrp";

	var commonCodeInfo = {
		label : "cdNm",
		value : "cd",
		fieldArr : [ "cd", "cdNm"]
	};

	if (codeOptions) {
		codeOptionsLen = codeOptions.length;
	} else {
		console.log("=== com.data.setCommonCode Parameter Type Error ===\nex) com.setCommonCode([{\"cdGrp:\":\"04\",\"compID\":\"sbx_Gender\"}],\"scwin.callbackFunction\")\n===================================");
		return;
	}

	var i, j, codeObj, dltId, paramCode = "", compArr, compArrLen, tmpIdArr;
	var dataListOption = _getCodeDataListOptions(commonCodeInfo.fieldArr);

	for (i = 0; i < codeOptionsLen; i++) {
		codeObj = codeOptions[i];

		try {
			dltId = codeDltNm + codeObj.cdGrp.charAt(0).toUpperCase() + codeObj.cdGrp.slice(1);

			if (i > 0) {
				paramCode += ",";
			}
			paramCode += codeObj.cdGrp;
			dataListOption.id = dltId;
			$p.data.create(dataListOption); // 동일한 id의 DataCollection이 존재할 경우, 삭제 후 재생성함

			if (codeObj.compID) {
				compArr = (codeObj.compID).replaceAll(" ", "").split(",");
				compArrLen = compArr.length;
				for (j = 0; j < compArrLen; j++) {
					tmpIdArr = compArr[j].split(":");
					// 기본 컴포넌트에 대한 Node Setting 설정
					if (tmpIdArr.length === 1) {
						var comp = $p.getComponentById(tmpIdArr[0]);
						comp.setNodeSet("data:" + dltId, commonCodeInfo.label, commonCodeInfo.value);
						// gridView 컴포넌트에 대한 Node Setting 설정
					} else {
						var gridObj = $p.getComponentById(tmpIdArr[0]);
						gridObj.setColumnNodeSet(tmpIdArr[1], "data:" + dltId, commonCodeInfo.label, commonCodeInfo.value);
					}
				}
			}
		} catch (ex) {
			console.error("com.setCommonCode Error");
			console.error(JSON.stringify(codeObj));
			console.error(ex);
			continue;
		}
	}

	var option = {
		id : "sbm_commonCode",
		action : gcm.CONTEXT_PATH + "/cmm/cmmCdMgmt/v1/retrieveCmmCdAllList/" + paramCode,
		//action : gcm.CONTEXT_PATH + "/web/dev/common/commonCode1.json",
		method : "get",
		isShowMeg : true
	};

	option.submitDoneHandler = function(e) {
		var commonCode = e.responseJSON;
		for (key in commonCode) {
			if (key !== "SERVER_MESSAGE") {
				var dataListId = codeDltNm + key.charAt(0).toUpperCase() + key.slice(1);
				var dataListObj = com.util.getComponent(dataListId);
				dataListObj.setJSON(commonCode[key]);
			}
		}

		if (typeof callbackFunc === "function") {
			callbackFunc();
		}
	}

	if (paramCode !== "") {
		com.sbm.create(option);
	} else {
		if (typeof callbackFunc === "function") {
			callbackFunc();
		}
	}

	// dataList를 동적으로 생성하기 위한 옵션 정보를 반환한다.
	function _getCodeDataListOptions(infoArr) {
		var option = {
			"type" : "dataList",
			"option" : {
				"baseNode" : "list",
				"repeatNode" : "map"
			},
			"columnInfo" : []
		};

		for ( var idx in infoArr) {
			option.columnInfo.push({
				"id" : infoArr[idx]
			});
		}
		return option;
	};
};


/**
 * 화면 메타 정보(프로그램 아이디, 메뉴 아이디, 화면 명, 소스 경로)를 세팅한다.
 *
 * @date 2019.11.16
 * @private
 * @memberOf com.data
 * @author 박상규
 */
com.data._setMetaInfo = function () {

	var menuInfo = com.data.getParameter("_menuInfo");
	if (com.util.isEmpty(menuInfo) === false) {
		scwin.meta = menuInfo;
	} else if (com.win.isPopup() === true) {
		var popupId = com.win.getPopupId();
		if (!com.util.isEmpty($p.getPopupUrl())) {
			var srcPath = $p.getPopupUrl();
		} else {
			var srcPath = $w.getPopupUrl();
		}
		var programId = null;
		if (com.util.isEmpty(srcPath) === false ) {
			if (srcPath.indexOf("/service/p/") > -1) {
				var srcPathArr = srcPath.split("/");
				var srcPathArrLen = srcPathArr.length;
				if( srcPathArrLen > 0 ) {
					var pgmId  = srcPathArr[srcPathArrLen-1];
					if (pgmId.indexOf("?") >-1) {
						pgmId = pgmId.split("?")[0];
					}

					if (pgmId.indexOf("&") >-1) {
						pgmId = pgmId.split("&")[0];
					}

					programId = pgmId;
				}

				scwin.meta = {
					"programId" : programId,
					"srcPath" : srcPath
				}
			}
		} else {
			scwin.meta = {};
		}
	}

	// 2019.12.02 wframe 에 프로그램ID 설정 서현호
	else if(com.win.getFrame().getSrc().indexOf("/service/p/") > -1) {
		var srcPath = com.win.getFrame().getSrc();
		var srcPathArr = srcPath.split("/");
		var srcPathArrLen = srcPathArr.length;
		if( srcPathArrLen > 0 ) {
			var pgmId  = srcPathArr[srcPathArrLen-1];
			if (pgmId.indexOf("?") >-1) {
				pgmId = pgmId.split("?")[0];
			}

			if (pgmId.indexOf("&") >-1) {
				pgmId = pgmId.split("&")[0];
			}
			programId = pgmId;
		}

		scwin.meta = {
			"programId" : programId,
			"srcPath" : srcPath
		}
	}

};



/**
 * 화면 메타 정보(프로그램 아이디, 메뉴 아이디, 화면 명, 소스 경로)를 반환한다.
 *
 * @date 2019.11.16
 * @private
 * @memberOf com.data
 * @author 박상규
 */
com.data._getMetaInfo = function (key) {
	if ((com.util.isEmpty(scwin.meta) === false) && (com.util.isEmpty(scwin.meta[key]) === false)) {
		return scwin.meta[key];
	} else {
		return "";
	}
};


/**
 * 부모 창에서 전달한 파라미터 값을 읽어 온다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {String} 파라미터 키
 * @author 박상규
 * @return {Object} 파라미터 값
 * @example
var code = com.data.getParameter("code");  // 특정 파라미터 값을 얻어오기
var param = com.data.getParameter();	   // 전체 파라미터 값을 얻어오기
 */
com.data.getParameter = function (paramKey) {
	try {
		if (typeof paramKey !== "undefined") {
			param = $p.getParameter(paramKey);
			if ((typeof param !== "undefined") && (param !== "")) {
				return param;
			}

			var param = $p.getParameter("param");
			if ((typeof param !== "undefined") && (param !== "")) {
				return param[paramKey];
			}

			return param;
		} else {
			return $p.getParameter("param");
		}
	} catch (ex) {
		return "";
	}
};


/**
 * 특정 컴포넌트에 바인된 DataList나 DataMap의 컬럼 이름을 반환한다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {Object} comObj 컴포넌트 객체
 * @return {String} 컬럼명
 * @example
com.data.getColumnName(ibx_name);
 */
com.data.getColumnName = function (comObj) {
	try {
		if ((typeof comObj.getRef) === "function") {
			var ref = comObj.getRef();
			var refArray = ref.substring(5).split(".");
			var dataCollectionName = refArray[0];
			var columnId = refArray[1];

			if ((typeof refArray !== "undefined") && (refArray.length === 2)) {
				var dataCollection = comObj.getScopeWindow().$p.getComponentById(dataCollectionName);
				var dataType = dataCollection.getObjectType().toLowerCase();
				if (dataType === "datamap") {
					return dataCollection.getName(columnId);
				} else if (dataType === 'datalist') {
					return dataCollection.getColumnName(columnId);
				}
			} else {
				return "";
			}
		}
	} catch (ex) {
		console.error(ex);
	} finally {
		dataCollection = null;
	}
};


/**
 * 특정 컴포넌트에 바인된 DataList나 DataMap의 정보를 반환한다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {Object} comObj callerObj 컴포넌트 객체
 * @returns {Object} dataCollection정보
 * @example
com.data.getDataCollection(ibx_applUserId);
 */
com.data.getDataCollection = function(comObj) {
	try {
		if ((typeof comObj !== "undefined") && (typeof comObj.getRef === "function")) {
			if (comObj.getPluginName() === "gridView") {
				return comObj.getDataListInfo();
			} else {
				var ref = comObj.options.ref;
				if ((typeof ref !== "undefined") && (ref !== "")) {
					var refArray = ref.substring(5).split(".");
					if ((typeof refArray !== "undefined") && (refArray.length === 2)) {
						var dataObjInfo = {};
						dataObjInfo.runtimeDataCollectionId = comObj.getScopeWindow().$p.getFrameId() + "_" + refArray[0];
						dataObjInfo.dataColletionId = refArray[0];
						dataObjInfo.columnId = refArray[1];
						return dataObjInfo;
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
		}
	} catch (e) {
		console.error("[com.data.getDataCollection] Exception :: " + e.message);
	} finally {
		dataCollection = null;
	}
};


/**
 * 공통 메시지 ID에 해당하는 공통 메시지를 반환한다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {String} sysMsgId 메시지 ID , Array 형식인 경우는 첫번째 인덱스가 sysMsgId가 되고 두번째 인덱스부터 치환문자가 됨
 * @param {String} arguments 메시지 치환 문자열 (메시지 ID에서 치환이 필요한 만큼 문자열 매개변수를 전달함)
 * @author 박상규
 * @example
com.data.getMessage("aspr.cfm.0636");  // "문자를 전송하시겠습니까?"
com.data.getMessage("aspr.err.0003", "SE0001");  // "접수유형코드 [SE0001] 가 유효하지 않습니다."
com.data.getMessage("aspr.err.0004", "MA01", "MA0101", "MA010101");  // "장애유형코드 [대: MA01 중: MA0101 소: MA010101] 가 유효하지 않습니다."
 */
com.data.getMessage = function(sysMsgId) {
	var topFrame = $p.top();

	if (com.util.isEmpty(topFrame.com)) {
		topFrame = WebSquare.util.getMainFrame();
	}

	var message = [];
	var dltObj;
	var msgId ="";
	var args = [];
	var replaceArr;

	if (!com.util.isEmpty(topFrame) && !com.util.isEmpty(topFrame.com)) {
		dltObj = topFrame.com.util.getComponent("dlt_commonMessage");
	} else {
		dltObj = com.util.getComponent("dlt_commonMessage");
	}

	if (com.util.isArray(sysMsgId)) {
		if( sysMsgId.length > 0 ) {
			msgId = sysMsgId[0];
			sysMsgId.slice(1);
			replaceArr = sysMsgId;
		}
	}else {
		msgId = sysMsgId;
		replaceArr = arguments;
	}


	if (!com.util.isEmpty(dltObj)) {
		message = dltObj.getMatchedJSON("sysMsgId",msgId);
	}

	if ((com.util.isEmpty(message) === false) && (message.length > 0)) {
		var tmpMessage = message[0].sysMsgNm;

		if (replaceArr.length > 1) {
			for(var i = 1; i < replaceArr.length; i++) {
				tmpMessage = (tmpMessage.indexOf("{" + (i-1) + "}") != -1) ? com.str.replaceAll(tmpMessage, "{" + (i-1) + "}", replaceArr[i]) : tmpMessage;
			}
			return tmpMessage;
		} else {
			return tmpMessage;
		}
	} else {
		return "";
	}
};


/**
 * DataList에 변경된 값이 있는지 검사한다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {Object} dcObjArr 단건 DataList 또는 DataList 배열
 * @author 박상규
 * @returns {Boolean} 검사결과 (true or false)
 * @example
if (com.data.validateGridView(grd_indexPage, valInfo) && com.data.checkModified(dlt_grdAllData)) {
	com.win.confirm("저장하시겠습니까?", "scwin.saveData");
};
 */
com.data.checkModified = function (dcObjArr) {
	if (com.util.getObjectType(dcObjArr) === "array") {
		for (var dcObj in dcObjArr) {
			if (com.util.getObjectType(dcObj) === "object") {
				if (checkModfied(dcObj) === false) {
					return false;
				}
			}
		}
	} else if (com.util.getObjectType(dcObjArr) === "object") {
		return checkModfied(dcObjArr);
	}

	return true;

	function checkModfied(dcObj) {
		if ((typeof dcObj !== "undefined") && (typeof dcObj !== null)) {
			var modifiedIndex = dcObj.getModifiedIndex();
			if (modifiedIndex.length === 0) {
				var alertMsg = com.data.getMessage("com.alt.0010") || "변경된 데이터가 없습니다.";
				com.win.alert(alertMsg);
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}
};


/**
 * DataList의 데이터를 엑셀 파일로 저장한다.
 *
 * @param {Object}	options.common							JSON형태로 저장된 dataList의 엑셀 다운로드 옵션
 * @param {String}	options.common.fileName					[default: excel.xls] 다운로드하려는 파일의 이름
 * @param {Boolean}   options.common.showProcess			[default: true] 다운로드 시 프로세스 창을 보여줄지 여부
 * @param {String}	options.common.multipleSheet			[default: true] 다운로드시 dataList별 sheet분리 출력유무
 * @param {Object}	options.common.printSet					JSON형태로 저장된 Excel Print관련 설정
 * @param {String}	options.common.printSet.fitToPage		[default: false] 엑셀 프린터 출력시 쪽맞춤 사용 유무
 * @param {String}	options.common.printSet.landScape		[default: false] 엑셀 프린터 출력시 가로 방향 출력 유무
 * @param {String}	options.common.printSet.fitWidth		[default: 1] 엑셀 프린터 출력시 용지너비
 * @param {String}	options.common.printSet.fitHeight		[default: 1] 엑셀 프린터 출력시 용지높이
 * @param {String}	options.common.printSet.scale			[default: 100] 엑셀 프린터 출력시 확대/축소 배율, scale을 사용할 경우 fitToPage는 false로 설정 해야 한다.
 * @param {String}	options.common.printSet.pageSize		[default: A4] 엑셀 프린터 출력시 인쇄 용지 크기 (예: "A3", "A4", "A5", "B4") 단, fitToPage: true 인 경우에만 유효.
 * @param {Array}	 [options.excelInfo]					JSON형태로 저장된 dataList의 옵션 정보
 * @param {String}	options.excelInfo.dataListId			[default: 없음] excel의 sheet에 저장한 DataList의 아이디
 * @param {String}	options.excelInfo.sheetName				[default: sheet] excel의 sheet의 이름
 * @param {String}	options.excelInfo.removeColumns			[default: 없음] 다운로드시 excel에서 삭제하려는 열의 번호(여러 개일 경우 ,로 구분)
 * @param {String}	options.excelInfo.foldColumns			[default: 없음] 다운로드시 excel에서 fold하려는 열의 번호(여러 개일 경우 ,로 구분)
 * @param {Number}	options.excelInfo.startRowIndex			[default: 0] excel파일에서 dataList의 데이터가 시작되는 행의 번호(헤더 포함)
 * @param {Number}	options.excelInfo.startColumnIndex		[default: 0] excel파일에서 dataList의 데이터가 시작되는 열의 번호(헤더 포함)
 * @param {String}	options.excelInfo.headerColor			[default: #33CCCC] excel파일에서 dataList의 header부분의 색
 * @param {String}	options.excelInfo.headerFontName		[default: 없음] excel파일에서 dataList의 header부분의 font name
 * @param {String}	options.excelInfo.wframeId				[default: 현재 WFrame Id] DataList가 위치한 WFrame Id 정보
 * @param {Array}	 options.excelInfo.infoArr				dataList에 대한 내용을 추가로 다른 셀에 표현하는 경우 사용하는 배열
 * @param {Number}	options.excelInfo.infoArr.rowIndex		내용을 표시할 행번호
 * @param {Number}	options.excelInfo.infoArr.colIndex		내용을 표시할 열번호
 * @param {Number}	options.excelInfo.infoArr.rowSpan		병합할 행의 수
 * @param {Number}	options.excelInfo.infoArr.colSpan		병합할 열의 수
 * @param {String}	options.excelInfo.infoArr.text			표시할 내용
 * @param {String}	options.excelInfo.infoArr.textAlign		표시할 내용의 정렬 방법 (left, center, right)
 * @param {String}	options.excelInfo.infoArr.fontSize		font size 설정 ( ex) "20px" )
 * @param {String}	options.excelInfo.infoArr.fontName		font name 설정
 * @param {String}	options.excelInfo.infoArr.color			font color 설정 ( ex) "red" )
 * @param {String}	options.excelInfo.infoArr.fontWeight	font weight 설정 ( ex) "bold" )
 * @param {String}	options.excelInfo.infoArr.drawBorder	cell의 border 지정 ( ex) true )
 * @param {String}	options.excelInfo.infoArr.wordWrap		cell의 줄 바꿈 기능 ( ex) "true" )
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @author 박상규
 * @example

// id가 a,b,c,d,e인 5개 컬럼이 존재하는 DataList
var options = {
	common: {
		fileName : "excel_data.xlsx",
		showProcess : true,
		multipleSheet : true,
		printSet : {
			landScape : "true",
			fitToPage : "true",
			fitWidth : "1",
			fitHeight : "1",
			scale : "222"
		}
	},
	excelInfo: [
		{
			dataListId : "dlt_data1",
			sheetName : "첫번째 sheet",
			removeColumns : "1,3",
			foldColumns : "2",
			startRowIndex : 3,
			startColumnIndex : 0,
			headerColor : "#DBEEF3",
			bodyColor : "#92CDDC",
			wframeId : "wframe1",
			infoArr : [
				{
					rowIndex : 1, colIndex : 3, rowSpan : 1, colSpan : 2, text : "데이터표시" , textAlign : "center"
				}
			]
		},
		{
			dataListId : "dlt_data2",
			sheetName : "두번째 sheet",
			removeColumns : "1,3",
			foldColumns : "2",
			startRowIndex : 3,
			startColumnIndex : 0,
			headerColor : "#DBEEF3",
			bodyColor : "#92CDDC",
			wframeId : "wframe1",
			infoArr : [
				{
					rowIndex : 1, colIndex : 3, rowSpan : 1, colSpan : 2, text : "데이터표시" , textAlign : "center"
				}
			]
		}
	]
};
com.data.downloadDataList(options);

 */
com.data.downloadDataList = function (optionsParam, infoArrParam) {
	var options = {
		common: {
			fileName : optionsParam.common.fileName || "dataList.xlsx",
			showProcess :  optionsParam.common.showProcess || true,
			autoSizeColumn : optionsParam.common.autoSizeColumn || true,
			multipleSheet : optionsParam.common.multipleSheet || true,
			printSet : optionsParam.common.printSet || {},
		},
		excelInfo: []
	};

	if (optionsParam.excelInfo.length > 0) {
		var excelInfoCount = optionsParam.excelInfo.length;

		for (var idx = 0; idx < excelInfoCount; idx++) {
			var wframeId = optionsParam.excelInfo[idx].wframeId || $p.getFrameId();
			var dataListId = optionsParam.excelInfo[idx].dataListId;

			var dataListObj = $p.getComponentById(wframeId + "_"+ dataListId);
			if (typeof dataListObj === "undefined") {
				console.log("[com.data.downloadDataList] excelInfo.dataListId에 설정된 " + dataListId + " DataList를 찾을 수 없습니다.");
				return;
			}

			var excelInfo = {
				dataListId : dataListId,
				sheetName : optionsParam.excelInfo[idx].sheetName || dataListId,
				removeColumns : optionsParam.excelInfo[idx].removeColumns || "",
				foldColumns : optionsParam.excelInfo[idx].foldColumns || "",
				startRowIndex : optionsParam.excelInfo[idx].startRowIndex || 0,
				startColumnIndex : optionsParam.excelInfo[idx].startColumnIndex || 0,
				headerColor : optionsParam.excelInfo[idx].headerColor || "#33CCCC",
				bodyColor : optionsParam.excelInfo[idx].bodyColor || "#FFFFFF",
				wframeId : wframeId,
				infoArr : optionsParam.excelInfo[idx].infoArr
			};

			options.excelInfo.push(excelInfo);
		}
	} else {
		console.log("[com.data.downloadDataList] options.excelInfo 정보가 입력되지 않았습니다.");
		return;
	}

	WebSquare.util.multipleDataListDownload(options, infoArrParam);
};


/**
 * GridView의 데이터를 엑셀 파일로 다운로드 한다.
 *
 * @param {Object}	grdObj GridView 객체
 * @param {Object}	options JSON형태로 저장된 그리드의 엑셀 다운로드 옵션
 * @param {String}	options.fileName				[default: excel.xls] 다운로드하려는 파일의 이름으로 필수 입력 값이다.
 * @param {String}	options.sheetName				[default: sheet] excel의 sheet의 이름
 * @param {String}	options.type					[default: 0] type이 0인 경우 실제 데이터 1인 경우 눈에 보이는 데이터를 2이면 들어가 있는 data 그대로(filter무시 expression 타입의 셀은 나오지 않음)
 * @param {String}	options.removeColumns			[default: 없음] 다운로드시 excel에서 삭제하려는 열의 번호(여러 개일 경우 ,로 구분)
 * @param {String}	options.removeHeaderRows		[default: 없음] 다운로드시 excel에서 삭제하려는 Header의 row index(여러 개일 경우 ,로 구분)
 * @param {String}	options.foldColumns				[default: 없음] 다운로드시 excel에서 fold하려는 열의 번호(여러 개일 경우 ,로 구분)
 * @param {Number}	options.startRowIndex			[default: 0] excel파일에서 그리드의 데이터가 시작되는 행의 번호(헤더 포함)
 * @param {Number}	options.startColumnIndex		[default: 0] excel파일에서 그리드의 데이터가 시작되는 열의 번호(헤더 포함)
 * @param {String}	options.headerColor				[default: #33CCCC] excel파일에서 그리드의 header부분의 색
 * @param {String}	options.headerFontName			[default: 없음] excel파일에서 그리드의 header부분의 font name
 * @param {String}	options.headerFontSize			[default: 10] excel파일에서 그리드의 header부분의 font size
 * @param {String}	options.headerFontColor			[default: 없음] excel파일에서 그리드의 header부분의 font색
 * @param {String}	options.bodyColor				[default: #FFFFFF] excel파일에서 그리드의 body부분의 색
 * @param {String}	options.bodyFontName			[default: 없음] excel파일에서 그리드의 body부분의 font name
 * @param {String}	options.bodyFontSize			[default: 10] excel파일에서 그리드의 body부분의 font size
 * @param {String}	options.bodyFontColor			[default: 없음] excel파일에서 그리드의 body부분의 font색
 * @param {String}	options.subTotalColor			[default: #CCFFCC] excel파일에서 그리드의 subtotal부분의 색
 * @param {String}	options.subTotalFontName		[default: 없음] excel파일에서 그리드의 subtotal부분의 font name
 * @param {String}	options.subTotalFontSize		[default: 10] excel파일에서 그리드의 subtotal부분의 font size
 * @param {String}	options.subTotalFontColor		[default: 없음] excel파일에서 그리드의 subtotal부분의 font색
 * @param {String}	options.footerColor				[default: #008000] excel파일에서 그리드의 footer부분의 색
 * @param {String}	options.footerFontName			[default: 없음] excel파일에서 그리드의 footer부분의 font name
 * @param {String}	options.footerFontSize			[default: 10] excel파일에서 그리드의 footer부분의 font size
 * @param {String}	options.footerFontColor			[default: 없음] excel파일에서 그리드의 footer부분의 font색
 * @param {String}	options.oddRowBackgroundColor	[default: 없음] excel파일에서 그리드 body의 홀수줄의 배경색
 * @param {String}	options.evenRowBackgroundColor	[default: 없음] excel파일에서 그리드 body의 짝수줄의 배경색
 * @param {String}	options.rowNumHeaderColor		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 배경색
 * @param {String}	options.rowNumHeaderFontName	[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 폰트이름
 * @param {String}	options.rowNumHeaderFontSize	[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 폰트크기
 * @param {String}	options.rowNumHeaderFontColor	[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 폰트색상
 * @param {String}	options.rowNumBodyColor			[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 배경색
 * @param {String}	options.rowNumBodyFontName		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 폰트이름
 * @param {String}	options.rowNumBodyFontSize		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 폰트크기
 * @param {String}	options.rowNumBodyFontColor		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 폰트색상
 * @param {String}	options.rowNumFooterColor		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 배경색
 * @param {String}	options.rowNumFooterFontName	[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 폰트이름
 * @param {String}	options.rowNumFooterFontSize	[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 폰트크기
 * @param {String}	options.rowNumFooterFontColor	[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 폰트색상
 * @param {String}	options.rowNumSubTotalColor		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 배경색
 * @param {String}	options.rowNumSubTotalFontName  [default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 폰트이름
 * @param {String}	options.rowNumSubTotalFontSize  [default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 폰트크기
 * @param {String}	options.rowNumSubTotalFontColor [default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 폰트색상
 * @param {String}	options.rowNumHeaderValue		[default: 없음] rowNumVisible 속성이 true인 경우 순서출력 Header 영역의 출력값
 * @param {String}	options.rowNumVisible			[default: false] 순서출력 유무
 * @param {Boolean}   options.showProcess			[default: true] 다운로드 시 프로세스 창을 보여줄지 여부
 * @param {Boolean}   options.massStorage			[default: true] 대용량 다운로드 여부 (default는 true 이 옵션을 true로 하고 showConfirm을 false로 한 경우에 IE에서 신뢰할만한 사이트를 체크하는 옵션이 뜬다.)
 * @param {Boolean}   options.numberToText			[default: false] numberExtraction="true"이고 dataType="number"로 설정된 열의 데이터를 Excel 파일로 다운로드할 때 콤마 등 포맷에 포함된 기호를 유지.
 * @param {Boolean}   options.showConfirm			[default: false] 다운로드 확인창을 띄울지 여부(옵션을 킨 경우 advancedExcelDownload를 호출후 사용자가 window의 버튼을 한번더 클릭해야 한다. massStorage는 자동으로 true가 된다)
 * @param {String}	options.dataProvider			[default: 없음] 대량데이터 처리 및 사용자 데이터를 가공할 수 있는 Provider Package
 * @param {String}	options.splitProvider			[default: 없음] 대량데이터 처리를 위해 데이터를 분할해서 처리할 수 있는 Provider Package
 * @param {String}	options.providerRequestXml		[default: 없음] Provider 내부에서 사용할 XML 문자열
 * @param {String}	options.userDataXml				[default: 없음] 사용자가 서버모듈 개발 시 필요한 데이터를 전송 할 수 있는 변수
 * @param {Boolean}   options.bodyWordwrap			[default: false] 다운로드시 body의 줄 바꿈 기능
 * @param {Boolean}   options.subtotalWordwrap		[default: false] 다운로드시 subtotal의 줄 바꿈 기능
 * @param {Boolean}   options.footerWordwrap		[default: false] 다운로드시 footer의 줄 바꿈 기능
 * @param {String}	options.useEuroLocale			[default: false] 다운로드시 유로화 처리 기능(,와 .이 반대인 경우처리)
 * @param {String}	options.useHeader				[default: true] 다운로드시 Header를 출력 할지 여부( "true"인경우 출력, "false"인경우 미출력)
 * @param {String}	options.useSubTotal				[default: false] 다운로드시 SubTotal을 출력 할지 여부( "true"인경우 출력, "false"인경우 미출력), expression을 지정한 경우 avg,sum,min,max,targetColValue,숫자를 지원 함.
 * @param {String}	options.useFooter				[default: true] 다운로드시 Footer를 출력 할지 여부( "true"인경우 출력, "false"인경우 미출력)
 * @param {String}	options.useHeaderCheckBoxLabel	[default: false] 다운로드시 header가 checkbox인 경우 checked 값 대신 label을 출력 할지 여부( "true"인경우 header column value 출력, "false"인경우 checked값 출력)
 * @param {String}	options.separator				[default: ,] 다운로드시 서버로 데이터 전송할때, 데이터를 구분짓는 구분자, default는 comma(,)
 * @param {Number}	options.subTotalScale			[default: -1] 다운로드시 subTotal 평균계산시 소수점 자리수를 지정
 * @param {String}	options.subTotalRoundingMode	[default: 없음] 다운로드시 subTotal 평균계산시 Round를 지정 한다. ("CEILING","FLOOR","HALF_UP")
 * @param {String}	options.useStyle				[default: false] 다운로드시 css를 제외한, style을 excel에도 적용할 지 여부 (배경색,폰트)
 * @param {String}	options.freezePane				[default: ""] 틀고정을 위한 좌표값 및 좌표값의 오픈셋 ( ex) freezePane="3,4" X축 3, Y축 4에서 틀고정, freezePane="0,1,0,5" X축 0, Y축 1에서 X축으로 0, Y축으로 5로 틀공정 )
 * @param {String}	options.autoSizeColumn			[default: false] 너비자동맞춤 설정 유무
 * @param {String}	options.displayGridlines		[default: false] 엑셀 전체 셀의 눈금선 제거 유무
 * @param {String}	options.colMerge				[default: false] colMerge된 컬럼을 Merge해서 출력 할 지 여부
 * @param {String}	options.colMergeTextAlign		[default: center] colMerge된 컬럼의 textAlign설정 (bottom, center, top 설정)
 * @param {String}	options.mergeCell				[default: false] gridView mergeCell API로 cell 머지시, excel에도 동일하게 머지되어 다운로드 할지 여부
 * @param {String}	options.useDataFormat			[default: 없음] "true"인 경우 dataType에 따라 Excel 파일에 표시 형식을 출력. dataType="text"인 셀은 Excel의 표시형식에 '텍스트' 출력, dataType="number" 혹은 "bigDecimal" 셀은 "숫자" 출력.
 * @param {String}	options.indent					[default: 없음] 그리드 dataType이 drilldown인 경우, indent 표시를 위한 공백 삽입 개수, default값은 0
 * @param {String}	options.columnMove				[default: false] 그리드 컬럼이동시 이동된 상태로 다운로드 유무 ( "true"인경우 컬럼이동 순서대로 출력 )
 * @param {String}	options.columnOrder				[default: 없음] 엑셀 다운로드시 다운로드되는 컬럼 순서를 지정 할 수 있는 속성 ( ex) "0,3,2,1"로 지정시 지정한 순서로 다운로드된다 )
 * @param {String}	options.columnMoveWithFooter	[default: 없음] 그리드 컬럼이동시 Footer영역이 이동된 상태로 다운로드 유무
 * @param {String}	options.optionParam				[default: 없음] DRM 연계시 사용자 정의 class에 HashMap 인자로 전달할 값. key는 "optionParam"으로 참조한다.
 * @param {String}	options.rowHeight				[default: 없음] 엑셀 파일로 다운로드 할 때 엑셀의 셀 높이. (단위: pixel)
 * @param {String}	options.pwd						[default: 없음] 엑셀 파일로 다운로드할 때 비밀번호를 설정. 사용 조건: (1) 비밀번호는 BASE64로 인코딩후 전송해야 함. (2) websquare.xml에 <encrypt tempDir>을 설정해야 함. (3) POI 3.10으로 업그레이드 필요.
 * @param {String}	options.maxCellCount			[default: 없음] 엑셀 다운로드를 제한할 셀 개수 ( ex) 1000 설정시 grid의 셀 개수가 1000개를 넘어가면 서버로 요청을 보내지 않는다. )
 * @param {String}	options.maxRowCount			 	[default: 없음] 엑셀 다운로드를 제한할 행 개수 ( ex) 1000 설정시 grid의 행 개수가 1000개를 넘어가면 서버로 요청을 보내지 않는다. )
 * @param {String}	options.headerAutoFilter		[default: false] Header에 filter를 적용할지 여부
 * @param {String}	options.filterRowIndex			[default: -1] filter를 적용할 header의 row Index
 * @param {Object}	options.printSet				JSON형태로 저장된 Excel Print관련 설정
 * @param {String}	options.printSet.fitToPage		[default: false] 엑셀 프린터 출력시 쪽맞춤 사용 유무
 * @param {String}	options.printSet.landScape		[default: false] 엑셀 프린터 출력시 가로 방향 출력 유무
 * @param {String}	options.printSet.fitWidth		[default: 1] 엑셀 프린터 출력시 용지너비
 * @param {String}	options.printSet.fitHeight		[default: 1] 엑셀 프린터 출력시 용지높이
 * @param {String}	options.printSet.scale			[default: 100] 엑셀 프린터 출력시 확대/축소 배율, scale을 사용할 경우 fitToPage는 false로 설정 해야 한다.
 * @param {String}	options.printSet.pageSize		[default: A4] 엑셀 프린터 출력시 인쇄 용지 크기 (예: "A3", "A4", "A5", "B4") 단, fitToPage: true 인 경우에만 유효.
 * @param {Number}	options.timeout					[default: 없음] 요청 최대 대기시간. millisecond 단위. timeout까지 응답이 오지 않을 시 다운로드를 fail 처리한다.
 * @param {Number}	options.checkInterval			[default: 1000] 응답 확인 간격. millisecond 단위. 지정된 주기마다 응답을 확인한다.
 * @param {Function}  options.onSuccessCallback		[default: 없음] 요청 성공 시 불리는 callback 함수.
 * @param {Function}  options.onFailureCallback		[default: 없음] 요청 실패 시 불리는 callback 함수.
 *
 * @param {Object[]}  [infoArr]						subTotalFontName 그리드에 대한 내용을 추가로 다른 셀에 표현하는 경우 사용하는 배열
 * @param {Number}	infoArr.rowIndex				내용을 표시할 행번호
 * @param {Number}	infoArr.colIndex				내용을 표시할 열번호
 * @param {Number}	infoArr.rowSpan					병합할 행의 수
 * @param {Number}	infoArr.colSpan					병합할 열의 수
 * @param {String}	infoArr.text					표시할 내용
 * @param {String}	infoArr.textAlign				표시할 내용의 정렬 방법 (left, center, right)
 * @param {String}	infoArr.fontSize				font size 설정 ( ex) "20px" )
 * @param {String}	infoArr.fontName				font name 설정
 * @param {String}	infoArr.color					font color 설정 ( ex) "red" )
 * @param {String}	infoArr.fontWeight				font weight 설정 ( ex) "bold" )
 * @param {String}	infoArr.drawBorder				cell의 border 지정 ( ex) true )
 * @param {String}	infoArr.borderColor				cell의 border color를 지정 ( ex) "#FF0000", "red" )
 * @param {String}	infoArr.borderWidth				cell의 border width 지정 ( "thin", "medium", "thick" )
 * @param {String}	infoArr.wordWrap				cell의 줄 바꿈 기능 ( ex) "true" )
 * @param {String}	infoArr.bgColor					cell의 배경 color 설정 ( ex) "red" )
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @return {file} <b>Excel file</b>
 * @author 박상규
 * @example
var gridId = "grd_advancedExcel";
var infoArr = {};
var options = {
   fileName : "downLoadExcel.xlsx" //[default : excel.xlsx] options.fileName 값이 없을 경우 default값 세팅
};
com.data.downloadGridViewExcel(grdObj, options, infoArr );
 */
com.data.downloadGridViewExcel = function(grdObj, options, infoArr) {
	if (typeof options === "undefined") {
		options = {
			hiddenVisible: false,
			fileName: "excel.xlsx"
		}
	}

	if (typeof infoArr === "undefined") {
		infoArr = {};
	}

	// excel 다운로드시 기본 설정으로 화면내의 hidden컬럼을 removeColumns에 포함시킨다.
	// 이를 원치 않을 경우 options.hiddenVisible = 'true' 로 설정한다.
	if (!options.hiddenVisible) {
		var grdCnt = grdObj.getTotalCol();

		var hiddenColIndex = [];
		for (var idx = 0; idx < grdCnt; idx++) {
			if (!grdObj.getColumnVisible(idx)) {
				hiddenColIndex.push(idx);
			}
		}
		// hidden 컬럼이 있는 경우만 추가할 수 있도록 (2016.10.28 추가)
		if (hiddenColIndex.length > 0) {
			if (options.removeColumns.length > 0) {
				options.removeColumns = options.removeColumns + "," + hiddenColIndex.join(',');
			} else {
				options.removeColumns = hiddenColIndex.join(',');
			}

			// 중복 요소 제거
			var _removeColumnArr = options.removeColumns.split(",");
			options.removeColumns = _removeColumnArr.reduce(function (a, b) {
				if (a.indexOf(b) < 0) {
					a.push(b);
				}
				return a;
			}, []).join(',');
		}
	}

	var options = {
		fileName: options.fileName || "excel.xlsx", //String, [defalut: excel.xlsx] 다운로드하려는 파일의 이름으로 필수 입력 값이다.
		sheetName: options.sheetName || "sheet", //String, [defalut: sheet] excel의 sheet의 이름
		type: options.type || "0", //String, [defalut: 0] type이 0인 경우 실제 데이터 1인 경우 눈에 보이는 데이터를  2이면 들어가 있는 data 그대로(filter무시 expression 타입의 셀은 나오지 않음)
		removeColumns: options.removeColumns || "", //String, [defalut: 없음] 다운로드시 excel에서 삭제하려는 열의 번호(여러 개일 경우 ,로 구분)
		removeHeaderRows: options.removeHeaderRows || "", //String, [defalut: 없음]	다운로드시 excel에서 삭제하려는 Header의 row index(여러 개일 경우 ,로 구분)
		foldColumns: options.foldColumns || "", //String, [defalut: 없음] 다운로드시 excel에서 fold하려는 열의 번호(여러 개일 경우 ,로 구분)
		startRowIndex: options.startRowIndex || 0, //Number, excel파일에서 그리드의 데이터가 시작되는 행의 번호(헤더 포함)
		startColumnIndex: options.startColumnIndex || 0, //Number, excel파일에서 그리드의 데이터가 시작되는 열의 번호(헤더 포함)
		headerColor: options.headerColor || "#33CCCC", //String, excel파일에서 그리드의 header부분의 색
		headerFontName: options.headerFontName || "", //String, [defalut: 없음] excel파일에서 그리드의 header부분의 font name
		headerFontSize: options.headerFontSize || "10", //String, excel파일에서 그리드의 header부분의 font size
		headerFontColor: options.headerFontColor || "", //String, excel파일에서 그리드의 header부분의 font색
		bodyColor: options.bodyColor || "#FFFFFF", //String, excel파일에서 그리드의 body부분의 색
		bodyFontName: options.bodyFontName || "", //String, [defalut: 없음] excel파일에서 그리드의 body부분의 font name
		bodyFontSize: options.bodyFontSize || "10", //String, excel파일에서 그리드의 body부분의 font size
		bodyFontColor: options.bodyFontColor || "", //String, excel파일에서 그리드의 body부분의 font색
		subTotalColor: options.subTotalColor || "#CCFFCC", //String, [defalut: #CCFFCC] excel파일에서 그리드의 subtotal부분의 색
		subTotalFontName: options.subTotalFontName || "", //String, [defalut: 없음] excel파일에서 그리드의 subtotal부분의 font name
		subTotalFontSize: options.subTotalFontSize || "10", //String, [defalut: 10] excel파일에서 그리드의 subtotal부분의 font size
		subTotalFontColor: options.subTotalFontColor || "", //String, [defalut: 없음] excel파일에서 그리드의 subtotal부분의 font색
		footerColor: options.footerColor || "#008000", //String, [defalut: #008000] excel파일에서 그리드의 footer부분의 색
		footerFontName: options.footerFontName || "", //String, [defalut: 없음] excel파일에서 그리드의 footer부분의 font name
		footerFontSize: options.footerFontSize || "10", //String, [defalut: 10] excel파일에서 그리드의 footer부분의 font size
		footerFontColor: options.footerFontColor || "", //String, [defalut: 없음] excel파일에서 그리드의 footer부분의 font색
		oddRowBackgroundColor: options.oddRowBackgroundColor || "", //String, excel파일에서 그리드 body의 홀수줄의 배경색
		evenRowBackgroundColor: options.evenRowBackgroundColor || "", //String, [defalut: 없음] excel파일에서 그리드 body의 짝수줄의 배경색
		rowNumHeaderColor: options.rowNumHeaderColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 배경색
		rowNumHeaderFontName: options.rowNumHeaderFontName || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 폰트이름
		rowNumHeaderFontSize: options.rowNumHeaderFontSize || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 폰트크기
		rowNumHeaderFontColor: options.rowNumHeaderFontColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 header 영역의 폰트색상
		rowNumBodyColor: options.rowNumBodyColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 배경색
		rowNumBodyFontName: options.rowNumBodyFontName || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 폰트이름
		rowNumBodyFontSize: options.rowNumBodyFontSize || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 폰트크기
		rowNumBodyFontColor: options.rowNumBodyFontColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Body 영역의 폰트색상
		rowNumFooterColor: options.rowNumFooterColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 배경색
		rowNumFooterFontName: options.rowNumFooterFontName || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 폰트이름
		rowNumFooterFontSize: options.rowNumFooterFontSize || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 폰트크기
		rowNumFooterFontColor: options.rowNumFooterFontColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Footer 영역의 폰트색상
		rowNumSubTotalColor: options.rowNumSubTotalColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 배경색
		rowNumSubTotalFontName: options.rowNumSubTotalFontName || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 폰트이름
		rowNumSubTotalFontSize: options.rowNumSubTotalFontSize || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 폰트크기
		rowNumSubTotalFontColor: options.rowNumSubTotalFontColor || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Subtotal 영역의 폰트색상
		rowNumHeaderValue: options.rowNumHeaderValue || "", //String, [defalut: 없음] rowNumVisible 속성이 true인 경우 순서출력 Header 영역의 출력값
		rowNumVisible: options.rowNumVisible || "false", //String, [defalut: false] 순서출력 유무
		showProcess: WebSquare.util.getBoolean(options.showProcess) || true, //Boolean, [defalut: true] 다운로드 시 프로세스 창을 보여줄지 여부
		massStorage: WebSquare.util.getBoolean(options.massStorage) || true, //Boolean, [defalut: true] 대용량 다운로드 여부 (default는 true 이 옵션을 true로 하고 showConfirm을 false로 한 경우에 IE에서 신뢰할만한 사이트를 체크하는 옵션이 뜬다.)
		showConfirm: WebSquare.util.getBoolean(options.showConfirm) || false, //Boolean, [defalut: false] 다운로드 확인창을 띄울지 여부(옵션을 킨 경우 advancedExcelDownload를 호출후 사용자가 window의 버튼을 한번더 클릭해야 한다. massStorage는 자동으로 true가 된다)
		dataProvider: options.dataProvider || "", //String, [defalut: 없음] 대량데이터 처리 및 사용자 데이터를 가공할 수 있는 Provider Package
		providerRequestXml: options.providerRequestXml || "", //String, [defalut: 없음] Provider 내부에서 사용할 XML 문자열
		userDataXml: options.userDataXml || "", //String, [defalut: 없음] 사용자가 서버모듈 개발 시 필요한 데이터를 전송 할 수 있는 변수
		bodyWordwrap: WebSquare.util.getBoolean(options.bodyWordwrap) || false, //Boolean, [defalut: false] 다운로드시 바디의 줄 바꿈 기능
		useEuroLocale: options.useEuroLocale || "false", //String, [defalut: false] 다운로드시 유로화 처리 기능(,와 .이 반대인 경우처리)
		useHeader: options.useHeader || "true", //String, [defalut: true] 다운로드시 Header를 출력 할지 여부( "true"인경우 출력, "false"인경우 미출력)
		useSubTotal: options.useSubTotal || "false", //String, [defalut: false] 다운로드시 SubTotal을 출력 할지 여부( "true"인경우 출력, "false"인경우 미출력), expression을 지정한 경우 avg,sum,min,max,targetColValue,숫자를 지원 함.
		useFooter: options.useFooter || "true", //String, [defalut: true] 다운로드시 Footer를 출력 할지 여부( "true"인경우 출력, "false"인경우 미출력)
		separator: options.separator || ",", //String, [defalut: ,] 다운로드시 서버로 데이터 전송할때, 데이터를 구분짓는 구분자, default는 comma(,)
		subTotalScale: options.subTotalScale || -1, //Number, [defalut: -1] 다운로드시 subTotal 평균계산시 소수점 자리수를 지정
		subTotalRoundingMode: options.subTotalRoundingMode || "", //String, [defalut: 없음] 다운로드시 subTotal 평균계산시 Round를 지정 한다. ("CEILING","FLOOR","HALF_UP")
		useStyle: options.useStyle || "", //String, [defalut: false] 다운로드시 css를 제외한, style을 excel에도 적용할 지 여부 (배경색,폰트)
		freezePane: options.freezePane || "", //String, [defalut: ""] 틀고정을 위한 좌표값 및 좌표값의 오픈셋 ( ex) freezePane="3,4" X축 3, Y축 4에서 틀고정, freezePane="0,1,0,5" X축 0, Y축 1에서 X축으로 0, Y축으로 5로 틀공정  )
		autoSizeColumn: options.autoSizeColumn || "true", //String, [defalut: false] 너비자동맞춤 설정 유무 - 2016.08.18 옵션 설정을 true로 변경
		displayGridlines: options.displayGridlines || "", //String, [defalut: false] 엑셀 전체 셀의 눈금선 제거 유무
		colMerge: options.colMerge || "", //String, [defalut: false] colMerge된 컬럼을 Merge해서 출력 할 지 여부
		useDataFormat: options.useDataFormat || "", //String, [defalut: 없음] 그리드 dataType이 text인 경우, 엑셀의 표시형식 '텍스트' 출력 유무( "true"인 경우 표시형식 텍스트, "false"인 경우 표시형식 일반 출력)
		indent: options.indent || "", //String, [defalut: 없음] 그리드 dataType이 drilldown인 경우, indent 표시를 위한 공백 삽입 개수, default값은 0
		columnMove: options.columnMove || "", //String, [defalut: false] 그리드 컬럼이동시 이동된 상태로 다운로드 유무 ( "true"인경우 컬럼이동 순서대로 출력 )
		columnOrder: options.columnOrder || "", //String, [defalut: 없음] 엑셀 다운로드시 다운로드되는 컬럼 순서를 지정 할 수 있는 속성 ( ex) "0,3,2,1"로 지정시 지정한 순서로 다운로드된다 )
		fitToPage: options.fitToPage || "false", //String, [defalut: false] 엑셀 프린터 출력시 쪽맞춤 사용 유무
		landScape: options.landScape || "false", //String, [defalut: false] 엑셀 프린터 출력시 가로 방향 출력 유무
		fitWidth: options.fitWidth || "1", //String, [defalut: 1] 엑셀 프린터 출력시 용지너비
		fitHeight: options.fitHeight || "1", //String, [defalut: 1] 엑셀 프린터 출력시 용지높이
		scale: options.scale || "100", //String, [defalut: 100] 엑셀 프린터 출력시 확대/축소 배율, scale을 사용할 경우 fitToPage는 false로 설정 해야 한다.
		pageSize: options.pageSize || "A4", //String, [defalut: A4] 엑셀 프린터 출력시 인쇄용지 설정 ( ex) "A3", "A4", "A5", "B4" )
		onSuccessCallback : function (e) {
		},
		onFailureCallback : function (e) {
		}
	};

	var infoArr = {
		rowIndex: infoArr.rowIndex || 0, //Number, 내용을 표시할 행번호
		colIndex: infoArr.colIndex || 0, //Number, 내용을 표시할 열번호
		rowSpan: infoArr.rowSpan || 0, //Number, 병합할 행의 수
		colSpan: infoArr.colSpan || 0, //Number, 병합할 열의 수
		text: infoArr.text || "", //String, 표시할 내용
		textAlign: infoArr.textAlign || "right", //String, 표시할 내용의 정렬 방법 left, center, right
		fontSize: infoArr.fontSize || "10px", //String, font size 설정 20px, 10px, 5px
		fontName: infoArr.fontName || "", //String, font name 설정
		color: infoArr.color || "", //String, font color 설정 red, blue, green
		fontWeight: infoArr.fontWeight || "", //String, font weight 설정 bold
		drawBorder: infoArr.drawBorder || "true", //String, cell의 border지정 true, false
		wordWrap: infoArr.wordWrap || "", //String, cell의 줄 바꿈 기능 true, false
		bgColor: infoArr.bgColor || "" //String, cell의 배경 color 설정 red, blue, green
	};

	grdObj.advancedExcelDownload(options, infoArr);
};


/**
 * GridView의 데이터를 CSV 파일로 다운로드 한다.
 *
 * @param {Object}   grdObj GridView Object
 * @param {Object[]} options 					JSON형태로 저장된 그리드의 엑셀 다운로드 옵션
 * @param {String}   options.fileName			[default: csvfile.csv] 엑셀파일 선택 대화상자가 나타날 때 기본으로 지정 될 파일 이름
 * @param {String}   options.type				[default: 1, 0] Grid 저장 형태 (0이면 데이터 형태,1이면 표시 방식)
 * @param {String}   options.delim				[default: ';'] CSV 파일에서 데이터를 구분할 구분자
 * @param {String}   options.removeColumns		[default: 없음] 저장 하지 않을 columns index, 여러컬럼인 경우 콤마(,)로 구분해서 정의 한다.
 * @param {String}   options.header				[default: 1, 0] Grid의 숨겨진 Column에 대한 저장 여부(0이면 저장 하지 않음,1이면 저장)
 * @param {Number}   options.hidden				[default: 0, 1] Grid의 숨겨진 Column에 대한 저장 여부(0이면 저장 하지 않음,1이면 저장)
 * @param {String}   options.checkButton		[default: 1, 0] Grid의 Control(Check, Radio, Button) Column에 대해 히든 여부 (0이면 control Coliumn히든,1이면 보여줌)
 * @param {Array}	options.saveList			[default: 없음] hidden에 관계없이 최우선순위로 저장할 column id들의 array
 * @param {String}   options.columnMove			[default: false] 그리드 컬럼이동시 이동된 상태로 다운로드 유무 ( "true"인경우 컬럼이동 순서대로 출력 )
 * @param {String}   options.columnOrder		[default: 없음] csv 다운로드시 다운로드되는 컬럼 순서를 지정 할 수 있는 속성 ( ex) "0,3,2,1"로 지정시 지정한 순서로 다운로드된다 )
 * @param {String}   options.spanAll			[default: false] drilldown gridView인 경우 전체목록을 펼쳐서 다운로드 할 수 있는 속성. (true이면 전체출력, false면 보여지는 목록만 출력)
 * @param {String}   options.aposPrefixOnNum	[default: 0, 1] dataType이 number이고 length가 12자리이상인 경우 '(apos)를 붙일지 여부 (0 이면 apos를 붙이지않음, 1이면 붙임)
 * @param {String}   options.ignoreSpan			[default: 0, 1] span되어 있는 경우 span을 무시하고 데이터를 채울지 여부 (0이면 저장하지 않음, 1이면 저장)
 * @param {String}   options.removeQuotation	[default: 0, 1] value에 ", ' 가 들어있는 경우 ", '를 지울지 여부 (0이면 지원지 않음, 1이면 지움)
 * @param {String}   options.removeNewLine		[default: 1, 0] value내에 \r\n이 있을 경우 삭제유무 (0이면 지원지 않음, 1이면 지움)
 * @param {String}   options.optionParam		[default: 없음] DRM 연계시 사용자 정의 class에 HashMap 인자로 전달할 값. key는 "optionParam"으로 참조한다.
 * @memberOf com.data
 * @date 2019.11.16
 * @return {file} CSV file
 * @author 박상규
 * @example
var gridId = "grd_AdvancedExcel";
var options = {
	fileName : "downLoadCSV.csv" //[default : excel.csv] options.fileName 값이 없을 경우 default값 세팅
};
com.data.downloadGridViewCSV(grdObj, options);
//return 예시) 엑셀 파일 다운로드
 */
com.data.downloadGridViewCSV = function(grdObj, options) {
	if (com.util.isEmpty(options)) {
		options = {};
	}
	var opts = {
		fileName: options.fileName || "excel.csv", //[default: excel.csv] 저장 될 파일 이름
		type: options.type || "1", //[default: 1] Grid 저장 형태 (0이면 데이터 형태,1이면 표시 방식)
		delim: options.delim || ",", //[default: ,] CSV 파일에서 데이터를 구분할 구분자
		removeColumns: options.removeColumns || "", //[default: 없음] 저장 하지 않을 columns index, 여러컬럼인 경우 콤마(,)로 구분해서 정의 한다.
		header: options.header || "1", //[default: 1] Grid의 숨겨진 Column에 대한 저장 여부(0이면 저장 하지 않음,1이면 저장)
		hidden: options.hidden || 0, //[defalut: 0] Grid의 숨겨진 Column에 대한 저장 여부(0이면 저장 하지 않음,1이면 저장)
		checkButton: options.checkButton || "1", //[default: 1] Grid의 Control(Check, Radio, Button) Column에 대해 히든 여부 (0이면 control Column히든,1이면 보여줌)
		saveList: options.saveList || "" //[default: 없음] hidden에 관계없이 저장할 column id들의 array
	}
	grdObj.saveCSV(opts);
};



/**
 * GridView에 엑셀 파일의 데이터를 업로드한다.
 *
 * @param {Object} grdObj GridView Object
 * @param {Object} options JSON형태로 저장된 그리드의 엑셀 업로드 옵션
 *
 * @param {String}  options.type				[default: 0] 1이면 엑셀 파일이 그리드의 보이는 결과로 만들어져있을때 0이면 엑셀 파일이 그리드의 실제 데이터로 구성되어있을때
 * @param {Number}  options.sheetNo				[default: 0] excel파일에서 그리드의 데이터가 있는 sheet번호
 * @param {Number}  options.startRowIndex		[default: 0] excel파일에서 그리드의 데이터가 시작되는 행의 번호(헤더 포함)
 * @param {Number}  options.startColumnIndex	[default: 0] excel파일에서 그리드의 데이터가 시작되는 열의 번호
 * @param {Number}  options.endColumnIndex		[default: 0] excel파일에서 그리드의 데이터가 끝나는 열의 index ( 엑셀컬럼수가 그리드컬럼수 보다 작은 경우 그리드 컬러수를 설정)
 * @param {String}  options.headerExist			[default: 0] excel파일에서 그리드의 데이터에 header가 있는지 여부(1이면 header 존재 0이면 없음)
 * @param {String}  options.footerExist			[default: 1] excel파일에서 그리드의 데이터에 footer가 있는지 여부(1이면 footer 존재 0이면 없음 기본값은 1 그리드에 footer가 없으면 적용되지 않음)
 * @param {String}  options.append				[default: 0] excel파일에서 가져온 데이터를 그리드에 append시킬지 여부(1이면 현재 그리드에 데이터를 추가로 넣어줌 0이면 현재 그리드의 데이터를 삭제하고 넣음)
 * @param {String}  options.hidden				[default: 0] 읽어들이려는 엑셀파일에 hidden column이 저장되어 있는지 여부를 설정하는 int형 숫자(0이면 엑셀파일에 hidden 데이터가 없으므로 그리드 hidden column에 빈 데이터를 삽입 1 : 엑셀파일에 hidden 데이터가 있으므로 엑셀 파일로부터 hidden 데이터를 삽입 )
 * @param {String}  options.fillHidden			[default: 0] Grid에 hiddenColumn에 빈 값을 넣을지를 결정하기 위한 int형 숫자(1이면 hidden Column에 빈 값을 저장하지 않음,0이면 hidden column이 저장되어있지 않은 Excel File이라 간주하고 hidden Column에 빈 값을 넣어줌)(hidden이 0인 경우에는 fillhidden은 영향을 끼치지 않음)
 * @param {String}  options.skipSpace			[default: 0] 공백무시 여부(1이면 무시 0이면 포함)
 * @param {Array}   options.insertColumns		radio, checkbox와 같은 컬럼을 엑셀에서 받아 오지 않고, 사용자 컬럼 설정 으로 업로드 ( 데이터 구조 : [ { columnIndex:1, columnValue:"1" } ] )
 * @param {String}  options.removeColumns		[default: 없음] 저장 하지 않을 column index, 여러컬럼인 경우 콤마(,)로 구분해서 정의 한다.
 * @param {String}  options.popupUrl			업로드시에 호출할 popup의 url
 * @param {String}  options.delim				업로드시 데이터를 구분하는 구분자 (default: , )
 * @param {String}  options.status				[default: R]업로드된 데이터의 초기 상태값, 설정하지 않으면 "R"로 설정되며 "C"값을 설정 할 수 있다.
 * @param {String}  options.pwd					엑셀파일에 암호가 걸려 있는 경우, 비밀번호
 * @param {String}  options.optionParam			[default: 없음] DRM 연계시 사용자 정의 class에 HashMap 인자로 전달할 값. key는 "optionParam"으로 참조한다.
 * @param {String}  options.cellDataConvertor	[default: true] 컬럼값을 사용자가 수정할수 있는 연계 클래스의 전체 패키지명. (AbstractCellDataProvider class를 상속후 convertValue method를 구현해야 함.
 * @param {String}  options.decimal				[default: 4] 셀의 데이터가 소수인 경우, 최종 소수점 자리수. (기본값: 4) (예: 3인경우 4자리에서 반올림해서 3자리를 최종 표시.)
 * @param {String}  options.useModalDisable		[default: false] 업로드 팝업창이 활성화 될때 부모창의 컴포넌트 disabled 처리 유무.
 * @param {String}  options.useMaxByteLength	[default: false] ignoreChar 속성으로 설정한 문자를 제외하고 maxByteLength 속성으로 설정한 길이만큼의 데이터만 업로드.
 * @param {String}  options.dateFormat			[default: yyyy-MM-dd] 엑셀의 셀포맷이 날짜형식으로 되어 있는경우 format. 기본값은 "yyyy-MM-dd"
 * @param {String}  options.byteCheckEncoding	[default: EUC-KR] useMaxByteLength 설정되어 있는경우 byte처리시 지정할 인코딩. EUC-KR인경우 2byte처리 UTF-8일경우 3byte처리한다. (default는 EUC-KR)
 * @param {String}  options.features			upload화면이 뜰 때 string 형식의 스타일 정보. 지정되지 않은경우 upload창이 기본 스타일로 생성
 * @memberOf com.data
 * @date 2019.11.16
 * @author 박상규
 * @example
var options = {
	type : "0",
	sheetNo : 0
};
com.data.uploadGridViewExcel(grd_basicInfo,  options);
 */
com.data.uploadGridViewExcel = function (grdObj, options) {
	if (com.util.isEmpty(options)) {
		options = {};
	}
	var opts = {
		type: options.type || "0", //String, 1이면 엑셀 파일이 그리드의 보이는 결과로 만들어져있을때  0이면 엑셀 파일이 그리드의 실제 데이터로 구성되어있을때
		sheetNo: options.sheetNo || 0, //Number, excel파일에서 그리드의 데이터가 있는 sheet번호
		startRowIndex: options.startRowIndex || 1, //Number, [defalut:0] excel파일에서 그리드의 데이터가 시작되는 행의 번호(헤더 포함)
		startColumnIndex: options.startColumnIndex || 0, //Number, [defalut:0] excel파일에서 그리드의 데이터가 시작되는 열의 번호
		endColumnIndex: options.endColumnIndex || 0, //Number, [defalut: 0] excel파일에서 그리드의 데이터가 끝나는 열의 index
		//( 엑셀컬럼수가 그리드컬럼수 보다 작은 경우 그리드 컬러수를 설정)
		headerExist: options.headerExist || "0", //String, [defalut:0] excel파일에서 그리드의 데이터에 header가 있는지 여부
												 //(1이면 header 존재 0이면 없음)
		footerExist: options.footerExist || "1", //String, [defalut: 1] excel파일에서 그리드의 데이터에 footer가 있는지 여부
		//(1이면 footer 존재 0이면 없음 기본값은 1 그리드에 footer가 없으면 적용되지 않음)
		append: options.append || "0", //String, [defalut: 0] excel파일에서 가져온 데이터를 그리드에 append시킬지 여부
									   // (1이면 현재 그리드에 데이터를 추가로 넣어줌 0이면 현재 그리드의 데이터를 삭제하고 넣음)
		hidden: options.hidden || "0", //String, [defalut: 0] 읽어들이려는 엑셀파일에 hidden column이 저장되어 있는지 여부를 설정하는 int형 숫자(0이면
									   // 엑셀파일에 hidden 데이터가 없으므로 그리드 hidden column에 빈 데이터를 삽입
									   // 1 : 엑셀파일에 hidden 데이터가 있으므로 엑셀 파일로부터 hidden 데이터를 삽입 )
		fillHidden: options.fillHidden || "0", //String, [defalut: 0] Grid에 hiddenColumn에 빈 값을 넣을지를 결정하기
											   // 위한 int형 숫자(1이면 hidden Column에 빈 값을 저장하지 않음,0이면 hidden
											   // column이 저장되어있지 않은 Excel  File이라 간주하고 hidden Column에 빈
											   // 값을 넣어줌)(hidden이 0인 경우에는 fillhidden은 영향을 끼치지 않음)
		skipSpace: options.skipSpace || "0", //String, [defalut: 0] 공백무시 여부(1이면 무시 0이면 포함)
		insertColumns: options.insertColumns || "",//Array, radio, checkbox와 같은 컬럼을 엑셀에서 받아 오지 않고
												   //사용자 컬럼 설정 으로 업로드 ( 데이터 구조 : [ { columnIndex:1, columnValue:"1" } ] )
		popupUrl: options.popupUrl || "", //String, 업로드시에 호출할 popup의 url
		status: options.status || "R", //String, [defalut: R]업로드된 데이터의 초기 상태값, 설정하지 않으면 "R"로 설정되며 "C"값을 설정 할 수 있다.
		pwd: options.pwd || "" //String, 엑셀파일에 암호가 걸려 있는 경우, 비밀번호
	};

	grdObj.advancedExcelUpload(opts);

};


/**
 * GridView에 CSV 파일의 데이터를 업로드한다.
 *
 * @param {String}  options.type			[default: 1, 0]데이터 형태 (0이면 실 데이터 형태,1이면 display 표시 방식)
 * @param {String}  options.header			[default: 1, 0]Grid header 존재 유무 (0이면 header row수를 무시하고 전부 업로드하고 1이면 header row수 만큼 skip한다.)
 * @param {String}  options.delim			[default: ',']CSV 파일에서 데이터를 구분할 구분자
 * @param {String}  options.escapeChar		CSV 데이터에서 제거해야 되는 문자셋 ( ex) '\'' )
 * @param {Number}  options.startRowIndex 	[default: 0] csv파일에서 그리드의 데이터가 시작되는 행의 번호, startRowIndex가 설정되면, header 설정은 무시된다.
 * @param {String}  options.append			[default: 0, 1]csv파일에서 가져온 데이터를 그리드에 append시킬지 여부(1이면 현재 그리드에 데이터를 추가로 넣어줌 0이면 현재 그리드의 데이터를 삭제하고 넣음)
 * @param {Number}  options.hidden			[default: 0, 1]hidden Column에 대한 저장 여부(0이면 저장하지않음,1이면 저장)
 * @param {String}  options.fillHidden		[default: 0, 1]hidden Column에 빈 값을 넣을지를 결정하기 위한 int형 숫자(1이면 hidden Column에 빈 값을 저장하지 않음,0이면 hidden column이 저장되어있지 않은 csv File이라 간주하고 hidden Column에 빈 값을 넣어줌)(hidden이 0인 경우에는 fillhidden은 영향을 끼치지 않음)
 * @param {String}  options.skipSpace		[default: 0, 1]공백무시 여부(1이면 무시 0이면 포함)
 * @param {String}  options.expression		[default: 1, 0]expression 컬럼 데이터를 포함하고 있는지 여부, 기본값은 미포함(1이면 미포함, 0이면 포함)
 * @param {String}  options.popupUrl		업로드시에 호출할 popup의 url
 * @param {String}  options.status			[default: R]업로드된 데이터의 초기 상태값, 설정하지 않으면 "R"로 설정되며 "C"값을 설정 할 수 있다.
 * @param {String}  options.ignoreSpan		[default: 0, 1] span되어 있는 경우 span을 무시하고 데이터를 읽을지 여부 (0이면 머지되어 있는 컬럼을 하나로 본다, 1이면 머지되어 있는 컬럼을 각각읽는다)
 * @param {String}  options.optionParam		[default: 없음] DRM 연계시 사용자 정의 class에 HashMap 인자로 전달할 값. key는 "optionParam"으로 참조한다.
 * @memberOf com.data
 * @date 2019.11.16
 * @author 박상규
 * @example
var gridId = "grd_advancedExcel";
var options = {};
com.data.uploadGridViewCSV(gridId,  options);
// return 예시) 엑셀 파일(.CSV) 업로드
 */
com.data.uploadGridViewCSV = function (grdObj, options) {
	if (com.util.isEmpty(options)) {
		options = {};
	}

	var opts = {
		type: options.type || "0",					// String, [default: 1, 0]데이터 형태 (0이면 실 데이터 형태,1이면 display 표시 방식)
		header: options.header || "0",				// String, [default: 1, 0]Grid header 존재 유무 (0이면 header row수를 무시하고 전부 업로드하고 1이면 header row수 만큼 skip한다.)
		delim: options.delim || ",", 				// String, [default: ',']CSV 파일에서 데이터를 구분할 구분자
		escapeChar: options.escapeChar || "",		// String, CSV 데이터에서 제거해야 되는 문자셋 ( ex) '\'' )
		startRowIndex: options.startRowIndex || 0,	// Number, [defalut: 0] csv파일에서 그리드의 데이터가 시작되는 행의 번호, startRowIndex가 설정되면, header 설정은 무시된다.
		append: options.append || "0", 				// String, [defalut: 0, 1]csv파일에서 가져온 데이터를 그리드에 append시킬지 여부(1이면 현재 그리드에 데이터를 추가로 넣어줌 0이면 현재 그리드의 데이터를 삭제하고 넣음)
		hidden: options.hidden || 1, 				// Number, [defalut: 0, 1]hidden Column에 대한 저장 여부(0이면 저장하지않음,1이면 저장)
		fillHidden: options.fillHidden || "0",		// String, [defalut: 0, 1]hidden Column에 빈 값을 넣을지를 결정하기 위한 int형 숫자(1이면 hidden Column에 빈 값을 저장하지 않음,0이면 hidden column이 저장되어있지 않은 csv File이라 간주하고 hidden Column에 빈 값을 넣어줌)(hidden이 0인 경우에는 fillhidden은 영향을 끼치지 않음)
		skipSpace: options.skipSpace || "0", 		// String, [defalut: 0, 1]공백무시 여부(1이면 무시 0이면 포함)
		expression: options.expression || "1",		// String, [defalut: 1, 0]expression 컬럼 데이터를 포함하고 있는지 여부, 기본값은 미포함(1이면 미포함, 0이면 포함)
		popupUrl: options.popupUrl || "" 			// String, 업로드시에 호출할 popup의 url
	}
	grdObj.readCSV(opts);
};

/**
 * Group안에 포함된 각 컴포넌트의 입력 값에 대한 데이터 유효성 검사를 수행한다. <br>
 *
 * 컴포넌트 속성 유효성 검사를 수행하고, valInfoArr 유효성 검사 옵션에 대해서 유효성 검사를 수행한다. <br>
 * valInfoArr 유효성 검사 옵션 파라미터를 전달하지 않은 경우 컴포넌트 속성(mandatory, allowChar, ignoreChar, maxLength, maxByteLength, minLength, minByteLength)에 대해서만 유효성 검사를 수행한다. <br>
 *
 * 최대 입력 문자수(maxLength), 최대 입력 바이트수(maxByteLength)은 컴포넌트의 속성 설정을 권장한다. <br>
 * 최대 입력 문자수(maxLength)를 컴포넌트의 속성에 설정을 하게 되면 키 입력 자체를 최대 입력 문자수(maxLength)보다 더 많이 입력받지 않도록 입력 자체를 막는다. <br>
 * 입력 허용 문자(allowChar), 입력 허용 불가 문자(ignoreChar) 설정은 컴포넌트의 속성을 통해서 설정한다. <br>
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {Object} grpObj 그룹 컴포넌트 객체
 * @param {Object[]} options 유효성 검사 옵션 <br/>
 * @param {String} options[].id 유효성 검사 대상 DataCollection 컬럼 아이디 또는 컴포넌트 아이디
 * @param {String} options[].label 유효성 검사 실패 시 출력할 레이블 명 (DataCollection 컬럼명을 참조하지 않고 싶은 경우 사용함)
 * @param {Boolean} options[].mandatory 필수 입력 값 여부
 * @param {Number} options[].minLength 최소 입력 자리수
 * @param {Number} options[].minByteLength 최소 입력 자리수 (Byte 단위)
 * @param {Boolean} options[].isEmail 이메일 유효성 검사 실행
 * @param {Boolean} options[].isPhone 전화번호 유효성 검사 수행
 * @param {requestCallback} options[].valFunc 사용자 유효성 검사 함수
 * @param {String} tacId 그룹이 포함된 TabControl 컴포넌트 아이디
 * @param {String} tabId 그룹이 포함된 TabControl 컴포넌트의 Tab 아이디
 * @returns {Boolean} 유효성 검사 결과
 * @example

if (com.data.validateGroup(grp_LoginInfo)) {
	if (confirm("변경된 데이터를 저장하시겠습니까?")) {
		com.sbm.execute("WS0201U04");
	}
}

var valInfo = [ { id : "grpCd", mandatory : true, minLength : 5 },
				{ id : "grpNm", mandatory : true },
				{ id : "ibx_isUse", label : "사용여부", mandatory : true } ];

if (com.data.validateGroup(grp_LoginInfo, valInfo)) {
	if (confirm("변경된 데이터를 저장하시겠습니까?")) {
		com.sbm.execute("WS0201U04");
	}
}

var valInfo = [ { id : "grpCd", label : "공통그룹코드", mandatory : true, minLength : 5 },
				{ id : "grpNm", label : "공통그룹명", mandatory : true } ];

if (com.data.validateGroup(grp_LoginInfo, valInfo)) {
	if (win.com.confirm("변경된 데이터를 저장하시겠습니까?")) {
		com.sbm.execute("WS0201U04");
	}
};

var valInfo = [ { id : "totWeight", mandatory : true },
				{ id : "totWeightPwr", mandatory : true },
				{ id : "totWeightPwr", mandatory : true },
				{ id : "ibxWeight1", mandatory : true,
					valFunc : function(value) {
						if (com.num.parseInt(ibxTotWeight.getValue()) < com.num.parseInt(ibxWeight1.getValue())) {
							return "총 중량이 세부 중량보다 커야 합니다.";
						}
					} },
				{ id : "winding", mandatory : true } ];

if (com.data.validateGroup(grpCsInfo, valInfo, tacCsInfo, "tabCsInfo1") == false) {
	return false;
}

var valInfo = [ { id : "prntMenuCd", mandatory : true }
				{ id : "menuCd", mandatory : true,
					valFunc : function(value) {
						if (dmaMenu.get("prntMenuCd") == dmaMenu.get("menuCd")) {
							return "상위 메뉴 코드와 메뉴 코드가 같아서는 안됩니다.";
						}
					} },
				 { id : "menuNm", mandatory : true },
				 { id : "menuLevel", mandatory : true },
				 { id : "menuSeq", mandatory : true },
				 { id : "urlPath", mandatory : true },
				 { id : "isUse", mandatory : true } ];

if (com.data.validateGroup(tblMenuInfo, valInfo, tacMenuInfo, "tabMenuInfo1") == false) {
	return false;
}
*/
com.data.validateGroup = function (grpObj, valInfoArr, tacObj, tabId) {
	var objArr = com.util.getChildren(grpObj, {
		includePlugin: "checkbox checkcombobox datePicker editor input inputCalendar multiselect radio selectbox searchbox secret textarea",
		recursive: true
	});

	var errors = [];

	try {
		for (var objIdx in objArr) {
			var obj = objArr[objIdx];

			var dataObjInfo = com.data.getDataCollection(obj);
			var dataCollection = null;
			var columnId = null;
			var value = null;

			if ((dataObjInfo !== undefined) && (dataObjInfo !== null)) {
				dataCollection = $p.getComponentById(dataObjInfo.runtimeDataCollectionId);
				columnId = dataObjInfo.columnId;
			}

			if ((dataCollection !== null) && (dataCollection.getObjectType() === "dataMap")) {
				value = dataCollection.get(dataObjInfo.columnId);
				if (typeof value === "string") {
					value = value.trim();
				}
			} else {
				var tempIdArr = obj.getID().split("_");
				if (obj.getPluginName() !== "editor") {
					if ((typeof obj.getValue === "function")) {
						value = obj.getValue();
						if (typeof value === "string") {
							value = value.trim();
						}
					} else {
						continue;
					}
				} else {
					value = obj.getText();
					if (typeof value === "string") {
						value = value.trim();
					}
				}
			}

			var valInfo = { id : columnId };
			var isVaild = false;

			for (var valIdx in valInfoArr) {
				if ((typeof valInfoArr[valIdx].id !== "undefined") && ((valInfoArr[valIdx].id === columnId) || (valInfoArr[valIdx].id === obj.getOriginalID()))) {
					valInfo = valInfoArr[valIdx];
					isVaild = true;
					break;
				}
			}

			if ((typeof objArr[objIdx].options.mandatory !== "undefined") && (objArr[objIdx].options.mandatory)) {
				valInfo.mandatory = true;
				isVaild = true;
			}

			if ((typeof objArr[objIdx].options.minlength !== "undefined") && (objArr[objIdx].options.minlength > 0)
					&& (objArr[objIdx].getPluginName() !== "inputCalendar")) {
				valInfo.minLength = objArr[objIdx].options.minlength;
				isVaild = true;
			}

			if ((typeof objArr[objIdx].options.minByteLength !== "undefined") && (objArr[objIdx].options.minByteLength > 0)
					&& (objArr[objIdx].getPluginName() !== "inputCalendar")) {
				valInfo.minByteLength = objArr[objIdx].options.minByteLength;
				isVaild = true;
			}

			if (isVaild === true) {
				_setResult(dataCollection, obj.getID(), valInfo, value);
			}
		}

		if (errors.length > 0) {
			if ((typeof tacObj !== "undefined") && (typeof tabId !== "undefined") && (tabId !== "")) {
				var tabIndex = tacObj.getTabIndex(tabId);
				tacObj.setSelectedTabIndex(tabIndex);
			}

			var option = {
				callBackParam : {
					"objId" : errors[0].objId
				}
			}

			com.win.alert(errors[0].message, function(param) {
				var obj = $p.getComponentById(param.objId);
				obj.focus();
			}, option);

			return false;
		} else {
			return true;
		}

		function _setResult(dataCollection, objId, valInfo, value) {
			var msgInfo = gcm.data._getValResultMsg(valInfo, value);

			if (com.util.isEmpty(msgInfo.message) === false) {
				var comObj = $p.getComponentById(objId);

				var errIdx = errors.length;
				errors[errIdx] = {};
				errors[errIdx].columnId = valInfo.id;
				errors[errIdx].objId = objId;

				if (com.util.isEmpty(valInfo.label) === false) {
					errors[errIdx].columnName = valInfo.label;
				} else if (com.util.isEmpty(dataCollection) === false) {
					var scope = gcm.win._getScope(dataCollection);
					errors[errIdx].columnName = scope.com.data.getColumnName(comObj);
				} else if (typeof comObj.getInvalidMessage === "function") {
					errors[errIdx].columnName = comObj.getInvalidMessage();
				}

				if (msgInfo.msgType == "2") {
					errors[errIdx].message = msgInfo.message;
				} else {
					if (com.util.isEmpty(errors[errIdx].columnName) === false) {
						errors[errIdx].message = com.str.attachPostposition(errors[errIdx].columnName) + " " + msgInfo.message;
					} else {
						errors[errIdx].message = msgInfo.message;
					}
				}
			}
		}
	} catch (e) {
		console.error("[com.data.validateGroup] Exception :: Object Id : " + obj.getID() + ", Plug-in Name: " + obj.getPluginName() + ", " + e.message);
	} finally {
		objArr = null;
	}
};


/**
 * GridView에 입력된 값에 대한 데이터 유효성을 검증한다. <br>
 *
 * 최대 입력 문자수(maxLength), 최대 입력 바이트수(maxByteLength)은 GridView 컬럼 속성 설정을 권장한다. <br>
 * 최대 입력 문자수(maxLength)를 컴포넌트의 속성에 설정을 하게 되면 키 입력 자체를 최대 입력 문자수(maxLength)보다 더 많이 입력받지 않도록 입력 자체를 막는다. <br>
 * 입력 허용 문자(allowChar), 입력 허용 불가 문자(ignoreChar) 설정은 GridView 컬럼 속성을 통해서 설정한다. <br>
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {Object} gridViewObj GridView 객체
 * @param {Object[]} options 데이터 유효성 검증 옵션
 * @param {String} options[].id 유효성 검사 대상 DataCollection 컬럼 아이디
 * @param {Boolean} options[].mandatory 필수 입력 값 여부
 * @param {Number} options[].minLength 최소 입력 자리수
 * @param {Boolean} options[].isEmail 이메일 유효성 검사 실행
 * @param {Boolean} options[].isPhone 전화번호 유효성 검사 수행
 * @param {requestCallback} options[].valFunc 사용자 유효성 검사 함수
 * @param {Object} tacObj GridView가 포함된 TabControl 컴포넌트 객체
 * @param {String} tabId GridView가 포함된 TabControl 컴포넌트의 Tab 아이디
 * @returns {Boolean} 유효성검사 결과
 * @example
var valInfo = [ {id: "grpCd", mandatory: true, minLength: 5},
			   {id: "grpNm", mandatory: true} ];

if (com.data.validateGridView(grd_MenuAuthority, valInfo)) {
   if (confirm("변경된 데이터를 저장하시겠습니까?")) {
	   scwin.saveGroup();
   }
}

var valInfo = [ {id: "grpCd", label : "공통그룹코드", mandatory: true, minLength: 5},
			   {id: "grpNm", label : "공통그룹명", mandatory: true} ];

if (com.data.validateGridView(grd_MenuAuthority, valInfo)) {
   if (confirm("변경된 데이터를 저장하시겠습니까?")) {
	   scwin.saveGroup();
   }
}

var valInfo = [ { id : "prntMenuCd", mandatory : true },
				{ id : "menuCd", mandatory : true,
				  valFunc : function() {
					if (dmaMenu.get("prntMenuCd") == dmaMenu.get("menuCd")) {
						return "상위 메뉴 코드와 메뉴 코드가 같아서는 안됩니다.";
					}
				  }
				},
				{ id : "menuNm", mandatory : true },
				{ id : "menuLevel", mandatory : true },
				{ id : "menuSeq", mandatory : true },
				{ id : "urlPath", mandatory : true },
				{ id : "isUse", mandatory : true } ];

if (com.data.validateGridView(grd_MenuAuthority, valInfo, tacMenuInfo, "tabMenuInfo1") == false) {
   return false;
}
 */
com.data.validateGridView = function (gridViewObj, valInfoArr, tacObj, tabId) {

	if (gridViewObj === null) {
		return false;
	}

	var dataList = com.util.getGridViewDataList(gridViewObj);
	if (dataList === null) {
		console.log("Can not find the datalist of '" + gridViewObjId + "' object.");
		return false;
	}

	var errors = [];

	try {
		var modifiedIdx = dataList.getModifiedIndex();
		for (var dataIdx = 0; dataIdx < modifiedIdx.length; dataIdx++) {
			var valInfo = {};
			var isVaild = false;

			var modifiedData = dataList.getRowJSON(modifiedIdx[dataIdx]);
			if (modifiedData.rowStatus === "D") {
				continue;
			}

			for (var valIdx in valInfoArr) {
				if ((typeof valInfoArr[valIdx].id !== "undefined") && (modifiedData[valInfoArr[valIdx].id] !== "undefined")) {
					var value = modifiedData[valInfoArr[valIdx].id];
					if (typeof value === "string") {
						value = value.trim();
					}
					_setResult(modifiedIdx[dataIdx], dataList, gridViewObj.getID(), valInfoArr[valIdx], value);
				}
			}
		}

		if (errors.length > 0) {
			if ((typeof tacObj !== "undefined") && (typeof tabId !== "undefined") && (tabId !== "")) {
				var tabIndex = tacObj.getTabIndex(tabId);
				tacObj.setSelectedTabIndex(tabIndex);
			}

			var option = {
				callBackParam : {
					"objId" : errors[0].objId,
					"columnId" : errors[0].columnId,
					"rowIndex" : errors[0].rowIndex,
				}
			};

			com.win.alert(errors[0].message, function(param) {
				var grdiViewObj = $p.getComponentById(param.objId);
				grdiViewObj.setFocusedCell(param.rowIndex, param.columnId, true);
			}, option);

			return false;
		} else {
			return true;
		}

		function _setResult(rowIndex, dataList, gridViewObjId, valInfo, value) {

			var msgInfo = gcm.data._getValResultMsg(valInfo, value);

			if (com.util.isEmpty(msgInfo.message) === false) {
				var errIdx = errors.length;
				errors[errIdx] = {};
				errors[errIdx].columnId = valInfo.id;
				errors[errIdx].objId = gridViewObjId;
				if (com.util.isEmpty(valInfo.label) === false) {
					errors[errIdx].columnName = valInfo.label;
				} else {
					errors[errIdx].columnName = dataList.getColumnName(valInfo.id);
				}
				errors[errIdx].rowIndex = rowIndex;

				if (msgInfo.msgType == "2") {
					errors[errIdx].message = msgInfo.message;
				} else {
					errors[errIdx].message = com.str.attachPostposition(errors[errIdx].columnName) + " " + msgInfo.message;
				}
			}
		}
	} catch (e) {
		console.error("[com.data.validateGridView] Exception :: " + e.message);
	} finally {
		modifiedData = null;
		modifiedIdx = null;
		dataList = null;
		gridViewObj = null;
	}
};


/**
 * DataList를 동적으로 생성한다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {String} dsId	:: I :: Y ::  :: DataList의 아이디
 * @param {Array} colArr   :: I :: Y ::  :: 컬럼정보
 * @param {Array} typeArr  :: I :: Y ::  :: 컬럼들의 dataType 정의
 * @param {Object} options :: I :: N ::  :: dataCollection의 속성[baseNode, repeatNode, saveRemovedData, scwinObj]
 * @return {Object} dataCollection(dataList)
 * @author 박상규
 * @example
var dcoptions = {
	baseNode : "list",
	repeatNode : "map",
	saveRemovedData : "true"
};
var dlObj = com.data.createDataList("dlt_code", ["cdGrp", "cd", "nm","ord"], ["text", "text", "text", "text"] , dcoptions);
 */
com.data.createDataList = function(dsId, colArr, typeArr, options) {
	try {
		var dltObj = com.util.getComponent(dsId);
		if (!com.util.isEmpty(dltObj)) {
			$p.data.remove( dsId );
		}

		var colInfoJSON = [];
		if (typeof colArr !== "undefined") {

			colInfoJSON = [];

			for (var i=0; i < colArr.length; i++) {
				var dataType = "text";
				if (typeof typeArr !== "undefined") {
					dataType = typeArr[i];
				}
				var colInfo = {
					"id" : colArr[i],
					"dataType" : dataType,
					"name" : colArr[i]
				};
				colInfoJSON.push(colInfo);
			}
		}

		if (typeof options === "undefined") {
			options = {};
			options.baseNode = "list";
			options.repeatNode = "map";
			options.saveRemovedData = "true";
		};

		var dataCollectionJSON = {
			id : dsId,
			type : "dataList",
			option : {
				"baseNode" : options.baseNode || "list",
				"repeatNode" : options.repeatNode || "map",
				"saveRemovedData" : options.saveRemovedData || "true",
			},
			columnInfo : colInfoJSON
		};

		$p.data.create(dataCollectionJSON);
		return com.util.getComponent(dsId);
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * DataMap을 동적으로 생성한다.
 *
 * @memberOf com.data
 * @date 2019.11.16
 * @param {String} dsId	:: I :: Y ::  :: dataMap 의 아이디
 * @param {Array} colArr   :: I :: Y ::  :: 컬럼정보
 * @param {Object} options :: I :: N ::  :: DataMap 생성 옵션
 * @author 박상규
 * @return {Object} dataCollection(dataMap)
 * @example
var mapObj = com.data.createDataMap("dma_test", ["col1", "col2", "col3"] , ["text", "text", "text"]);
 */
com.data.createDataMap = function(dsId, colArr, typeArr, options) {
	try{
		var dltObj = com.util.getComponent(dsId);
		if (!com.util.isEmpty(dltObj)) {
			$p.data.remove( dsId );
		}

		var colInfoJSON = [];
		if (typeof colArr !== "undefined") {
			colInfoJSON = [];
			for (var i=0; i < colArr.length; i++) {
				var dataType = "text";
				if (typeof typeArr !== "undefined") {
					dataType = typeArr[i];
				}
				var colInfo = {
					"id" : colArr[i],
					"type" : dataType,
					"name" : colArr[i]
				};
				colInfoJSON.push(colInfo);
			}
		}

		if (typeof options === "undefined") {
			options = {
				"baseNode" :  "map",
			};
		};

		var dataCollectionJSON = {
			"id" : dsId,
			"type" : "dataMap",
			"option" : {
				"baseNode" : options.baseNode || "map",
			},
			"keyInfo" : colInfoJSON
		};

		$p.data.create(dataCollectionJSON);
		return com.util.getComponent(dsId);
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 전체 데이터를 초기 설정된 데이터(original Data)로 바꾸고 행의 상태를 초기화(R) 시킨다.
 * 초기 설정된 데이터란 setJSON, setXML 등과 같은 API들을 통해 설정된 데이터가 이에 속한다.
 * 추가(C)된 행은 제거한다.
 *
 * @param {String} dltId DataList 객체 또는 DataList 아이디
 * @memberOf com.data
 * @date 2019.11.16
 * @author 김응한
 * @example
com.data.undoAll(dlt_grdAllData);
 */
com.data.undoAll = function(dltId) {
	try {
		var dltObj = null;
		if (typeof dltId === "string") {
			dltObj = com.util.getComponent(dltId);
		} else {
			dltObj = dltId;
		}

		var rowCount = dltObj.getRowCount();
		var removeIdx = [];
		var undoIdx =[];

		dltObj.setBroadcast(false);

		for (var i = 0; i <rowCount; i++) {
			if(dltObj.getRowStatus(i) == "C") {
				removeIdx.push(i);
				continue;
			}
			undoIdx.push(i)
		}

		dltObj.removeRows(removeIdx);
		dltObj.undoRows(undoIdx);

		dltObj.setBroadcast(true, true);
	} catch (e) {
		console.log(e)
	}
};

/**
 * 지정한 GridView에 선택컬럼(chk)이 체크된 Row를 취소(Undo) 처리한다.
 *
 * @param {String} dltId DataList 객체 또는 DataList 아이디
 * @memberOf com.data
 * @date 2019.11.16
 * @author 박상규
 * @example
com.data.undoRow(dlt_data1);
 */
com.data.undoRow = function(dltId) {
	try {
		var dltObj = null;
		if (typeof dltId === "string") {
			dltObj = com.util.getComponent(dltId);
		} else {
			dltObj = dltId;
		}

		var checkedIdx = dltObj.getMatchedIndex("chk", "1");

		dltObj.setBroadcast(false);

		for (var idx = checkedIdx.length - 1; idx >= 0; idx--) {
			if(dltObj.getRowStatus(checkedIdx[idx]) == "C") {
				dltObj.removeRow(checkedIdx[idx]);
			} else {
				dltObj.undoRow(checkedIdx[idx]);
			}
		}

		dltObj.setBroadcast(true, true);
	} catch (ex) {
		console.log(ex);
	}
};



/**
 * 지정한 GridView에 선택컬럼(chk)이 체크된 Row를 삭제(Delete) 처리한다.
 *
 * @param {String} dltId DataList 객체 또는 DataList 아이디
 * @memberOf com.data
 * @date 2019.11.16
 * @author 박상규
 * @example
com.data.deleteRow(dlt_data1);
 */
com.data.deleteRow = function(dltId) {
	try {
		var dltObj = null;
		if (typeof dltId === "string") {
			dltObj = com.util.getComponent(dltId);
		} else {
			dltObj = dltId;
		}

		var checkedIdx = dltObj.getMatchedIndex("chk", "1");

		dltObj.setBroadcast(false);

		for (var idx = checkedIdx.length - 1; idx >= 0; idx--) {
			if(dltObj.getRowStatus(checkedIdx[idx]) == "C") {
				dltObj.removeRow(checkedIdx[idx]);
			} else {
				dltObj.deleteRow(checkedIdx[idx]);
				dltObj.setCellData(checkedIdx[idx], "chk", "");
			}
		}

		dltObj.setBroadcast(true, true);
	} catch (ex) {
		console.log(ex);
	}
};

/**
 * 전체 데이터를 조회후 Filter로 Paging을 처리하는 경우 사용한다.
 *
 * @param {String} dltObj 필터 대상이 되는 데이터리스트 객체
 * @param {Object} filterInfo filter 옵션
 * @param {String} [filterInfo.pglId] 페이지 컴포넌트 객체
 * @param {String} [filterInfo.pglFlag] 페이지 컴포넌트의 index위치를 유지 할지 여부,기본값은 false 서버사이드에서 조회해온 경우는 false , 페이지 이동시에는 true 전달
 * @param {String} [filterInfo.rowSize] rowSize 한페이지당 보여줄 rowSize
 * @param {String} [filterInfo.filterVal] 해당값이 있는 경우 해당값을 기준으로 필터한 결과로 페이징 처리를 진행한다. 기본값은 ""
 * @param {String} [filterInfo.filterCol] filterVal 적용시 필터 대상이 되는 컬럼명 리스트  , 기본값은 데이터리스트의 전체컬럼리스트
 * @return {Number} filterValfh 필터된 데이터의 전체 row 수
 * @memberOf com.data
 * @date 2019.11.16
 * @author 김응한
 * @example
//전체데이터 조회후 페이징 처리 및 필터 하는경우
filterInfo = {
	pglObj  : pglObj, //페이징 컴포넌트
	pglFlag : false, //페이징 컴포넌트가 현재 선택한 페이지를 유지 여부 기본 false pglObj값이 존재해야함
	rowSize : 20, // 한페이지당 보여줄 row 수 pglObj값이 존재해야함
	filterVal  : "user111", // 필터 벨류
	filterCol : "userNm,codeNm", //필터벨류 적용할 컬럼 , 없는경우 전체컬럼을 대상으로 함
}
var filterRowCnt = com.data.dataFilter(dltObj,filterInfo);
tbx_filterCnt.setValue(filterCnt);

//전체데이터 조회후 페이징 없이 필터만 하는경우
filterInfo = {
	filterVal  : "user111", // 필터 벨류
	filterCol : "userNm,codeNm", //필터벨류 적용할 컬럼 , 기본값은 데이터리스트의 전체컬럼목록
}
var filterRowCnt = com.data.dataFilter(dltObj,filterInfo);
tbx_filterCnt.setValue(filterCnt);
 */
com.data.filterPaging = function(dltId,filterInfo){

	try {
		var dltObj = null;
		if (typeof dltId === "string") {
			dltObj = com.util.getComponent(dltId);
		} else {
			dltObj = dltId;
		}

		if(com.util.isEmpty(filterInfo)){
			filterInfo ={};
		}
		var pglId    = filterInfo.pglId    || "";
		var pglFlag   = filterInfo.pglFlag   || false
		var rowSize   = filterInfo.rowSize	 || 10
		var filterVal = filterInfo.filterVal || ""
		var filterCol = filterInfo.filterCol || "";
		var focusComp = filterInfo.focusComp || "";

		var recFocusComp = com.util.getComponent(WebSquare.util.getFocusedComponentId());
		if(com.util.isEmpty(focusComp)){
			if(!com.util.isEmpty(recFocusComp) && !com.util.isEmpty(recFocusComp.getPluginName) && recFocusComp.getPluginName() =="input"){
				focusComp = recFocusComp;
			}
		}


		var pglObj = null;
		if (typeof pglId === "string") {
			pglObj = com.util.getComponent(pglId);
		} else {
			pglObj = pglId;
		}

		dltObj.clearFilter();
		if(filterVal !=""){
			var condition = "and";
			var colList   = dltObj.cellIdList;
			var colLen    = colList.length;
			var noRefresh = true;
			var colId ="";
			if(filterCol !="" && typeof filterCol === "string"){
				colList = filterCol.split(",");
			}

			for (var i = 0; i < colLen; i++) {
				colId = dltObj.getColumnID(colList[i]);

				if(colId =="chk"){
					continue;
				}

				if(com.util.isEmpty(colId)){
					continue;
				}

				if(i == colLen-1 && (com.util.isEmpty(pglObj) || pglObj._wTagName != "pageList")){
					noRefresh = false;
				}
				dltObj.setFilter( {"type":'row', "colIndex":colId, "key":filterVal, "condition":condition,"noRefresh" : noRefresh});
				condition ="or";
			}
		}

		var filterCnt = dltObj.getAllFilteredJSON().length;


		if(!com.util.isEmpty(pglObj) && pglObj._wTagName == "pageList"){

			var totalRow = dltObj.getAllFilteredJSON().length;

			var pageCnt = Math.ceil(totalRow /rowSize);
			pglObj.setCount(pageCnt,pglFlag);

			var pageIndex = pglObj.getSelectedIndex();
			var startRowIdx = rowSize * (pageIndex-1);
			var endtRowIdx  = rowSize * pageIndex;
			var filterOption = {
				"type" : "func",
				"key" : dlt_filterFunc,
				"condition" : "and",
				"param" :  {
					"startRowIdx" :  startRowIdx,
					"endRowIdx"  :  endtRowIdx

				}
			};
			dltObj.setColumnFilter(filterOption);

			function dlt_filterFunc(data, param, rowIndex) {
				var dltObj = com.util.getComponent(this.dataList);
				// paging 처리를 위한 filter 함수.
					var startRowIdx = param.startRowIdx;
					var endRowIdx = param.endRowIdx;
					var filterRowIdx = dltObj.getFilteredRowIndex(rowIndex);
					if( filterRowIdx >= startRowIdx && filterRowIdx < endRowIdx){
						return true;
					}else{
						return false;
					}
			}
		}

		if(!com.util.isEmpty(focusComp) && !com.util.isEmpty(focusComp.getPluginName) && focusComp.getPluginName() =="input"){
			focusComp.focus();
		}

		return filterCnt;
	} catch (ex) {
		console.error(ex);
	}
};


// =============================================================================
/**
 * 웹스퀘어 컴포넌트 제어, 다양한 객체(JSON, Array, XML) 제어, 파일 업로드/다운로드, 타이머, 클립보드 복사, Base64 인코딩&디코딩 등과 관련된 함수를 제공한다.
 *
 * @author 박상규
 * @class util
 * @namespace com.util
 */
 // =============================================================================

com.util = {}

/**
 * JSON Object로 변환해서 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {String|XML} value JSON 문자열 또는 XML Document
 * @return {Object} JSON 객체 or null
 * @author 박상규
 * @example
// 유효하지 않은 JSON 문자열 일 경우
com.util.getJSON("");
// return 예시)	null

// 유효한 JSON 문자열
var json = '{"tbx_sPrjNm":"1","tbx_sPrtLv":"2","tbx_sReqLv":"3"}';
com.util.getJSON(json);
// return 예시)	{tbx_sPrjNm: "1", tbx_sPrtLv: "2", tbx_sReqLv: "3"}
 */
com.util.getJSON = function (value) {
	try {
		if (com.util.isXmlDoc(value) === true) {
			return JSON.parse(WebSquare.json.XML2JSONString(value));
		} else {
			return JSON.parse(value);
		}
	} catch (e) {
		return value;
	}
};


/**
 * JSON Object인지 여부를 검사한다.
 *
 * @param {Object} jsonObj JSON Object가 맞는지 검사할 JSON Object
 * @memberOf com.util
 * @date 2019.11.16
 * @author 김응한
 * @return {Boolean} true or false
 * @example
com.util.isJSON("");
// return 예시) false
com.util.isJSON( {"tbx_sPrjNm": "1", "tbx_sPrtLv": "2", "tbx_sReqLv": "3"} );
// return 예시) true
 */
com.util.isJSON = function(json) {
	 try {
		 if (jQuery.isPlainObject(json) === false
				 && com.util.isArray(json) === false) {
			 return false;
		 }

		 if (typeof json === "object") {
			 try {
			   JSON.stringify(json);
			   return true;
			 }catch (e) {
			   return false;
			 }
		 } else if (typeof json === "string") {
			try{
				JSON.parse(json);
				return true;
			}catch(e){
				return false;
			}
		 }
		 return false;
	 } catch (e) {
		 console.error(e);
		 return false;
	 }
};


/**
 * 배열 객체인지 여부를 확인한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object}  array :: I :: N :: :: Array Object or String
 * @return {Boolean} Array 배열 판단 여부(Array 객체인 경우 true, 아닌경우 false)
 * @author 박상규
 * @example
com.util.isArray(arrObject); // return true
 */
com.util.isArray = function(array) {
	 try {
		 if ((typeof array !== "undefined") && (array !== null)
				 && (typeof array == "object")) {
			 if (array.constructor.name
					 && array.constructor.name.toLowerCase() == "array")
				 return true;
			 if (array.constructor && array.constructor == Array)
				 return true;
		 }
		 return false;
	 } catch (ex) {
		 console.error(ex);
		return false;
	 }
};


/**
 * 값이 Empty 상태(undefined, null, "")인지 판별한다.
 * @memberOf com.util
 * @date 2019.11.16
 * @param value Empty 여부를 판단할 값
 * @return Empty 여부 (true : Empty, false : Not Empty)
 * @example
if (com.util.isEmpty(empCd) === false) {
	console.log("empCd : " + empCd);
}
 */
com.util.isEmpty = function(value) {
	if ((typeof value === "undefined") || (value === null) || (value === "")) {
		return true;
	} else {
		return false;
	}
};


/**
 * 객체의 typeof 값을 반환하며 typeof의 값이 object인 경우 array, json, xml, null로 체크하여 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object} obj type을 반환 받을 객체(string,boolean,number,object 등)
 * @author 김응한
 * @return {String} 객체의 타입으로 typeof가 object인 경우 array, json, xml, null로 세분화하여 반환한다. 그외 object타입이 아닌경우 원래의 type(string,boolean,number 등)을 반환한다.
 * @example
 com.util.getObjectType("WebSquare");
 // return 예시) "string"

 com.util.getObjectType({"name":"WebSquare"});
 // return 예시) "json"

 com.util.getObjectType(["1","2"]);
 // return 예시) "array"
*/
 com.util.getObjectType = function (obj) {
 	var objType = typeof obj;
 	if (objType !== "object") {
 		return objType;
 	} else if (com.util.isArray(obj)) {
 		return "array";
 	} else if (com.util.isJSON(obj)) {
 		return "json";
 	} else if (obj === null) {
 		return "null";
 	} else {
 		var tmpDoc = WebSquare.xml.parse("<data></data>");
 		if (obj.constructor === tmpDoc.constructor || obj.constructor === tmpDoc.firstElementChild.constructor) {
 			return "xml";
 		} else {
 			return objType;
 		}
 	}
 };


/**
 * 현재 클라이언트 브라우저 환경의 모바일 여부를 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @author 박상규
 */
com.util.isMobile = function () {
	return WebSquare.util.isMobile();
};


/**
 * XML Document 객체인지 여부를 검사한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object} data XML Document 객체인지 여부를 검사한다.
 * @author 박상규
 * @return {Boolean} true or false
 */
com.util.isXmlDoc = function(data) {
	if (typeof data != 'object')
		return false;
	if ((typeof data.documentElement != 'undefined' && data.nodeType == 9)
			|| (typeof data.documentElement == 'undefined' && data.nodeType == 1)) {
		return true;
	}
	return false;
};


/**
 * GridView Row 삭제를 위한 CheckBox 동작을 세팅한다.
 * GridView에 삭제용 CheckBox가 있을 경우 onPageLoad 이벤트에서 com.util.setGridViewDelCheckBox 함수를 호출한다.
 * 이 함수가 정상 동작하려면 GridView의 Delete 처리용 CheckBox의 ColumnId와 Header Id를 "chk"로 설정해야 한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @author 김응한
 * @param {Array} gridViewObj GridView 객체 배열
 * @update 드릴다운도 적용되도록 수정 드릴다운 페이징은 적용안됨 김응한
 * @update 전체선택으로 삭제는 rowmoveRows로 처리되도록 수정 김응한
 * @example
com.util.setGridViewDelCheckBox(grd_OrganizationBasic);
com.util.setGridViewDelCheckBox([grd_Menu, grd_MenuAccess]);
 */
com.util.setGridViewDelCheckBox = function (gridViewObjArr) {
	try {
		if (com.util.getObjectType(gridViewObjArr) === "array") {
			for (idx in gridViewObjArr) {
				setGridViewDelCheckBox(gridViewObjArr[idx]);
			}
		} else {
			setGridViewDelCheckBox(gridViewObjArr);
		}

		function setGridViewDelCheckBox(gridViewObj) {
			gridViewObj.bind("oncellclick",
				function (row, col) {
					var columnId = gridViewObj.getColumnID(col);
					if (columnId == "chk") {
						var dltObj = com.util.getGridViewDataList(this);
						var realRowIndex = this.getRealRowIndex(row);

						if(dltObj.getFilterList().length >0){
							realRowIndex = dltObj.getFilteredRowIndex(realRowIndex);
						}
						var newValue = dltObj.getCellData(realRowIndex, columnId);
						com.util._setGridViewRowCheckBox(this, realRowIndex, newValue === "1" ? true : false);
					}
				}
			);
			gridViewObj.bind("onheaderclick",
				function (headerId) {
					if (headerId == "chk") {
						var newValue = this.getHeaderValue(headerId);
						var dltObj = com.util.getGridViewDataList(this);
						var rowCount = dltObj.getRowCount();
						var removeIdx = [];
						var deleteIdx = [];
						var undoIdx =[];
						for (var i = 0; i <rowCount; i++) {
							var realRowIndex = dltObj.getRealRowIndex(i);

							if(dltObj.getFilterList().length >0){
								realRowIndex = dltObj.getFilteredRowIndex(realRowIndex);
							}
							if(dltObj.getRowStatus(realRowIndex) == "C"){
								removeIdx.push(realRowIndex);
								continue;
							}
							if(newValue){
								deleteIdx.push(realRowIndex);
							}else{
								undoIdx.push(realRowIndex)
							}
						}

						if(newValue){
							dltObj.deleteRows(deleteIdx);
							dltObj.removeRows(removeIdx);
						}else{
							dltObj.undeleteRows(undoIdx);
						}

					}
				}
			);
		}
	} catch (e) {
		console.error("[com.util.setGridViewDelCheckBox] Exception :: " + e.message);
	}
};


com.util._setGridViewRowCheckBox = function (gridViewObj, rowIndex, newValue) {
	var rowIndexArr = gridViewObj.getChildrenRowIndexArray(rowIndex);
	var dltObj = com.util.getGridViewDataList(gridViewObj);

	for (var idx in rowIndexArr) {
		var childRowIndexArr = gridViewObj.getChildrenRowIndexArray(rowIndexArr[idx]);

		if (childRowIndexArr.length > 0) {
			com.util._setGridViewRowCheckBox( gridViewObj, rowIndexArr[idx], newValue);
		} else {
			com.util._deleteGridViewRow(gridViewObj, rowIndexArr[idx], newValue);
		}
	}

	com.util._deleteGridViewRow(gridViewObj, rowIndex, newValue);
};


com.util._deleteGridViewRow = function (gridViewObj, rowIndex, newValue) {
	gridViewObj.setCellChecked(rowIndex, "chk", newValue);
	var dltObj = com.util.getGridViewDataList(gridViewObj);

	if (newValue) {
		var rowStatus = dltObj.getRowStatus(rowIndex);
		if (rowStatus == "C") {
			dltObj.deleteRow(rowIndex);
			dltObj.removeRow(rowIndex);
		} else {
			dltObj.deleteRow(rowIndex);
		}
	} else {
		dltObj.undeleteRow(rowIndex);
	}
}


/**
 * 특정 컴포넌트의 자식 컴포넌트를 배열로 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object} comObj 컴포넌트 객체
 * @param {Object} options 하위 컴포넌트 검색 옵션 정보
 * @param {String} options.includeId 포함할 컴포넌트 id. 인자가 여러 개일 경우 공백을 구분자로 사용함.
 * @param {String} options.includePlugin 포함 컴포넌트 플러그인 이름. 인자가 여러 개일 경우 공백을 구분자로 사용함.
 * @author 박상규
 * @example
com.util.getChildren(grp_content);
com.util.getChildren(grp_content, {excludePlugin : "trigger input", excludeId : "treeview1_tooltip windowContainer1_tooltip");
com.util.getChildren(grp_content, {includeId : "ibx_name sbx_payTy"});
com.util.getChildren(grp_content, {includePlugin : "selectbox"});
com.util.getChildren(grp_content, {includeId : "ibx_name sbx_payTy", includePlugin : "input selectbox"});
 */
com.util.getChildren = function(comObj, options) {
	return WebSquare.util.getChildren(comObj, options);
};


/**
 * GridView와 바인딩된 DataList 객체를 반환한다.
 *
 * @param {Object} gridViewObj 바인딩 된 DataList가 존재하는지 검증할 GridView 객체
 * @memberOf com.util
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 바인딩 된 DataList 객체 반환 (바인된 객체가 없을 경우 null 반환)
 * @example
// 바인딩 되어있는 경우
com.util.getGridViewDataList(grd_First);
// return 예시) "dlt_first"

// 바인딩 되어있지 않은 경우
com.util.getGridViewDataList(grd_First);
// return 예시) undefined
 */
com.util.getGridViewDataList = function (gridViewObj) {
	var dataListId = gridViewObj.getDataList();

	if (dataListId !== "") {
		var dataList = $p.getComponentById(dataListId);
		if ((typeof dataList === "undefined") || (dataList === null)) {
			console.log("DataList(" + dataListId + ")를 찾을 수 없습니다.");
			return null;
		} else {
			return dataList;
		}
	} else {
		console.log(gridViewObj.getID() + "는 DataList가 세팅되어 있지 않습니다.");
		return null;
	}
};


/**
 * 주어진 아이디에 해당하는 웹스퀘어 컴포넌트를 찾아 반환한다.
 *
 * @param {String} compId 컴포넌트 아이디
 * @memberOf com.util
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 바인딩 된 DataList 객체 반환 (바인된 객체가 없을 경우 null 반환)
 * @example
var object = com.util.getGridViewDataList(compId);
 */
com.util.getComponent = function(compId) {
	var object = $p.getComponentById(compId);
	if (typeof object === "undefined") {
		return null;
	} else {
		return object
	}
};


/**
 * 동적으로 웹스퀘어 컴포넌트를 생성한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {String} strCompId 컴포넌트 ID
 * @param {String} strCompName 컴포넌트 태그명
 * @param {Object} option 컴포넌트 옵션
 * @param {String} parent 컴포넌트 생성 부모 노드 위치
 * @param {Object} itemSet 컴포넌트 setItemset 옵션
 * @return {Object} 생성된 컴포넌트 객체
 * @author 박상규
 * @example
com.util.createComponent("ibx_input1", "input" );
com.util.createComponent("ibx_input2", "input", { style: "width:120px; height:40px; float:left; margin : 20px;" });
com.util.createComponent("ibx_input2", "input", { style: "width:120px; height:40px; float:left; margin : 20px;" }, grp_content1);
 */
com.util.createComponent = function(strCompId, strCompName, option, parent, itemSet) {
	try {
		if ((typeof strCompId !== "undefined") && (strCompId !== "") && (typeof strCompName !== "undefined") && (strCompName !== "")) {

			if (typeof option == "undefined") {
				option = {};
			}

			if (typeof parent == "undefined") {
				parent = "";
			}

			if (typeof itemSet == "undefined") {
				itemSet = "";
			}

			return $p.dynamicCreate(strCompId, strCompName, option, parent, itemSet);
		}
	} catch (ex) {
		console.log(ex);
		return null;
	}
};


/**
 * 사용자가 지정한 함수가 주기적으로 실행된다.<br>
 *
 * 실행할 함수를 함수를 setInterval로 등록하여 함수가 주기적으로 계속 실행되도록 한다. SPA모드에서 페이지 이동 시 이 함수로 등록한 타이머를 자동으로 제거한다.<br>
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Function} func	실행할 함수
 * @param {Object} options	options인자로는 아래와 같은 인자가 사용된다.
 * @param {String} options.key timer를 구별하기 위한 키값. 이 값이 지정되지 않은 경우 키값을 func.toString().slice(0,30)을 키값으로 사용한다.
 * @param {Number} options.delay setInterval의 2번째 인자값. func함수가 delay시간 이후에 실행되도록 한다.  기본값은 1이다.
 * @param {Object} options.caller func내에서 this값을 caller로 변경한다.
 * @param {Object} options.args func에 전달할 인자값. array형태로 인자를 전달한다.
 * @param {Function} options.before_call : func 함수가 실행되기 직전에 실행할 함수. func함수와 마찬가지로 data를 인자로 받는다.
 * @param {Function} options.callback : func함수가 실행된 후에 실행할 함수. func함수의 return값을 인자로 받는다
 * @author 박상규
 * @example
com.util.setInterval(
	function() {
		com.win.alert("처리가 완료 되었습니다");
	},
	{ caller : grd_data1, delay : 2000, key : "interval1" }
);
 */
com.util.setInterval = function(func, options) {
	$p.setInterval(func, options);
};


/**
 * 사용자가 지정한 함수가 일정 시간 후에 실행된다.<br>
 *
 * 실행할 함수를 함수를 setInterval로 등록하여 함수가 주기적으로 계속 실행되도록 한다.SPA모드에서 페이지 이동 시 이 함수로 등록한 타이머를 자동으로 제거한다.<br>
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Function} func	실행할 함수
 * @param {Object} options	options인자로는 아래와 같은 인자가 사용된다.
 * @param {String} options.key timeout을 구별하기 위한 키값. 이 값이 지정되지 않은 경우 키값을 func.toString().slice(0,30)을 키값으로 사용한다.
 * @param {Number} options.delay func로 지정한 함수가 실행 될 간격으로 기본값은 1ms(millisecond / 1000분의 1초)이다. javascript setTimeout의 2번째 인자값.
 * @param {Object} options.caller func로 지정한 함수내에서 this값으로 지정 할 객체(웹스퀘어 컴포넌트 포함).
 * @param {Object} options.args func에 전달할 인자값. array형태로 인자를 전달한다.
 * @param {Function} options.before_call : func로 지정한 함수가 실행되기 직전에 실행 할 함수. func함수와 마찬가지로 data를 인자로 받는다.
 * @param {Function} options.callback : func로 지정한 함수가 실행된 후에 실행 할 함수. func로 지정한 함수의 return값을 인자로 받는다.
 * @author 박상규
 * @example
com.util.setTimeout(
	function() {
		com.win.alert("5분이 지났습니다.");
	},
	{ delay : 300000, key : "loginTimeout" }
);
 */
com.util.setTimeout = function(func, options) {
	$p.setTimeout(func, options);
};


/**
 * File Upload WFrame을 초기화한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object} fileUploadFrame File Upload WFrame 객체
 * @param {Object} option File Upload 옵션 정보
 * @param {Function} callbackUploadDoneFunc 파일 업로드 완료 후 콜백 함수
 * @author 박상규
 * @example
// 첨부 파일 업로드 모듈 초기 설정 옵션
// - option.maxFileCount : 업로드 가능한 첨부 파일 개수
// - option.totalFileSize : 업로드 가능한 전체 첨부 파일 크기 (개별 첨부 파일 크기는 서버 프레임워크에서 세팅함)
// - option.policy : 파일 업로드 정책명
// - option.fileGrpId : 파일 그룹 아이디 (신규 등록 화면이면 ""로 세팅하고, 수정 화면이면 기존에 등록된 파일 그룹 아이디를 세팅함)
var option = {
	maxFileCount : 3,
	totalFileSize : 209715200,
	policy : "templates",
	fileGrpId : "23"
};

// 첨부 파일 업로드 모듈 초기 설정
// - fileUploadFrame File Upload WFrame 객체
// - option File Upload 옵션 정보
// - callbackUploadDoneFunc 파일 업로드 완료 후 콜백 함수
// 실제 DB에 내용과 첨부 파일 정보 저장 처리를 callbackUploadDoneFunc에 정의된 콜백함수에서 처리해야 한다.
com.setFileUpload(wfm_fileUpload, option, scwin.callbackUploadDone);
 */
com.util.setFileUpload = function(fileUploadFrame, option, callbackUploadDoneFunc) {
	try {
		var fileUploadWindow = fileUploadFrame.getWindow();

		var policy = "default";
		if (com.util.isEmpty(option.policy) === false) {
			policy = option.policy;
			fileUploadWindow.scwin.policy =  option.policy;
		}

		if (com.util.isEmpty(option.fileGrpId) === false) {
			fileUploadWindow.scwin.fileGrpId = option.fileGrpId;
		} else {
			fileUploadWindow.scwin.fileGrpId = "";
		}

		if (com.util.isEmpty(fileUploadWindow.mpd_multiFileUpload) === false) {
			fileUploadWindow.scwin.maxFileCount = option.maxFileCount;
			fileUploadWindow.scwin.maxFileSize = option.maxFileSize;
			fileUploadWindow.scwin.totalFileSize = option.totalFileSize;
			fileUploadWindow.mpd_multiFileUpload.setMaxFileSize(1048576000000);
			fileUploadWindow.scwin.callBackUploadDoneFunc = callbackUploadDoneFunc;
		} else if (com.util.isEmpty(fileUploadWindow.upd_singleFileUpload) === false) {
			fileUploadWindow.scwin.callBackUploadDoneFunc = callbackUploadDoneFunc;
			if (typeof option.callbackSelectedDone === "function") {
				fileUploadWindow.scwin.callbackSelectedDone = option.callbackSelectedDone;
			}
		} else {
			console.error("Can not find a file upload component.");
		}

		var option = {
			 id : "sbm_retrievePlocy",
			 action : gcm.CONTEXT_PATH + "/cmm/fileMgmt/v1/retrievePolicy/" + policy,
			 method : "get",
			 isShowMeg : true,
			 submitDoneHandler : function(res) {
				if (typeof fileUploadWindow.scwin.callbackFileUploadSetting === "function") {
					fileUploadWindow.scwin.callbackFileUploadSetting(res.responseJSON.policy);
				}
			 }
		};
		com.sbm.executeDynamic(option);
	} catch (ex) {
		console.error(ex);
	}
};

/**
 * File Upload를 시작한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object} fileViewFrame File View WFrame 객체
 * @author 박상규
 * @example
com.util.startFileUpload(wfm_fileUpload);
 */
com.util.startFileUpload = function(fileUploadFrame) {
	try {
		var fileUploadWindow = fileUploadFrame.getWindow();

		if (com.util.isEmpty(fileUploadWindow.mpd_multiFileUpload) === false) {
			if (fileUploadWindow.mpd_multiFileUpload.getFileInfos().length > 0) {
				fileUploadWindow.scwin.setUploadParam();
				fileUploadWindow.mpd_multiFileUpload.startUpload();
			} else {
				fileUploadWindow.scwin.mpd_multiFileUpload_ondone([], true);
			}
		} else if (com.util.isEmpty(fileUploadWindow.upd_singleFileUpload) === false) {
			if (fileUploadWindow.upd_singleFileUpload.isEmpty() === false) {
				fileUploadWindow.scwin.setUploadParam();
				fileUploadWindow.upd_singleFileUpload.submit();
				WebSquare.layer.showProcessMessage(" ");
			} else {
				fileUploadWindow.scwin.callBackUploadDoneFunc([], true);
			}
		} else {
			console.error("Can not find a file upload component.");
		}
	} catch (ex) {
		console.error(ex);
	}
}


/**
 * 업데이트된 파일 정보를 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @param {Object} fileViewFrame File DataList 객체
 * @author 박상규
 * @example
com.util.getUpdatedFile(dlt_file);
 */
com.util.getUpdatedFile = function(fileDataObj) {
	try {
		var updatedFileData = fileDataObj.getAllJSON();
		return updatedFileData;
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 입력 가능한 컴포넌트(input, textarea 등) 객체의 내용을 클립보드에 저장한다. <br>
 *
 * 제한사항으로는 IE 10+, Chrome 43+, Opera 29+, Firefox에서만 사용 가능하며, IE의 경우 클립복드 복사 허용을 묻는 확인 창이 뜬다. <br>
 *
 * @param {Object} 컴포넌트 객체
 * @memberOf com.util
 * @date 2019.11.16
 * @author 박상규
 * @example
// ibx_message InputBox내 Text가 Select 되면서 Clipboard에 복사된다.
com.util.copyClipboard(ibx_message);
 */
com.util.copyClipboard = function(comObj) {
	if (typeof comObj !== "undefined") {
		comObj.select();
	}
	document.execCommand("Copy");
};

/**
 * 주어진 문자열을 Base64 디코딩 처리 후 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @author 김응한
 * @param {String} base64 디코딩할 스트링
 * @example
com.util.decodeBase64("aGVsbG8gd29ybGQ=")
*/
com.util.decodeBase64 = function(base64){
	try {
		return gcm.base64.decode(base64);
	} catch(ex) {
		console.error(ex);
	}
}

/**
 * 주어진 문자열을 Base64 인코딩 처리 후 반환한다.
 *
 * @memberOf com.util
 * @date 2019.11.16
 * @author 김응한
 * @param {String} base64 인코딩할 스트링
 * @example
com.util.encodeBase64("hello world")
*/
com.util.encodeBase64 = function(base64){
	try {
		return gcm.base64.encode(base64);
	} catch (ex) {
		console.error(ex);
	}
}

// =============================================================================
/**
 * 업무 화면 영역 제어(권한, 업무 화면 공통 UI 요소 및 버튼 제어, 개인화 등)와 관련된 함수를 제공한다.
 *
 * @author 박상규
 * @class win
 * @namespace com.win
 */
 // =============================================================================

com.win = {}

/**
 * 사용자의 권한에 따른 화면 컴포넌트 제어를 한다.
 *
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 */
com.win._setProgramAuthority = function() {
	var programId = com.win.getProgramId();
	if ((com.util.isEmpty(programId) === false) && (programId.indexOf("CMXM") === -1)) {
		var option = {
			 id : "sbm_programAuthority",
			 action : gcm.CONTEXT_PATH + "/auth/authCache/v1/retrieveCacheButton/" +programId,
			 method : "get",
			 isShowMeg : true,
			 submitDoneHandler : function(res) {
			 	var responseJSON = res.responseJSON;
			 	if (!com.util.isEmpty(responseJSON) && !com.util.isEmpty( responseJSON.SERVER_RESULT)) {
			 		var programAuthority = responseJSON.SERVER_RESULT.button;
			 		if (!com.util.isEmpty(programAuthority) && typeof programAuthority ==="string") {
			 			var authBtnArr = programAuthority.split(",");
			 			var authBtnLen = authBtnArr.length;
			 			if (authBtnLen > 0 ) {
			 				for (var i = 0; i < authBtnLen; i++) {
			 					var btnId = authBtnArr[i];
			 					var comObj = com.util.getComponent(btnId);
			 					if (com.util.isEmpty(comObj) === false) {
			 						comObj.hide();
			 					}
			 				}
			 			}
			 		}
			 	}
			 }
		};
		com.sbm.create(option);
	}
};


/**
 * 공통 코드, 권한, 개인화 처리를 위한 Workflow를 실행한다.
 *
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 */
com.win._processCommonData = function() {

	var commonDataWorkflow = {
		"id" : "wkf_commonDataWorkflow",
		"processMsg" : "처리중",
		"step" : [],
		"resolveCallback" : "scwin.onloadcompleted",
		"rejectCallback" : ""
	};

	var sbmCommonCode = com.util.getComponent("sbm_commonCode");

	// 권한, 공통 코드 로딩 Submission 추가
	if (com.util.isEmpty(sbmCommonCode) === false) {
		var sbm_programAuthority = com.util.getComponent("sbm_programAuthority");
		if (com.util.isEmpty(sbm_programAuthority) === false) {
			commonDataWorkflow.step = [
				 { "type" : "submit", "action" : "sbm_programAuthority" },
				 { "type" : "submit", "action" : "sbm_commonCode" },
				 { "type" : "submitDone", "action" : "sbm_programAuthority" },
				 { "type" : "submitDone", "action" : "sbm_commonCode" }

			];
		} else {
			commonDataWorkflow.step = [
				 { "type" : "submit", "action" : "sbm_commonCode" },
				 { "type" : "submitDone", "action" : "sbm_commonCode" }
			];
		}
	} else {
		var sbm_programAuthority = com.util.getComponent("sbm_programAuthority");
		if (com.util.isEmpty(sbm_programAuthority) === false) {
			commonDataWorkflow.step = [
				 { "type" : "submit", "action" : "sbm_programAuthority" },
				 { "type" : "submitDone", "action" : "sbm_programAuthority" }
			];
		}
	}

	var sbm_personalizatonSearch = com.util.getComponent("sbm_personalizatonSearch");

	// 그리드 개인화 로딩 Submssion 추가 (권한 및 공통 코드 로딩 완료 후 실행됨)
	if (com.util.isEmpty(sbm_personalizatonSearch) === false) {
		commonDataWorkflow.step.push({ "type" : "submit", "action" : "sbm_personalizatonSearch" });
		commonDataWorkflow.step.push({ "type" : "submitDone", "action" : "sbm_personalizatonSearch" });
	}

	var sbm_personalizatonGrd = com.util.getComponent("sbm_personalizatonGrd");

	// 조회 개인화 로딩 Submssion 추가 (권한 및 공통 코드 로딩 완료 후 실행됨)
	if (com.util.isEmpty(sbm_personalizatonGrd) === false) {
		commonDataWorkflow.step.push({ "type" : "submit", "action" : "sbm_personalizatonGrd" });
		commonDataWorkflow.step.push({ "type" : "submitDone", "action" : "sbm_personalizatonGrd" });
	}


	if (commonDataWorkflow.step.length > 0) {
		com.sbm.executeWorkflow(commonDataWorkflow);
	} else {
		com.util.setTimeout(
			function() {
				var func = WebSquare.util.getGlobalFunction($p.getFrameId() + "_scwin.onloadcompleted");
				if (typeof func === "function") {
					func();
				}
			},
			{ delay : 1, key : "onloadcompleted" }
		);
	}
};


/**
 * Window.onBeforeUnload 이벤트를 추가한다.
 *
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 * @example
com.win.addEventOnBeforeUnload();
 */
com.win.addEventOnBeforeUnload = function() {
	gcm._addEventOnBeforeUnload();
};

/**
 * contextRoot가 포함된 path를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} path 파일경로(Context가 포함되지 않은)
 * @return {String} Context가 포함된 파일경로
 * @example
// context가 /sample 인경우
com.win.getFullPath("/web/dev/common/commonCode1.xml");
 */
com.win.getFullPath = function(path) {
	var rtn_path = "";
	if (gcm.CONTEXT_PATH == "") {
		rtn_path = path;
	} else {
		rtn_path = gcm.CONTEXT_PATH + path;
	}
	return rtn_path;
};


/**
 * 해당 그룹 안의 컴포넌트에서 Enter Key 이벤트가 발생하면, 해당 컴포넌트의 값을 DataColletion에 저장하고 특정 함수를 실행한다.
 *
 * @param {Object} grpObj 그룹 객체
 * @param {Object} objFunc 함수 객체
 * @param {Number} rowIndex DataList가 바인딩된 gridView인 경우 ==> 현재 포커스된 focusedRowIndex [ex. gridViewId.getFocusedRowIndex()]
 *				 <br/>아닌 경우 ==> rowIndex는 생략
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 * @example
com.win.setEnterKeyEvent(grp_AuthorityDetail, scwin.search);
// return 예시) "엔터키가 발생 -> 해당 함수 실행 및 DataColletion에 UI 컴포넌트에 입력된 데이터를 DataCollection에 저장"
 */
com.win.setEnterKeyEvent = function(grpObj, objFunc) {
	var objArr = com.util.getChildren(grpObj, {
		includePlugin: "checkbox checkcombobox editor input inputCalendar multiselect radio selectbox searchbox secret textarea",
		recursive: true
	});

	try {
		for (var i = 0; i < objArr.length; i++) {
			try {
				if (typeof objFunc === "function") {
					objArr[i].bind("onkeyup", function (e) {
						if (e.keyCode === 13) {
							if (typeof this.getRef === "function") {
								var ref = this.getRef();
								var refArray = ref.substring(5).split(".");
								if ((typeof refArray !== "undefined") && (refArray.length === 2)) {
									var dataCollectionName = refArray[0];
									var columnId = refArray[1];
									var dataCollection = this.getScopeWindow().$p.getComponentById(dataCollectionName);
									var dataType = dataCollection.getObjectType().toLowerCase();
									if (dataType === "datamap") {
										dataCollection.set(columnId, this.getValue());
									} else if ((dataType === 'datalist') && (typeof rowIndex !== "undefined")) {
										dataCollection.setCellData(dataCollection.getRowPosition(), columnId, this.getValue());
									}
								}
								objFunc();
							}
						}
					});
				}
			} catch (e) {
				console.error("[com.win.setEnterKeyEvent] Exception :: " + e.message);
			} finally {
				dataCollection = null;
			}
		}
	} catch (e) {
		console.error("[com.win.setEnterKeyEvent] Exception :: " + e.message);
	} finally {
		objArr = null;
	}
};


/**
 * Layer Alert 메시지 창을 호출한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} messageStr 메시지
 * @param {String} closeCallbackFncName 콜백 함수명
 * @author 박상규
 * @update 김응한 옵션 파라미터 추가
 * @example
com.win.alert("우편번호를 선택하시기 바랍니다.");
com.win.alert("우편번호를 선택하시기 바랍니다.", "scwin.alertCallBack");

// 공통메시지 아이디를 전달하면 메시지로 변경하여 보여줌
com.win.alert("com.cfm.0002") // 저장하시겠습니까?

// 공통메시지에 치환값이 있는 경우는 Array로 전달
com.win.alert(["bbs.cfm.0001",  "MA0101", "MA010101"]) //"카테고리 [MA0101]를 삭제하시겠습니까?\n삭제 시, [MA0101]로 등록한 게시글을 조회할 수 없습니다."

// 존재하지 않는 공통메시지 아이디인경우 String 인경우
com.win.alert("com.cfm.002") // "com.cfm.002"

// 존재하지 않는 공통메시지 아이디인경우 Array 인경우
com.win.alert(["bbs.cfm.0001",  "MA0101", "MA010101"]) //메시지 없음
 */
com.win.alert = function(messageStr, closeCallbackFncName, opts) {
	if(typeof opts !=="object") {
		opts ={};
	}
	com.win._messagBox("alert", messageStr, closeCallbackFncName, opts);
};


/**
 * Layer Confirm 메시지 창을 호출한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} messageStr 메시지
 * @param {String} closeCallbackFncName 콜백 함수명
 * @author 김응한
 * @update 김응한 옵션 파라미터 추가
 * @example
com.win.confirm("변경된 코드 그룹 정보를 저장하시겠습니까?", "scwin.saveCodeGrpConfirmCallback");
com.win.confirm("하위에 새로운 조직을 추가하시겠습니까?", "scwin.insertConfirmCallBack");
 */
com.win.confirm = function(messageStr, closeCallbackFncName, opts) {
	if(typeof opts !=="object") {
		opts ={};
	}
	com.win._messagBox("confirm", messageStr, closeCallbackFncName, opts);
};


/**
 * 메세지 팝업을 호출한다.
 *
 * @private
 * @param {String} messageType 팝업창 타입 (alert || confirm)
 * @param {String} messageStr 메시지
 * @param {String} closeCallbackFncName 콜백 함수명
 * @param {String} title 팝업창 타이틀
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 * @update 김응한 callBackParam , 높이 ,너비 ,url ,className추가
 * @example
//alert창을 띄울 경우
scwin.callback = function(){
	console.log("콜백 함수입니다.");
};
com.win._messagBox("alert", "보낼 메시지", "callback");

//confirm창을 띄울 경우
scwin.callback = function(){
	console.log("콜백 함수입니다.");
};
com.win._messagBox("confirm", "보낼 메시지", "callback");
 */
com.win._messagBox = function(messageType, messageStr, closeCallbackFncName, opts) {
	var messageStr = messageStr || "";
	var messageType = messageType || "alert";
	var popId = messageType || "Tmp";

	popId = popId + (Math.random() * 16).toString().replace(".","");
	//closeCallBackFnc 정보관리
	if (typeof closeCallbackFncName == "function") {
		var cbFuncIdx = ++gcm.CB_FUNCTION_MANAGER["cbFuncIdx"];
		var idx = "__close_callback_Func__" + new Date().getTime() + "_" + cbFuncIdx;
		gcm.CB_FUNCTION_MANAGER["cbFuncSave"][$p.id + idx] = closeCallbackFncName;
		closeCallbackFncName = idx;
	}

	if(typeof opts.callBackParam !=="object"){
		opts.callBackParam = {};
	}

	if (com.util.isArray(messageStr)) {
		var sysMsg = com.data.getMessage(messageStr);
		if (typeof sysMsg === "string" &&  sysMsg !="") {
			messageStr = sysMsg;
		} else {
			messageStr = "";
		}
	} else {
		var sysMsg = com.data.getMessage(messageStr);
		if (typeof sysMsg === "string" &&  sysMsg !="") {
			messageStr = sysMsg;
		}
	}

	var data = {
		"message": messageStr,
		"callbackFn": closeCallbackFncName,
		"messageType": messageType,
		"id": popId,
		"callBackParam" : opts.callBackParam
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

	com.win.openPopup("/common/xml/messageBox.xml", options, data);
};

/**
 * 언어 코드를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @return {String} 언어코드 (ex. "ko", "en")
 * @author 박상규
 * @example
var lang = com.win.getLanguage();
 */
com.win.getLanguage = function() {
	var language = navigator.language || navigator.userLanguage;
	if ((com.util.isEmpty(language) === false) && (language.length > 1)) {
		return language.substring(0,2);
	} else {
		return "";
	}
}

/**
 *
 * 팝업아이디구하기
 * 초기 설정 된 데이터 란 setJSON, setXML 등과 같은 API들을 통해 설정 된 데이터가 이에 속한다.
 * 추가(C)된 행은 제거한다
 *
 * @param {String} dltId  데이터리스트의 아이디
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @example
com.win.getPopupId();
 */
com.win.getPopupId = function() {
	var parent = opener || parent

	if($p.getPopupId()){
		return $p.getPopupId()
	}else{
		return window.scwin.$w.getPopupId()
	}

};


/**
 *
 * 팝업창을 연다.
 *
 * @param {String} url url 화면경로
 * @param {Array} options Popup창 옵션
 * @param {String} [options.id] Popup창 아이디
 * @param {String} [options.type] 화면 오픈 타입 ("iframePopup", "wframePopup", "browserPopup")
 * @param {String} [options.width] Popup창 넓이
 * @param {String} [options.height] Popup창 높이
 * @param {String} [options.popupName] useIframe : true시 popup 객체의 이름으로 popup 프레임의 표시줄에 나타납니다.
 * @param {String} [options.useIFrame] [default : false] true : IFrame 을 사용하는 WebSquare popup / false: window.open 을 사용하는 popup
 * @param {String} [options.style] Popup의 스타일을 지정합니다. 값이 있으면 left top width height는 적용되지 않습니다.
 * @param {String} [options.resizable] [default : false]
 * @param {String} [options.modal] [default : false]
 * @param {String} [options.scrollbars] [default : false]
 * @param {String} [options.title] [default : false]
 * @param {String} [options.notMinSize] [default : false]
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @example
var data = { data : dma_authority.getJSON(), callbackFn : "scwin.insertMember" };
var options = { id : "AuthorityMemberPop",
				popupName : "직원 조회",
				modal : true,
				width : 560, height: 400 };
com.win.openPopup("/ui/BM/BM002P01.xml", options, data);
 */
com.win.openPopup = function(url, opt, data) {
	var programId = null;
	if (com.util.isEmpty(url) === false ) {
		if (url.indexOf("/service/p/") > -1 || url.indexOf("/service/m/") > -1) {
			var srcPathArr = url.split("/");
			var srcPathArrLen = srcPathArr.length;
			if( srcPathArrLen > 0 ) {
				var pgmId  = srcPathArr[srcPathArrLen-1];
				if (pgmId.indexOf("?") >-1) {
					pgmId = pgmId.split("?")[0];
				}

				if (pgmId.indexOf("&") >-1) {
					pgmId = pgmId.split("&")[0];
				}

			}
		}
	}
    if (typeof data === "undefined") {
    	data = {};
    }
    //메뉴리스트가 없는 경우 pgmid를 서버에서 가져옴
    if( com.util.isEmpty($p.top().dlt_menu) && url.indexOf("/service/m/") > -1){
    	var menuId = pgmId;
    	var option = {
    			id : "sbm_retrievePgmIdbyMenuId",
    			// TODO :: 메뉴 서비스가 완성되면 실제 서비스를 호출하도록 수정해야 함
    			//action : "menu",
    			action : gcm.CONTEXT_PATH + "/menu/menuMgmt/v1/retrievePgmIdbyMenuId/"+pgmId,
    			method : "get",
    			isShowMeg : true,
    			submitDoneHandler : function(res) {
    				var menuInfo = null;
	    				if(!com.util.isEmpty(res.responseJSON) && !com.util.isEmpty(res.responseJSON.SERVER_RESULT)){
	    				var result = res.responseJSON.SERVER_RESULT;
	    				var pgmId = result["pgmId"];

	    			    if (typeof data === "undefined") {
	    			    	data = {};
	    			    }

	    			    if (typeof data["_menuInfo"] === "undefined") {
	    			    	data["_menuInfo"] = {};
	    			    }
	    			    data["_menuInfo"]["menuId"] = menuId;
	    		    	data["_menuInfo"]["programId"] = pgmId;
	    		    	data["_menuInfo"]["srcPath"] = url;
	    		    	com.win._openPopup(url, opt, data);
    				}
    		}
    	}
    	com.sbm.executeDynamic(option);
    	return;
    }else if (url.indexOf("/service/p/") > -1) {
    	data["_menuInfo"] = {};
    	if (opt.type != "wframePopup") {
    		data["_menuInfo"]["menuNm"] = opt.popupName || "";
    	}
    	data["_menuInfo"]["programId"] = pgmId;
    	data["_menuInfo"]["srcPath"] = url;
    } else if ( ! com.util.isEmpty($p.top().dlt_menu) && url.indexOf("/service/m/") > -1) {
    	var menuInfoArr = $p.top().dlt_menu.getMatchedJSON("menuId", pgmId);
    	var menuInfo = null;
    	if (menuInfoArr.length > 0) {
    		menuInfo = menuInfoArr[0];
    		data["_menuInfo"] = menuInfo;
    	}
    }

	com.win._openPopup(url, opt, data);
};


com.win._openPopup = function(url, opt, data) {
	var _dataObj = {
		type : "json",
		data : data,
		name : "param"
	};
	var width = opt.width || 500;
	var height = opt.height || 500;
	try {
		var deviceWidth = parseFloat($("body").css("width"));
		var deviceHeight = parseFloat($("body").css("height"));

		if (!opt.notMinSize) {
			var borderSize = 4;
			if(opt.type !="browserPopup"){
				borderSize = 4
				if (deviceWidth > 0 && width > deviceWidth) {
					width = deviceWidth - borderSize; // 팝업 border 고려
				}

				if (deviceHeight > 0 && height > deviceHeight) {
					height = deviceHeight - borderSize; // 팝업 border 고려
				}

			}else{
				if (window.screen.availHeight <= height) {
					height = window.screen.availHeight-100;
				}
			}
		}
	} catch (e) {

	}

    if(opt.type !="browserPopup"  && opt.type !="wframePopup"){
    	opt.type = "wframePopup";
	}

    if(opt.type =="browserPopup"){
		var left = Math.floor((window.screen.availWidth - width) / 2) + (window.screen.availLeft || 0 ) + "px";
		var top = Math.floor(((window.screen.availHeight- 50 - height))/ 2) +(window.screen.availTop|| 0)+ "px";
	}else{
    	var top = ((document.body.offsetHeight / 2) - (parseInt(height) / 2) + $(document).scrollTop()) + "px";
    	var left = ((document.body.offsetWidth / 2) - (parseInt(width) / 2) + $(document).scrollLeft()) + "px";
    	opt.modal = true;
    }


	if (typeof _dataObj.data !== "undefined") {
		if (typeof _dataObj.data.callbackFn === "undefined") {
			_dataObj.data.callbackFn = "";
		} else if (_dataObj.data.callbackFn.indexOf("gcm") !== 0) {
			_dataObj.data.callbackFn = $p.id + _dataObj.data.callbackFn;
		}
	}

	var options = {
		id : opt.id,
		popupName : opt.popupName || "",
		type : opt.type || "wframePopup",
		width : width + "px",
		height : height + "px",
		top : opt.top || top || "140px",
		left : opt.left || left || "500px",
		modal : (opt.modal == false) ? false : true,
		dataObject : _dataObj,
		alwaysOnTop : opt.alwaysOnTop || false,
		useModalStack : (opt.useModalStack == false) ? false : true,
		resizable : (opt.resizable == false) ? false : true,
		useMaximize : opt.useMaximize || false,
		className   :opt.className || "",
		scrollbars : true,
		popupUrl : "../popup.html"
	};

	$p.openPopup(gcm.CONTEXT_PATH + url, options);
}


/**
 * 팝업창을 닫는다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} popId popup창 id로 값이 없을 경우 현재창의 아이디(this.popupID) close.
 * @param {String} [callbackStr] callbackFunction명으로 부모 객체는 opener || parent으로 참조한다. opener || parent가 없을 경우 window 참조.
 * @param {String} [returnValue] callbackFunction에 넘겨줄 파라메터로 String타입을 권장한다.
 * @author 김응한
 * @example
com.win.closePopup();
com.win.closePopup("scwin.zipPopupCallback" , '{message:"정상처리되었습니다"}');
com.win.closePopup("scwin.zipPopupCallback" , '정상처리되었습니다.');
 */
com.win.closePopup = function(callbackFnStr, retObj, callbackYn, selectedIdx) {
	if(!com.util.isJSON(retObj)){
		retObj ={};
	}
	com.win._closePopup(com.win.getPopupId(), callbackFnStr, com.str.serialize(retObj), window);
	// IFrame일 경우, 메모리릭을 없애기 위한 코딩. (부모/자식 간 페이지로 객체 파라미터 전달 방식은 비권장. 문자열 전달 권장.)
};

com.win._closePopup = function (popId, callbackFnStr, retStr, winObj) {
	if ((typeof callbackFnStr !== "undefined") && (callbackFnStr !== "")) {
		var func;
		if (callbackFnStr.indexOf("__close_callback_Func__") > -1) {
			func = gcm.CB_FUNCTION_MANAGER["cbFuncSave"][callbackFnStr];
			delete gcm.CB_FUNCTION_MANAGER["cbFuncSave"][callbackFnStr];
		} else {
			func = winObj.WebSquare.util.getGlobalFunction(callbackFnStr);
		}

		if (com.win.isPopup()) {
			if ($p.isWFramePopup()) {
				$p.closePopup(popId);
				if (func) {
					func(com.util.getJSON(retStr));
				}

			}else{
				$p.closePopup();
				var funcArr = callbackFnStr.split(".");
				if (opener[funcArr[0]] && typeof opener[funcArr[0]][funcArr[1]] == "function") {
					opener[funcArr[0]][funcArr[1]]
					func = opener[funcArr[0]][funcArr[1]];
					func(com.util.getJSON(retStr));
				}
			}
		} else {
			$p.closePopup(popId);
			if (func){
				func(com.util.getJSON(retStr));
			}

		}

		/*
		if (func) {
			$p.closePopup(com.win.getPopupId());
			func(com.util.getJSON(retStr));
		} else {
			var parentObj = opener || parent;
			if (winObj.$p.getParameter("w2xPath") !== parentObj.$p.getParameter("w2xPath")) {
				com.win._closePopup(popId, callbackFnStr, retStr, parentObj);
				return;
			}
			$p.closePopup(popId);
		}*/
	} else {
		if (com.win.isPopup()) {
			if ($p.isWFramePopup()) {
				$p.closePopup(popId);
			} else {
				$p.closePopup();
			}
		} else {
			$p.closePopup(popId);
		}
	}
};


/**
 * 현재 오픈된 전체 팝업창을 닫는다.
 *
 * @memberOf com
 * @date 2019.11.16
 * @author 박상규
 * @example
com.win.closeAllPopup();
 */
com.win.closeAllPopup = function() {
	// WebSquare.uiplugin.popup.popupList 속성은 엔진 내 비공개 속성으로 공통에서만 제한적으로 사용함(업무 화면 소스 사용 금지)
	var popupList = WebSquare.uiplugin.popup.popupList;
	for (var idx = 0; idx < popupList.length; idx++) {
		$p.closePopup(WebSquare.uiplugin.popup.popupList[idx].id);
	}
};


/**
 * 화면을 오픈한다.
 *
 * @param {String} menuId 오픈할 메뉴 아이디
 * @param {Object} paramData 전할달 데이터
 * @param {Boolean} options.isHistory 브라우저 History에 기록할 지 여부 (개발자 사용금지)
 * @param {String} options.openAction mdi 탭인 경우 컨텐츠 로딩 옵션 ([select, exist, new, last]컨텐츠 로딩 옵션.(new:새로운 탭, select:기존 탭을 선택, exist:tabID에 해당하는 탭에 src를 바꿔 로딩하고 해당 탭을 선택, last: 기존 tab을 마지막 tab으로 이동후 선택))
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 * @example
com.win.openMenu("SMGRD002");

var paramData = { data : dma_authority.getJSON() };
com.win.openMenu("SMGRD003", paramData);
*/
com.win.openMenu = function(menuId, paramData, options) {

	if (gcm.WORK_LAYOUT_TYPE === "MDI") {
		gcm.win._openMenuMDI(menuId, paramData, options);
	} else if (gcm.WORK_LAYOUT_TYPE === "SDI") {
		gcm.win._openMenuSDI(menuId, paramData, options);
	} else {
		var alertMsg = com.data.getMessage("com.alt.0017" , "MDI/SDI") || "메인 레이아웃(MDI/SDI) 설정이 되지 않았습니다.";
		com.win.alert(alertMsg);
	}
};


/**
 * 현재 프레임을 다른 메뉴의 화면으로 전환한다.
 *
 * @param {String} menuId 오픈할 메뉴 아이디
 * @param {Object} paramData 전달할 데이터
 * @param {Object} openOpt 메뉴 오픈 옵션
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 * @example
com.win.moveMenu("SMGRD002");

var data = { data : dma_authority.getJSON() };
com.win.moveMenu("SMGRD003", data);

var data = { data : dma_authority.getJSON() };
com.win.moveMenu("SMGRD003", data);

var data = { data : dma_authority.getJSON() };
var option = {
	menuInfo : { "menuNm": "U+표준문서 승인자관리", "location": "U<sup>+</sup>표준문서 관리 > U+표준문서 승인자관리" }
};
com.win.moveMenu("SMGRD003", data, option);
*/
com.win.moveMenu = function(menuId, paramData, openOpt) {
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

	if (com.util.isEmpty(menuInfo.srcPath) === false) {

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

		$p.getFrame().setSrc(menuInfo.srcPath, option);

		if ((typeof openOpt.isHistory === "undefined") || (openOpt.isHistory === true)) {
			gcm.win._pushState(option.dataObject.data, menuInfo);
		}

	}
};


/**
 * 현재 프레임을 다른 메뉴의 화면으로 전환한다.
 *
 * @param {String} menuId 오픈할 메뉴 아이디
 * @param {Object} paramData 전달할 데이터
 * @memberOf com.win
 * @date 2019.11.16
 * @author 박상규
 * @example
// 실행 예제 1 (프로그램 등록이 되지 않은 웹스퀘어 XML을 로딩하는 경우)
var param1 = {
	src : "/web/dev/window/samplePopup1.xml",
};
com.win.setWframe(wfm_content1, param1);

// 실행 예제 2 (프로그램 등록이 된 웹스퀘어 XML을 로딩하는 경우)
var param2 = {
	programId : "PGSMWIN007";
	src : "/web/dev/window/windowDropDownMenu.xml",
};
com.win.setWframe(wfm_content1, param2);

// 실행 예제 3 (웹스퀘어 XML에 데이터를 전달해서 로딩하는 경우)
var param3 = {
	src : "samplePopup1.xml",
	data : dma_params.getJSON()
};
com.win.setWframe(wfm_content1, param3);
*/
com.win.setWframe = function(wframeObj, param) {

	if (com.util.isEmpty(param)) {
		console.log("[com.win.setWframe] param 설정이 필요합니다.");
		return;
	}

	var menuNm = com.win._getTitleInfo("menuNm");
	var location = com.win._getTitleInfo("location")


	if (com.util.isEmpty(param.programId) === false) {
		com.win.setProgramId(param.programId, wframeObj);
	}

	if (com.util.isEmpty(param.data)) {
		param.data = {};
	}
	if(com.util.isEmpty(param.data.menuNm)){
		param.data.menuNm = menuNm || "";
	}

	if(com.util.isEmpty(param.data.location)) {
		param.data.location = location || "";
	}


	if (com.util.isEmpty(param.src) === false) {
		if (com.util.isEmpty(param.data) === false) {
			var option = {
				dataObject : {
					type : "json",
					name : "param",
					data : param.data
				}
			};

			wframeObj.setSrc(gcm.CONTEXT_PATH + param.src, option);
		} else {
			wframeObj.setSrc(gcm.CONTEXT_PATH + param.src);
		}
	}
};

/**
 * 토스트 팝업을 연다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} Toast 메시지 창에 표시할 메시지
 * @author 김응한
 * @example
com.win.toast("저장이 완료되었습니다");
 */
com.win.toast = function(msg) {
	try {
		var wfm_toastMessage = WebSquare.util.getComponentById( "wfm_toastMessage" );

		if (typeof wfm_toastMessage === "undefined") {
			wfm_toastMessage = WebSquare.util.dynamicCreate("wfm_toastMessage", "wframe", {src : "/common/xml/commonToastMessage.xml"}, WebSquare.getBody());
		}

		var toastScwinObj = wfm_toastMessage.getObj("scwin");
		var sysMsg;
		if (com.util.isArray(msg)) {
			sysMsg = com.data.getMessage(msg);
			if (typeof sysMsg === "string" &&  sysMsg !="") {
				msg = sysMsg;
			}
		}else {
			sysMsg = com.data.getMessage(msg);
			if (typeof sysMsg === "string" &&  sysMsg !="") {
				msg = sysMsg;
			}
		}

		toastScwinObj.showToast(msg);
	} catch (e) {
		console.error(e);
		return false;
	}
};


/**
 * 현재 화면이 팝업 인지의 여부를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @return {Boolean} 팝업인 경우 true, 팝업이 아닌 경우 false
 * @author 박상규
 * @example
if (com.win.isPopup()) {
	com.win.alert("현재 화면은 팝업입니다.");
};
 */
com.win.isPopup = function() {
	return $p.isPopup();
};


/**
 * 공통레이어 밖에 영역을 클릭하면 공통레이어를 모두숨긴다
 *
 * @private
 * @param  {Object} event 마우스 클릭시event 객체 , 클릭한 영역이 공통레이어 안에있는 경우 해당레이어는 숨기지 않는다, event 객체가 없는경우 모두 숨김처리
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @example
com.win._layerHideAll(e);
 */
com.win._layerHideAll = function(event){
	try {
		var topFrame = $p.top();
		var topFrameCom = topFrame.com;
		if (com.util.isEmpty(topFrameCom)) {
			topFrame = WebSquare.util.getMainFrame();
			topFrameCom = topFrame.com;
			if (com.util.isEmpty(topFrameCom)) {
				topFrameCom = com;
			}
		}


		var personalLayer = topFrameCom.util.getComponent("commonPersonalization");
		var dropDownMenu = topFrameCom.util.getComponent("commonDropDownMenu");
		var dropDownPopup = topFrameCom.util.getComponent("commonDropDownPopup");
		var grpMsearch = topFrameCom.util.getComponent("grp_msearch");
		var timePicker    = topFrameCom.util.getComponent("udcTimePicker");
		var dbCalendarPop = topFrameCom.util.getComponent("udcDbCalendarPop");
		var acbSearch = topFrameCom.util.getComponent("acb_search");
		var grpMenuOpenLayer = topFrameCom.util.getComponent("grp_menuOpenLayer");
		var grpMenulist = topFrameCom.util.getComponent("grp_menulist");
		var grpPushOpenLayer = topFrameCom.util.getComponent("grp_pushOpenLayer");

		if(!com.util.isEmpty(timePicker)){
			var grpTimePop = timePicker.getObj("grp_udcTimePop");
			if(!com.util.isEmpty(event) && $(grpTimePop.render).has(event.target).length == 0){
				grpTimePop.hide();
			}else if(com.util.isEmpty(event)){
				grpTimePop.hide();
			}
		}
		if(!com.util.isEmpty(dbCalendarPop)){
			var grpDbCalPop = dbCalendarPop.getObj("grp_udcDbCalPop");
			if(!com.util.isEmpty(event) && $(grpDbCalPop.render).has(event.target).length == 0){
				grpDbCalPop.hide();
			}else if(com.util.isEmpty(event)){
				grpDbCalPop.hide();
			}
		}
		if(!com.util.isEmpty(personalLayer)){

			var grpPzPop = personalLayer.getObj("grp_pzPop");
			if(!com.util.isEmpty(event) && $(grpPzPop.render).has(event.target).length == 0){
				grpPzPop.hide();
			}else if(com.util.isEmpty(event)){
				grpPzPop.hide();
			}
		}
		if(!com.util.isEmpty(dropDownPopup)){
			var grpOpenLayer = dropDownPopup.getObj("grp_openLayer");
			if(!com.util.isEmpty(event) && $(grpOpenLayer.render).has(event.target).length == 0){
				grpOpenLayer.hide();
			}else if(com.util.isEmpty(event)){
				grpOpenLayer.hide();
			}
		}
		if(!com.util.isEmpty(dropDownMenu)){
			var grpOpenLayer = dropDownMenu.getObj("grp_openLayer");
			if(!com.util.isEmpty(event) && $(grpOpenLayer.render).has(event.target).length == 0){
				grpOpenLayer.hide();
			}else if(com.util.isEmpty(event)){
				grpOpenLayer.hide();
			}
		}

		if(!com.util.isEmpty(grpMsearch)){
			if(!com.util.isEmpty(event) && $(grpMsearch.render).has(event.target).length == 0){
				if(grpMsearch.hasClass("on")){
					grpMsearch.removeClass("on");
					if(!com.util.isEmpty(acbSearch)){
						//acbSearch.setValue("");
					}
				}
			}else if(com.util.isEmpty(event)){
				if(grpMsearch.hasClass("on")){
					grpMsearch.removeClass("on");
					if(!com.util.isEmpty(acbSearch)){
						//acbSearch.setValue("");
					}
				}
			}
		}

		if(!com.util.isEmpty(grpMenuOpenLayer)){
			if(!com.util.isEmpty(event) && $(grpMenuOpenLayer.render).has(event.target).length == 0){
				grpMenuOpenLayer.hide();
				grpMenulist.removeClass("on");
			}else if(com.util.isEmpty(event)){
				grpMenuOpenLayer.hide();
				grpMenulist.removeClass("on");
			}
		}

		if(!com.util.isEmpty(grpPushOpenLayer)){
			if(!com.util.isEmpty(event) && $(grpPushOpenLayer.render).has(event.target).length == 0){
				grpPushOpenLayer.hide();
				if( !com.util.isEmpty(topFrame) &&  !com.util.isEmpty(topFrame.btn_push)) {
					topFrame.btn_push.removeClass("on")
				}
			}else if(com.util.isEmpty(event)){
				grpPushOpenLayer.hide();
				if( !com.util.isEmpty(topFrame) &&  !com.util.isEmpty(topFrame.btn_push)) {
					topFrame.btn_push.removeClass("on")
				}
			}
		}

	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 조회개인화 및 그리드 개인화를 위한 서브미션 및 데이터리스트를 생성한다.
 *
 * @memberOf com.win
 * @date 2019.12.05
 * @author 김응한
 * @example
com.win.loadUserSetInfo()
 */
com.win.loadUserSetInfo = function(options){
	try {
		com.win._loadUserSetInfo();
	}catch (e) {

	}
}


/**
 * 조회개인화 및 그리드 개인화를 위한 서브미션 및 데이터리스트를 생성한다.
 *
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @example
com.win._loadUserSetInfo()
 */
com.win._loadUserSetInfo = function(){
	try {


		var loginInfo =com.win.getUserLoginInfo();
		var intgUserId = loginInfo.intgUserId;
		var seachKey  = "";
		var userkey = "";

		var programId = com.win.getProgramId();
		var menuProgramId = com.win._getMenuTopFrame().getWindow().com.win.getProgramId();

		if (menuProgramId != programId) {
			programId = menuProgramId + "_" + programId;
		}

		if(com.util.isEmpty(programId) === false && (programId.indexOf("CMXM") === -1)){

			if(!com.util.isEmpty($p.top) && typeof $p.top === "function"){
				var topFrame = $p.top();
				if (com.util.isEmpty(topFrame.com)) {
					topFrame = WebSquare.util.getMainFrame();
				}
				var personalLayer = topFrame.com.util.getComponent("commonPersonalization");
				if(com.util.isEmpty(personalLayer)){
					var wfmObj = topFrame.com.util.createComponent("commonPersonalization", "wframe", {
						src : gcm.CONTEXT_PATH + "/common/xml/commonPersonalization.xml"
					},WebSquare.getBody());
				}
			}else{
				var wfm_commonPersonalization = com.util.getComponent( "commonPersonalization" );
				var wfmObj = com.util.createComponent("commonPersonalization", "wframe", {
					src : gcm.CONTEXT_PATH + "/common/xml/commonPersonalization.xml"
				},WebSquare.getBody());
			}

			var dltSearchComp = com.util.getComponent("dlt_commSearchUserInfo");
			if(com.util.isEmpty(dltSearchComp)){
				var dcoptions = {
						baseNode : "list",
						repeatNode : "map",
						saveRemovedData : "true"
				};
				com.data.createDataList("dlt_commSearchUserInfo", ["intgUserId","pgmId" ,"inqCondId" ,"inqCondKdCd","inqCondNm","inqCondCntn","dataInpsId","dataInptPgmId","dataMfpnId","dataUpdPgmId"],["text", "text","text","text","text","text", "text","text","text","text"] , dcoptions)
			}


			var dltGrdComp = com.util.getComponent("dlt_commGrdUserInfo");
			if(com.util.isEmpty(dltGrdComp)){
				var dcoptions = {
						baseNode : "list",
						repeatNode : "map",
						saveRemovedData : "true"
				};
				com.data.createDataList("dlt_commGrdUserInfo", ["sgridId","sgridAttrDivsCd","sgridAttrCntn"], ["text", "text", "text"] , dcoptions);
			}

			if(!com.util.isEmpty(intgUserId)) {
				//그리드 개인화 서브미션
				var option = {
						id : "sbm_personalizatonGrd",
						action : gcm.CONTEXT_PATH + "/cmm/usbySgridD/v1/retrieveUsbySgridDList/"+intgUserId+"/"+ programId +"/null",
						method : "get",
						submitDoneHandler : function(res) {
							if(!com.util.isEmpty("dlt_commGrdUserInfo")){
								dlt_commGrdUserInfo.setJSON(res.responseJSON.SERVER_RESULT);
							}
						}
				};
				com.sbm.create(option);
				//조회 개인화 서브미션
				var option = {
						id : "sbm_personalizatonSearch",
						action : gcm.CONTEXT_PATH + "/cmm/usbyInqCondD/v1/retrieveUsbyInqCondDList/"+intgUserId+"/"+ programId,
						method : "get",
						submitDoneHandler : function(res) {
							if(!com.util.isEmpty("dlt_commSearchUserInfo")){
								dlt_commSearchUserInfo.setJSON(res.responseJSON.SERVER_RESULT);
							}
						}
				};
				com.sbm.create(option);
			}

		}
	} catch (e) {
		console.error(ex);
	}
};

/**
 * 현재 화면의 프로그램 아이디를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @return {String} 프로그램 아이디
 * @author 박상규
 * @example
var programId = com.win.getProgramId();
 */
com.win.getProgramId = function() {
	if ((com.util.isEmpty(scwin.meta) === false) && (com.util.isEmpty(scwin.meta.programId) === false)) {
		return scwin.meta.programId;
	} else if (com.util.isEmpty($p.getMetaValue("meta_programId")) === false) {
		return $p.getMetaValue("meta_programId");
	} else {
		return "";
	}
};



/**
 * 현재 화면의 프로그램 아이디를 세팅한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} 프로그램 아이디
 * @author 박상규
 * @example
com.win.setProgramId(programId, wframeObj);
 */
com.win.setProgramId = function(programId, wframeObj) {

	// 2019.12.02 - wframe 의 메타에 프로그램ID 설정, 서현호
	var wfwin = scwin;
	if(!com.util.isEmpty(wframeObj)) {
		var wfwin = wframeObj.getWindow().scwin;
	}

	if ((com.util.isEmpty(wfwin.meta) === true)) {
		wfwin.meta = {};
	}
	wfwin.meta.programId = programId;
};


/**
 * 현재 화면의 메뉴 아이디를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @return {String} 메뉴 아이디
 * @author 박상규
 * @example
var menuId = com.win.getMenuId();
 */
com.win.getMenuId = function() {
	if ((com.util.isEmpty(scwin.meta) === false) && (com.util.isEmpty(scwin.meta.menuId) === false)) {
		return scwin.meta.menuId;
	} else {
		return null;
	}
};

/**
 * 현재 화면의 메뉴 아이디를 세팅한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {String} 메뉴 아이디
 * @author 박상규
 * @example
com.win.setMenuId(menuId);
 */
com.win.setMenuId = function(menuId) {
	if ((com.util.isEmpty(scwin.meta) === true)) {
		scwin.meta = {};
	}
	scwin.meta.menuId = menuId;
};


/**
 * 현재 화면의 메뉴 명를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @return {String} 메뉴 명
 * @author 박상규
 * @example
var menuNm = com.win.getMenuName();
 */
com.win.getMenuName = function() {
	if ((com.util.isEmpty(scwin.meta) === false) && (com.util.isEmpty(scwin.meta.menuNm) === false)) {
		return scwin.meta.menuNm;
	} else {
		return null;
	}
};

/**
 * 현재 화면의 메뉴 위치를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @return {String} 메뉴 위치
 * @author 박상규
 * @example
var location = com.win.getLocation();
 */
com.win.getLocation = function() {
	if ((com.util.isEmpty(scwin.meta) === false) && (com.util.isEmpty(scwin.meta.location) === false)) {
		return scwin.meta.location;
	} else {
		return null;
	}
};

/**
 * 버튼을 클릭하면 drop menu가 나타나도록 이벤트를 부여한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} btnObj drop menu를 호출하는 컴포넌트의 아이디 btnObj가 gridView 경우에는 온셀클릭시 동작한다.
 * @param {Object} menuInfo 목록 메뉴 정보
 * @param {String} menuInfo.label [Default : ""] 메뉴 목록 label
 * @param {String} menuInfo.func [Default : ""] 메뉴 클릭시 호출되는 함수명
 * @param {Object} options 기타옵션
 * @param {String} options.colId [Default : ""] // btnObj가 gridView 인 경우 동작할 컬럼아이디 ex) "btnDropDown,empId",  해당옵션을 적용하지 않는경우 모든컬럼에 적용
 * @author 김응한
 * @example
scwin.onpageload = function() {
	var menuInfo = [
			{ "label" : "하단버튼 일번메뉴입니다" ,"func": "scwin.callBack1"},
			{ "label" : "하단버튼 이번메뉴입니다" ,"func": "scwin.callBack2"},
			{ "label" : "하단버튼 삼번메뉴입니다" ,"func": "scwin.callBack3"},
			{ "label" : "하단버튼 시번메뉴입니다" ,"func": "scwin.callBack4"},
		];
		com.win.openDropDownMenu(btn_dropDown2,menuInfo);  //버튼 위치가 기준

		var menuInfo = [
			{ "label" : "그리드뷰 버튼 일번메뉴입니다" ,"func": "scwin.callBack1"},
			{ "label" : "그리드뷰 버튼 이번메뉴입니다" ,"func": "scwin.callBack2"},
			{ "label" : "그리드뷰 버튼 삼번메뉴입니다" ,"func": "scwin.callBack3"},
			{ "label" : "그리드뷰 버튼 시번메뉴입니다" ,"func": "scwin.callBack4"},
		];
		var options = {
			colId : "btnDropDown1,btnDropDown2" // dropDownMenu 적용 컬럼명지정 , 다건 컬럼명은 "btnDropDown,empId"으로 적용 없으면 모든컬럼에 적용
		}
		com.win.openDropDownMenu(grd_indexPage,menuInfo,options);  //포커스한 셀 위치가 기준

}
 */
com.win.openDropDownMenu = function(btnObj, menuInfo, opts) {
	try {
		if (!com.util.isEmpty($p.top) && typeof $p.top === "function") {
			var topFrame = $p.top();
			if (com.util.isEmpty(topFrame.com)) {
				topFrame = WebSquare.util.getMainFrame();
			}
			var dropDownMenu = topFrame.com.util.getComponent("commonDropDownMenu");
			if (com.util.isEmpty(dropDownMenu)) {
				var wfmObj = topFrame.com.util.createComponent("commonDropDownMenu", "wframe", {
					src : gcm.CONTEXT_PATH + "/common/xml/commonDropDownMenu.xml"
				}, WebSquare.getBody());
			}
		} else {
			var dropDownMenu = com.util.getComponent("commonDropDownMenu");
			var wfmObj = com.util.createComponent("commonDropDownMenu", "wframe", {
				src : gcm.CONTEXT_PATH + "/common/xml/commonDropDownMenu.xml"
			}, WebSquare.getBody());
		}
		if (com.util.isEmpty(opts)) {
			opts = {};
		}
		var colIds = opts.colId || "";
		if (btnObj.getPluginName() == "gridView") {
			btnObj.unbind("oncellclick");
			btnObj.bind("oncellclick", function(rowIdx, colIdx) {
				var options = {
					"rowIdx" : rowIdx, "colIdx" : colIdx,
				}
				if (!com.util.isEmpty(colIds)) {
					var colIdArr = colIds.split(",");
					var focusColId = this.getColumnID(colIdx);
					if (colIdArr.indexOf(focusColId) > -1) {
						com.win._openDropDownMenu(this, menuInfo, options);
					}
				} else {
					com.win._openDropDownMenu(this, menuInfo, options);
				}
			});
		} else {
			btnObj.unbind("onclick");
			btnObj.bind("onclick", function() {
				com.win._openDropDownMenu(this, menuInfo);
			});
		}
	} catch (e) {
		console.error(e);
	}
}



/**
 * 버튼을 클릭하면 drop menu가 나타난다 목록에서 버튼을 클릭하면 함수 호출시 지정한 함수를 호출한다.
 *
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 */
com.win._openDropDownMenu = function(btnObj, menuInfo, options) {
	try {
		var frameId = $p.getFrameId();
		if (com.util.isEmpty(options)) {
			options = {};
		}
		try {
			var menuInfoStr = JSON.stringify(menuInfo)
		} catch (e) {
			console.log("잘못된 옵션 형식입니다.")
			return false;
		}
		if (!com.util.isEmpty($p.top) && typeof $p.top === "function") {
			var opt = {
				"frameId" : $p.getFrameId(),
			}
			if (btnObj.getPluginName() == "gridView") {
				if (com.util.isEmpty(options.rowIdx) || com.util.isEmpty(options.colIdx)) {
					console.log("rowIndex 또는 colIndex 정보가 없습니다.");
					return false;
				} else {
					opt.rowIdx = options.rowIdx;
					opt.colIdx = options.colIdx;
				}
			}
			try {
				var optionsStr = JSON.stringify(opt)
			} catch (e) {
				console.log("잘못된 옵션 형식입니다.");
				return false;
			}
			var topFrame = $p.top();
			if (com.util.isEmpty(topFrame.com)) {
				topFrame = WebSquare.util.getMainFrame();
			}
			var commonDropDownMenu = topFrame.com.util.getComponent("commonDropDownMenu");
			if (!com.util.isEmpty(commonDropDownMenu)) {
				event.stopPropagation();
				com.win._layerHideAll();
				commonDropDownMenu.getObj("scwin").openLayerInit(btnObj.id, menuInfoStr, optionsStr);
			}
		}
	} catch (e) {
		console.error(e);
	}
};

/**
 * DropDown팝업 레이어를 생성한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @example
scwin.onpageload = function() {
	com.win.loadDropDownPopup(); //드롭다운 팝업을 사용하기 위한 초기화
};
 */
com.win.loadDropDownPopup = function() {
	try {
		if (!com.util.isEmpty($p.top) && typeof $p.top === "function") {
			var topFrame = $p.top();
			if (com.util.isEmpty(topFrame.com)) {
				topFrame = WebSquare.util.getMainFrame();
			}
			var dropDownPopup = topFrame.com.util.getComponent("commonDropDownPopup");
			if (com.util.isEmpty(dropDownPopup)) {
				var wfmObj = topFrame.com.util.createComponent("commonDropDownPopup", "wframe", {
					src : gcm.CONTEXT_PATH + "/common/xml/commonDropDownPopup.xml"
				}, WebSquare.getBody());
			}
		} else {
			var dropDownPopup = com.util.getComponent("commonDropDownPopup");
			if (com.util.isEmpty(dropDownPopup)) {
				var wfmObj = com.util.createComponent("commonPersonalization", "wframe", {
					src : gcm.CONTEXT_PATH + "/common/xml/commonDropDownPopup.xml"
				}, WebSquare.getBody());
			}
		}
	} catch (e) {
		console.error(e);
	}
};

/**
 * 현재화면의 topFrmae객체를 반환합니다. mdi또는 sdi 인경우 mf를 바로 하위 부모 , wframe인경우 팝업 id+"_wfamae" ,윈도우팝업일 경우 윈도우 팝업의 mf
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @return {Object} topFrame 객체
 * @author 김응한
 * @example
com.win._getTopFrame();
 */
com.win._getMenuTopFrame = function() {
	var cnt = 0; // 무한루프방지
	var frameObj = $p.getFrame();
	var frameObjOrg = frameObj;

	var strictModeFrameId = WebSquare.strictModeFrame.id
	if (frameObj != null && frameObj.id != strictModeFrameId) {
		// wframepopup
		var wfarmePopupEl = $("#" + frameObj.id).closest(".w2popup_window");
		if (wfarmePopupEl.length > 0) {
			var wfarmePopupObj = WebSquare.util.getComponentById(wfarmePopupEl[0].id);
			var wfarmePopupFrm = WebSquare.util.getComponentById(wfarmePopupObj.id + "_" + "wframe");
			if (wfarmePopupFrm && wfarmePopupFrm.getObj("$p") && wfarmePopupFrm.getObj("$p").isWFramePopup()) {
				return wfarmePopupFrm;
			}
		}

		// winpopup
		if (WebSquare.util.isPopup()) {
			var topFrameScope = $p.top();
			return topFrameScope.$p.getFrame();
		}

		// sdi
		var wfarmePopupEl = $("#" + frameObj.id).closest(".wfm_sdi");
		if (wfarmePopupEl.length > 0) {
			var wfarmeFrm = com.util.getComponent(wfarmePopupEl[0].id);
			var wPframeObj = wfarmeFrm.getParentFrame();
			if (wfarmeFrm.getPluginName() == "wframe" && wfarmeFrm.hasClass("wfm_sdi") && !com.util.isEmpty(wPframeObj) && wPframeObj.id == strictModeFrameId) {
				return wfarmeFrm;
			}
		}
		// mdi
		var pframeObj = frameObj.getParentFrame();
		while (cnt < 10) {
			if (typeof pframeObj != "undefined" && pframeObj != null && pframeObj.id != strictModeFrameId) {
				frameObj = pframeObj;
				pframeObj = pframeObj.getParentFrame();
			} else {
				if (frameObj.getParent().getPluginName() == "tabControl" && !com.util.isEmpty(pframeObj) && pframeObj.id == strictModeFrameId) {
					return frameObj;
				} else if (frameObj.getPluginName() == "wframe" && frameObj.hasClass("wfm_sdi") && !com.util.isEmpty(pframeObj)
						&& pframeObj.id == strictModeFrameId) {
					return frameObj;
				} else {
					return pframeObj;
				}
			}
			cnt++;
		}
		return frameObj;
	} else {
		return frameObj;
	}
};

/**
 * 현재화면의 topFrmae객체를 반환합니다. mdi또는 sdi 인경우 mf를 바로 하위 부모 , wframe인경우 팝업 id+"_wfamae" ,윈도우팝업일 경우 윈도우 팝업의 mf
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @return {Object} topFrame 객체
 * @author 김응한
 * @example
com.win._getTitleInfo("tbx_title"); // 공지사항
com.win._getTitleInfo("공지사항 > 공지사항");
 */
com.win._getTitleInfo = function(key) {
		var topMenuFrame = com.win._getMenuTopFrame();
		if (!com.util.isEmpty(topMenuFrame)) {
			var titleEl = $("#" + topMenuFrame.id + " .page_header");
			if (titleEl.length > 0 ) {
				var titleObj = com.util.getComponent(titleEl[0].id);
				if(com.util.isEmpty(key) || key == "menuNm") {
					if (!com.util.isEmpty(titleObj) && titleObj.getObj("tbx_title")) {
						return titleObj.getObj("tbx_title").getValue();
					}
				}else if(key == "location"){
					if (!com.util.isEmpty(titleObj) && titleObj.getObj("tbx_location")) {
						return titleObj.getObj("tbx_location").getValue();
					}
				}

			}
		}
	};


/**
 * 버튼을 클릭하면 dropdown 팝업이 호출된다 com.win.loadDropDownPopup함수가 온로드에서 미리 호출되어 있어야한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} btnObj drop menu를 호출하는 컴포넌트의 아이디 버튼 또는 gridView
 * @param {Object} options 팝업 호출 옵션
 * @param {String} options.url    [Default : ""] 팝업화면 경로
 * @param {String} options.width  [Default : ""] 팝업화면 너비
 * @param {String} options.height [Default : ""] 팝업화면 높이
 * @param {Object} options.rowIdx [Default : ""] btnObj가 그리드뷰인 경우  row의 인덱스
 * @param {String} options.colIdx [Default : ""] btnObj가 그리드뷰인 경우  col의 인덱스
 * @param {Object} data [Default : ""] 팝업으로 전달할 데이터를 key value 형태로 전달한다. 콜백함수의 키인 callbackFn 은 변경금지. 다른 키값은 자유롭게 사용
 * @param {Object} data.callbackFn [Default : ""] 팝업이 닫힐때 호출되는 콜백함수명
 * @author 김응한
 * @example
scwin.btn_userSerchInfo_onclick = function() {
	//전달할 데이터를 key value 형태로 전달한다. 콜백함수의 키인 callbackFn 은 변경금지. 다른 키값은 자유롭게 사용
		var data = {  paramsData1:"샘플파라미터" ,callbackFn : "scwin.CallBack" };
		var options = {
		url   :"/web/dev/window/sampleDropDownPopup.xml",
		width : 400,
		height: 262,
	};
	com.win.openDropDownPopup(btn_userSerchInfo,options, data);
}

scwin.grd_indexPage_oncellclick = function(row,col) {
	  //전달할 데이터를 key value 형태로 전달한다. 콜백함수의 키인 callbackFn 은 변경금지. 다른 키값은 자유롭게 사용
	  var data = {  paramsData1:dlt_grdAllData.getRowJSON(row) ,callbackFn : "scwin.CallBack" };
	  var options = {
	  					 "url"   :"/web/dev/window/sampleDropDownPopup.xml",
		                 "width" : 400,
		                 "height": 262,
		                 "rowIdx" : row, //그리드뷰인 경우 row 위치 필수
		                 "colIdx" : col //그리드뷰인 경우 col 위치 필수
	                 };
	 com.win.openDropDownPopup(grd_indexPage,options, data);
};
 */
com.win.openDropDownPopup = function(btnObj, opt, data) {
	try {
		var url = opt.url || "";
		var width = opt.width || 500;
		var height = opt.height || 500;
		var rowIdx = opt.rowIdx;
		var colIdx = opt.colIdx;
		var position = opt.position;

		try {
			var deviceWidth = parseFloat($("body").css("width"));
			var deviceHeight = parseFloat($("body").css("height"));

			if (!opt.notMinSize) {
				var borderSize = 4;
				borderSize = 4
				if (deviceWidth > 0 && width > deviceWidth) {
					opt.width = deviceWidth - borderSize; // 팝업 border 고려
				}

				if (deviceHeight > 0 && height > deviceHeight) {
					opt.height = deviceHeight - borderSize; // 팝업 border 고려
				}

			}
		} catch (e) {

		}
		var options = {
			url : opt.url, width : width, height : height, frameId : $p.getFrameId(), position : position
		};

		if (com.util.isEmpty(btnObj) || !com.util.getComponent(btnObj.id)) {
			throw "com.win.openDropDownPopup 버튼이 존재하지 않습니다";
			return false;
		}

		if (btnObj.getPluginName() == "gridView") {
			if (com.util.isEmpty(rowIdx) || com.util.isEmpty(colIdx)) {
				console.log("com.win.openDropDownPopup rowIndex 또는 colIndex 정보가 없습니다.");
				return false;
			} else {
				options.rowIdx = rowIdx;
				options.colIdx = colIdx;
			}
		}

		if (!com.util.isEmpty($p.top) && typeof $p.top === "function") {
			var topFrame = $p.top();
			if (com.util.isEmpty(topFrame.com)) {
				topFrame = WebSquare.util.getMainFrame();
			}
			var commonDropDownPopup = topFrame.com.util.getComponent("commonDropDownPopup");
			if (!com.util.isEmpty(commonDropDownPopup)) {
				event.stopPropagation();
				com.win._layerHideAll();
				commonDropDownPopup.getObj("scwin").openLayerInit(btnObj.id, options, data);
			}
		}
	} catch (e) {
		console.error(e);
	}
}

/**
 * 데이터가 수정되어있는 경우 창이 닫힐때 창을 닫을 지 여부르를 묻는 컨펌창을 호출한다.
 *
 * @private
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} dataObjArr 창이 닫힐때 수정된 여부를 체크할 데이터컬렉션 객체(데이터 맵또는 데이터 리스트)
 * @return {Object} topFrame 객체
 * @author 김응한
 * @example com.win.setBeforeCloseModified([dma_sample,dlt_grdAllData]);
 */
com.win.setBeforeCloseModified = function(dataObjArr) {
	var frameObj = com.win._getMenuTopFrame();
	var frameId = frameObj.id;
	var modifiedData = frameObj.getUserData(frameId + "_" + "ModifiedData");
	var dataIds = "";

	if (com.util.isEmpty(modifiedData)) {
		modifiedData = [];
	}

	if (com.util.isEmpty(dataObjArr)) {
		return;
	}

	modifiedData = modifiedData.concat(dataObjArr);
	frameObj.setUserData(frameId + "_" + "ModifiedData", modifiedData);

	// wframePopup팝업
	if ($p.isWFramePopup()) {
		$("#" + $p.getPopupId() + "_close").click(function() {
			var popupId = $p.getPopupId();
			var popupObj = $p.getPopup(popupId);
			popupObj.setCloseButtonStatus(false)

			if (com.win.beforeCloseModifiedCheck(frameId)) {
				var paramObj = {
					"popupId" : popupId
				};
				if (confirm(com.data.getMessage("com.cfm.0007") ||"창을 닫으시겠습니까? 변경사항이 저장되지 않을 수 있습니다")) {
					popupObj.close();
				}
				/*
				 * wframe confirm으로 바꿔야 하는 요구사항이 생기면 사용 var options ={ "callBackParam":paramObj, } com.win.confirm("창을 닫으시겠습니까? 변경사항이 저장되지 않을 수 있습니다",
				 * "com.win._popupCloseCallBack",options);
				 */
			} else {
				popupObj.close();
			}
		})
	} else if ($p.isPopup()) {
		// 윈도우팝업
		$(window).bind('beforeunload', function() {
			var popupObj = com.util.getComponent($p.getPopupId());
			if (com.win.beforeCloseModifiedCheck(frameId)) {
				return "창을 닫으시겠습니까? 변경사항이 저장되지 않을 수 있습니다";
			}
		});
	}
	return;
}

/**
 * 현재 화면의 데이터컬렉션중에 수정된 된 데이터가 있는지 확인한다. com.win.setBeforeCloseModified으로 등록한 데이터만 체크한다.
 *
 * @private
 * @memberOf com.win
 * @param {Object} frameId 프레임의 아이디
 * @return {Boolean} 수정된 데이터가 있으면 true 없으면 false 반환
 * @date 2019.11.16
 * @author 김응한
 * @example
com.win.beforeCloseModifiedCheck(wfm_wframe)
 */
com.win.beforeCloseModifiedCheck = function(frameId) {
	var frameObj = com.util.getComponent(frameId);
	if (com.util.isEmpty(frameObj)) {
		return false;
	}

	var modifiedDataArr = frameObj.getUserData(frameId + "_" + "ModifiedData");

	if (!com.util.isEmpty(modifiedDataArr)) {
		if (com.util.isArray(modifiedDataArr) && com.util.isArray(modifiedDataArr) && modifiedDataArr.length > 0) {
			var uniqArr = modifiedDataArr.reduce(function(a, b) {
				if (a.indexOf(b) < 0)
					a.push(b);
				return a;
			}, []);
		}

		if (!com.util.isEmpty(uniqArr) && com.util.isArray(uniqArr)) {
			var uniqLen = uniqArr.length;
			if (uniqLen > 0) {
				for (var i = 0; i < uniqLen; i++) {
					var dlObj = uniqArr[i]
					if (!com.util.isEmpty(dlObj) && (dlObj.initializeType == "dataList" || dlObj.initializeType == "dataMap")) {
						var modifiedIndex = dlObj.getModifiedIndex();
						if (modifiedIndex.length > 0) {
							return true;
							break;
						}
					}
				}

			}
		}
		return false;
	} else {
		return false;
	}
};


/**
 * 조회개인화 레이어를 호출한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} btnObj 조회개인화 레이어를 호출하는 버튼
 * @param {Object} grpSearchBox 조회영역을 감싼 group
 * @author 김응한
 * @example
scwin.btn_userSerchInfo_onclick = function() {
	com.win.showPersonalLayer(btn_userSerchInfo,grp_searchBox);
};
 */
com.win.showPersonalLayer = function(btnObj,grpSearchBox){
	try {
		var topFrame = $p.top();
		if (com.util.isEmpty(topFrame.com)) {
			topFrame = WebSquare.util.getMainFrame();
		}

		if (!com.util.isEmpty(topFrame)) {
			var scopeFrameId = com.win.getFrame().id;
			var pgmId = com.win.getProgramId();
			var menuProgramId = com.win._getMenuTopFrame().getWindow().com.win.getProgramId();

			if (menuProgramId != pgmId) {
				pgmId = menuProgramId + "_" + pgmId;
			}
			var personalLayer = topFrame.com.util.getComponent("commonPersonalization");
			if (!com.util.isEmpty(personalLayer)) {
				personalLayer.getObj("scwin").userSetInfoInit(btnObj.id ,grpSearchBox,scopeFrameId , pgmId);
			}
		}
	} catch (ex) {
		console.error(ex);
	}
}


/**
 * 설정된 조회 항목을 개인화 서비스에 저장된 값으로 설정한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} searchKey 최종설정기억값의 키값 기본값 final
 * @author 김응한
 * @example
com.win.setSearchUserInfo()
 */
com.win.setPersonalSearchOption = function(searchKey) {
	try {
		var scopeFrame = com.win.getFrame();//com.win._getMenuTopFrame();
		var dltComp;
		var scopeId = "";

		if (!com.util.isEmpty(scopeFrame)) {
			dltComp = scopeFrame.scope.com.util.getComponent("dlt_commSearchUserInfo");
		}else{
			dltComp = com.util.getComponent("dlt_commSearchUserInfo");
		}

		if (com.util.isEmpty(dltComp)) {
			return;
		}

		var key = searchKey || "final";
		var searchInfo = dltComp.getMatchedJSON("inqCondId",key);
		var searchInfoLen = searchInfo.length

		if (searchInfoLen ==0 ) {
			return;
		}
		for (var idx = 0; idx < searchInfoLen; idx++) {

			var searchInfoData = searchInfo[idx];
			if(searchInfoData.inqCondKdCd == "savefinal"){

			}else if(searchInfoData.inqCondKdCd == "streValue"){
				var searchValArr = searchInfoData.inqCondCntn.split(",");
				var searchValArrLen = searchValArr.length;

				for (var jdx = 0; jdx < searchValArrLen; jdx++) {
					var searchCompValStr = searchValArr[jdx];
					var searchCompValArr = searchCompValStr.split(gcm.ITEM_DELIMITER);
					if (searchCompValArr.length !=2) {
						continue;
					}
					var compId    = searchCompValArr[0];
					var compValue = searchCompValArr[1];
					compObj = com.util.getComponent(compId);
					if (!com.util.isEmpty(compObj)) {
						compObj.setValue(compValue);
					}
				}
			}
		}

	} catch (ex) {
		console.error(ex);
	}
};

/**
 * 조회개인화 마지막조회값을 최종설정으로 저장한다.
 * 조회개인화 레이어창에 최종설정기억이 체크되어 있는 경우만 조회 조건이 저장된다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} grpSearchBox 최종설정기억을 저장하는 조회영역의 group 객체
 * @author 김응한
 * @example
com.win.finalSearchSave(grp_searchBox);
 */
com.win.finalSearchSave =function(grpSearchBox){
	try {
		var pgmId = com.win.getProgramId();
		var topFrame = $p.top();
		if (com.util.isEmpty(topFrame.com)) {
			topFrame = WebSquare.util.getMainFrame();
		}

		var menuProgramId = com.win._getMenuTopFrame().getWindow().com.win.getProgramId();

		if (!com.util.isEmpty( com.util.getComponent("dlt_commSearchUserInfo")) ) {
			var saveFinalData = dlt_commSearchUserInfo.getMatchedJSON("inqCondKdCd","saveFinal");
			if (saveFinalData.length > 0) {
				if ( WebSquare.util.getBoolean(saveFinalData[0].inqCondCntn) === true) {
					if (menuProgramId != pgmId) {
						pgmId = menuProgramId + "_" + pgmId;
					}
					var personalLayer = topFrame.com.util.getComponent("commonPersonalization");
					if(!com.util.isEmpty(personalLayer)){
						var scwinObj = personalLayer.getObj("scwin");
						if(!com.util.isEmpty(scwinObj)){
							scwinObj.finalSearchSave(grpSearchBox,pgmId);
						}
					}
				}
			}
		}
	} catch (ex) {
		console.error(ex);
	}
};





/**
 * 그리드 개인화 팝업 창을 호출한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} grdObj 그리드 개인화 설정 대상이 되는 그리드뷰
 * @author 김응한
 * @example
com.win.grdPernalPopup(grp_searchBox);
 */
com.win.grdPernalPopup = function (grdObj) {
	try {
		var menuTopFrame = com.win._getMenuTopFrame();
		var pgmId = com.win.getProgramId();
		var grdId = grdObj.getID();
		var grdOrgId = grdObj.getOriginalID();
		var rowSize = com.win.getPersonalGrdRowSize(grdObj);
		var menuProgramId = menuTopFrame.getWindow().com.win.getProgramId();

		if (menuProgramId != programId) {
			pgmId = menuProgramId + "_" + programId;
		}

		var dltComp = com.util.getComponent("dlt_commGrdUserInfo");
		if (!com.util.isEmpty(dltComp)) {
			var url = "/common/xml/commonGrdUserSetInfo.xml";
			var data = { "grdfullId" : grdId,"grdOrgId" : grdOrgId , "rowSize" :rowSize ,"pgmId": pgmId, "persnalDltId":dltComp.id ,callbackFn : "scwin.grdPernalPopCallBack" };
			var options = {
					id : "commonGrdUserSetInfoPop",
					popupName : "컬럼설정", // 팝업 타이틀
					width : 560,
					height: 380,
			};
			com.win.openPopup(url, options, data);
		} else {
			console.error("개인화 초기화 셋팅이 필요합니다.");
		}

	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 그리드 개인화 값을 적용한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Array} grdSetInfo 그리드 개인화 설정을 적용할 그리드뷰 목록
 * @author 김응한
 * @example
com.win.setPersonalGridViewOption(); // 개인화 설정 셋팅
//특정 그리드뷰만 개인화를 적용하는 경우 파라미터 전달
var grdSetInfo = [grd_indexPage, grd_indexPage2];
com.win.setPersonalGridViewOption(grdSetInfo);
 */
com.win.setPersonalGridViewOption = function(grdSetInfo) {
	try {
		var dltComp = com.util.getComponent("dlt_commGrdUserInfo");

		if (com.util.isEmpty(dltComp)) {
			return;
		}

		if (com.util.isEmpty(grdSetInfo) || grdSetInfo.length == 0) {
			grdSetInfo = dltComp.getColumnDistinctDataArray("sgridId");
		}

		var grdSetInfoCnt = grdSetInfo.length;
		if (grdSetInfoCnt > 0) {
			var grdObj;
			var initRowSize;
			for (var idx = 0; idx < grdSetInfoCnt; idx++) {
				var grdObj = grdSetInfo[idx];
				if (typeof grdObj ==="string") {
						grdObj = com.util.getComponent(grdObj);
				}
				//화면에 존재여부 검증
				if (com.util.isEmpty(grdObj)) {
					continue;
				}
				if (grdObj.getScope() != com.win.getFrame()) {
					continue;
				}

				var grdId = grdObj.getOriginalID();
				var grdInfoData  = dltComp.getMatchedJSON("sgridId" ,grdId);

				if (grdInfoData.length==0) {//해당 그리드뷰는 저장된 개인화 정보가 없음
					continue;
				}

				var colCnt = grdObj.getColCnt();
				var bodyColValueArr = grdObj.getColumnOrder(true);
				var bodyColValueArrLen = bodyColValueArr.length;

				var grdAutoFit = grdObj.options.autoFit;
				if (grdAutoFit !="" || grdAutoFit !="none") {
					var options = {
							type : "",
					}
					grdObj.setAutoFit(options);
				}

				for (var jdx = 0; jdx < grdInfoData.length; jdx++) {
					var divsCd = grdInfoData[jdx].sgridAttrDivsCd;
					var attrCntn = grdInfoData[jdx].sgridAttrCntn;
					if ( divsCd =="B01") {//1.컬럼 순서
						grdObj.setColumnOrder(attrCntn);
					} else if(divsCd =="B02") {//2. 컬럼 숨김
						var hiddenArr = attrCntn.split(",");
						for(var i=0; i<hiddenArr.length; i++){
							var isHidden = !WebSquare.util.getBoolean(hiddenArr[i]);
							grdObj.setColumnVisible(bodyColValueArr[i],isHidden);
						}
					} else if(divsCd =="B03") {//3. 컬럼 너비
						var grdColWidthArr = attrCntn.split(",");
						for (var i=0; i<bodyColValueArrLen; i++) {
							var colWidth = Number(grdColWidthArr[i]);
							if (isNaN(colWidth)) {
								continue;
							}
							grdObj.setColumnWidth(bodyColValueArr[i],colWidth);
						}
					} else if(divsCd =="B04") {//4. 로우 갯수
						grdObj.setUserData("grdPersonalRowSize",attrCntn);
						com.win.changeGridViewHeight(grdObj,attrCntn);
					}
				}

				if (grdAutoFit != "") {
					var options = {
							type : grdAutoFit,
					}
					grdObj.setAutoFit(options);
				}

			}
		}
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 그리드 개인화 그리드에 설정된 rowSize로 그리드 높이를 조정한다.
 * 개인화에 저장되어있지 않을 경우의 initRowSize가 적용된다.
 * com.win.getPersonalGrdRowSize로 리턴 받을 수 있다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} grdSetInfo 그리드 개인화에 설정한 rowSize를 변경할 그리드뷰
 * @param {Number} 그리드 개인화 값으로 rowSize 값이 없는 경우 초기 rowSize 값
 * @author 김응한
 * @example
com.win.setPersonalGrdRowSize(grd_indexPage,10);//개인화에 설정된 그리드 rowSize로 셋팅 ,값이없으면 10으로 셋팅
 */
com.win.setPersonalGrdRowSize = function(grdObj,initRowSize) {
	try {
		var dltComp;
		var rowSize = initRowSize || 10;
		dltComp = com.util.getComponent("dlt_commGrdUserInfo");

		if (com.util.isEmpty(dltComp)) {
			return;
		}

		var orderArr = grdObj.getColumnOrder(true);
		var hiddenArr = grdObj.hiddenList;
		grdObj.setUserData("grdInitPersonalColOrder", orderArr.join(","));
		grdObj.setUserData("grdInitPersonalHiddenList", hiddenArr.join(","));

		var colWidthListArr = grdObj.colWidthList;
		grdObj.setUserData("grdInitPersonalColWidth",  colWidthListArr.join(","));
		grdObj.setUserData("grdInitPersonalRowSize",  initRowSize);

		var grdId = grdObj.getOriginalID();
		var grdInfoData  = dltComp.getMatchedJSON("grdId" ,grdId);

		if (grdInfoData.length==0) {//해당 그리드뷰는 저장된 개인화 정보가 없음
			grdObj.setUserData("grdPersonalRowSize",rowSize);
		} else {
			rowSize = grdInfoData[0].grdRowSize || 10;
		}

		grdObj.setUserData("grdPersonalRowSize",rowSize);
		com.win.changeGridViewHeight(grdObj,rowSize);
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 그리드 개인화에서 설정한 rowSize 값을 받을 수 있다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} grdObj 개인화설정된 rowSize를 가져올 그리드뷰
 * @author 김응한
 * @example
	var rowSize = com.win.getPersonalGrdRowSize();
 */
com.win.getPersonalGrdRowSize = function(grdObj) {
	try {
		var rowSize = grdObj.getUserData("grdPersonalRowSize") || 10;
		return rowSize;
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 그리드 뷰의 로우수 만큼 높이를 조정한다.
 * 그리드의 visibleRownum값이 있는 경우 visibleRownum 값이 우선한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} grdSetInfo 그리드 개인화에 설정한 rowSize를 변경할 그리드뷰
 * @param {Number} 그리드 개인화 값으로 rowSize 값이 없는 경우 초기 rowSize 값
 * @author 김응한
 * @example
	var rowSize = com.win.changeGridViewHeight(grd_gridView1,5);
 */
com.win.changeGridViewHeight = function( grdObj, row_cnt) {
	try{
		var obj = com.util.getComponent(grdObj.id)
		var headerHeight = obj.head_table.clientHeight+1; //헤더높이
		var i_inc_cnt = parseInt(row_cnt,10);
		var scrollHeight = 20;


		var visibleRow  = obj.oneRowHeight*(i_inc_cnt);
		var subtotalHeight = 0;
			var defaultCellHeight = obj.options.defaultCellHeight;
			var subtotalRowHeight = Number(obj.options.defaultCellHeight)+1;
			var subTotalLen = 0;
			if (obj.hasSubtotal) {
				if (obj.struct&&obj.struct.subtotalArr && obj.struct.subtotalArr.subTotal1 && obj.struct.subtotalArr.subTotal1.rowArr && obj.struct.subtotalArr.subTotal1.rowArr.length >0){
					subTotalLen = obj.struct.subtotalArr.subTotal1.rowArr.length;
					var subtotalHeight  = subtotalRowHeight*(i_inc_cnt)* subTotalLen;
				}
			}
		var footerHeight = 0;
		if(obj.hasFooter){
			var footTable = obj.foot_table
			if(footTable){
				if(footTable.offsetHeight> 0){
					footerHeight = footTable.offsetHeight+ 2
				}
			}
		}
		obj.setStyle("height", (visibleRow+headerHeight+scrollHeight+subtotalHeight+footerHeight) +"px");
	} catch(e){
		console.error(ex);
	}
};


/**
 * wframe안의 스크립트 영역에서 이 함수를 호출할 경우 자신을 감싼 wframe object를 반환한다.
 * 전역스크립트에서 호출 시에는 null을 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @return {Object} 자신을 감싼 wframe object
 * @example
	var frameObj = com.win.getFrame();
 */
com.win.getFrame = function() {
	try {
		return $p.getFrame();
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 자신의 부모 WFrame 객체를 찾아 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @return {Object} 자신을 감싼 wframe object의 부모 wfrmae 객체
 * @example
	var parentFrame = com.win.getParentFrame();
	var dltObj = parentFrame.getObj("dlt_dataList1"); // 자기 부모 프레임 내에 있는 dlt_dataList1에 접근
	var pScwinObj = parentFrame.getObj("scwin"); // 자기 부모 프레임에 있는 scwin 객체에 접근
	if (!com.util.isEmpty(pScwinObj){
		pScwinObj.search(); // 부모화면에 있는 scwin.search 함수를 호출
	}
 */
com.win.getParentFrame = function() {
	try {
		var frameObj = com.win.getFrame();
		if (!com.util.isEmpty(frameObj) && typeof frameObj.getParentFrame == "function") {
			return frameObj.getParentFrame();
		}else{
			return null;
		}
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 현재 화면의 스크롤 값 또는 특정 그룹 컨포넌트의 스크롤 값을 가져온다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @param {Object} grpObj 스크롤 값을 구하고자 대상이 되는 그룹컴포넌트 , 없는 경우 현재 오픈한 메뉴화면이 대상이 됨
 * @return {Number} 현재스크롤 값
 * @example
1. 현재 오픈한 메뉴화면의 스크롤 위치 값
var scollValue  = com.win.getScrollTop();

2. 특정 탭컨트롤로의 컨텐츠의 스크롤 위치값
var tabFrame = tac_tabContole.getFrame(1);
var scollValue  = com.win.getScrollTop(tabFrame);
*/
com.win.getScrollTop  = function(grpObj){
	try {
		var topFrame = com.win._getMenuTopFrame();
		if(!com.util.isEmpty(grpObj)){
			if(!com.util.isEmpty(grpObj.render)){
				return $(grpObj.render).scrollTop();
			}else{
				return $(grpObj).scrollTop();
			}
		}else if(!com.util.isEmpty(topFrame)){
			if(!com.util.isEmpty(topFrame.render)){
				return $(topFrame.render).scrollTop();
			}
		}else{
			return $(window).scrollTop();
		}
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 현재 화면의 스크롤 값 또는 특정 그룹 컨포넌트의 스크롤 위치를 변경한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @param {Number} 스크롤 값
 * @param {Object} grpObj 스크롤 값을 구하고자 대상이 되는 그룹컴포넌트 , 없는 경우 현재 오픈한 메뉴화면이 대상이 됨
 * @return {Number} 현재스크롤 값
 * @example
1. 현재 오픈한 메뉴화면의 스크롤 위치 값 변경
var scollValue  = com.win.setScrollTop(300);

2. 특정 탭컨트롤로의 컨텐츠의 스크롤 위치 변경
var tabFrame = tac_tabContole.getFrame(1);
var scollValue  = com.win.setScrollTop(120,tabFrame);
*/
com.win.setScrollTop = function(scrollVal, grpObj){
	try {
		if (!com.util.isEmpty(scrollVal)) {
			var topFrame = com.win._getMenuTopFrame();
			if (!com.util.isEmpty(grpObj)) {
				if(!com.util.isEmpty(grpObj.render)){
					return $(grpObj.render).scrollTop(scrollVal);
				}else{
					return $(grpObj).scrollTop(scrollVal);
				}
			} else if(!com.util.isEmpty(topFrame)) {
				if(!com.util.isEmpty(topFrame.render)){
					return $(topFrame.render).scrollTop(scrollVal);
				}
			} else {
				return $(window).scrollTop(scrollVal);
			}
		}
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 그룹의 스크롤이 맨아래 도달한 경우 콜백 함수를 호출한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @param {Object} grpObj 그룹컴포넌트
 * @param {Object} 스크롤 종료시 호출되는 func
 * @example
com.win.setGrpScrollEnd(test1 ,function() {
 console.log("scrollEnd")
});

*/
com.win.setGrpScrollEnd = function(grpObj, func){
	try {
		if (!com.util.isEmpty(grpObj) && typeof func ==="function") {
			var grpEl = $("#"+ grpObj.id);
			$("#"+grpObj.id).scroll(function(){
				if(grpEl[0].scrollHeight - grpEl.scrollTop() == grpEl.outerHeight()){
					func()
				}
			});
		}
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 좌측 메뉴를 펼친다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @param {Boolean} isShow 사이드 메뉴 보기 true or false
 * @example
com.win.showLeftMenu(true);  //left 메뉴 보기
com.win.showLeftMenu(false); //left 메뉴 숨김
*/
com.win.showLeftMenu = function (isShow) {
	try{
		if (!isShow) {
			$('.container').addClass('folded');
		} else {
			$('.container').removeClass('folded');
		}
	} catch (ex) {
		console.error(ex);
	}
};

/**
 * 사용자 로그인 정보를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @author 김응한
 * @return {Object} 로그인정보
 * @example
com.win.getUserLoginInfo(); //left 메뉴 숨김
*/
com.win.getUserLoginInfo = function (){
	try {
		return gcm.USER_LOGIN_INFO;
	}catch (ex) {
		console.error(ex);
	}
};

/**
 * 현재 활성화 되어있는 메뉴 창을 닫는다.
 *
 * @memberOf com.win
 * @date 2019.11.16
 * @param {Object} options 옵션
 * @param {Object} options.alertMsg 메뉴창을 닫기전 알림창 메시지
 * @param {Object} options.confirmMsg 메뉴창을 닫기전 컨펌창 메시지
 * @author 김응한
 * @example
com.win.closeMenu(); //현재 메뉴창 닫음

var options = {"alertMsg":"화면을 닫습니다"}
com.win.closeMenu(options); //alert창 호출후 확인버튼 클릭시 현재 메뉴창 닫음

var options = {"confirmMsg":"화면을 닫습니다"}
com.win.closeMenu(options); //confirm창 호출후 확인버튼 클릭시 현재 메뉴창 닫음 취소버튼 클릭시 화면유지
*/
com.win.closeMenu = function (options){
	try {
		if (com.util.isEmpty(options)) {
			options = {};
		}

		var topFrame = $p.top();
		if (com.util.isEmpty(topFrame.com)) {
			topFrame = WebSquare.util.getMainFrame();
		}

		var msgBoxOps ={
			"callBackParam":options, //alert의 options, 키값은 변경불가
		};

		if (!com.util.isEmpty(options.alertMsg) && typeof options.alertMsg === "string") {
			topFrame.com.win.alert(options.alertMsg, com.win._closeMenu , msgBoxOps);
		} else if (!com.util.isEmpty(options.confirmMsg) && typeof options.confirmMsg === "string") {
			topFrame.com.win.confirm(options.confirmMsg , com.win._closeMenu , msgBoxOps );
		} else {
			com.win._closeMenu(options);
		}
	}catch (ex) {
		console.error(ex);
	}
};


com.win._closeMenu = function (options){
	try {
		if (com.util.isEmpty(options)) {
			options = {};
		}

		if(options.clickValue == false ) {
			return;
		}
		if (!com.util.isEmpty($p.top) &&!com.util.isEmpty($p.top())) {
			var topFrame = $p.top();
			if (com.util.isEmpty(topFrame.com)) {
				topFrame = WebSquare.util.getMainFrame();
			}
			if (gcm.WORK_LAYOUT_TYPE ==="MDI") {
				var frameObj = topFrame.tac_content;
				if (!com.util.isEmpty(frameObj) &&typeof frameObj.getPluginName  === "function" && frameObj.getPluginName() === "tabControl") {
					var contentBodyFrame = com.win._getMenuTopFrame();
					if (!com.util.isEmpty(contentBodyFrame)) {
						var contentBodyId = contentBodyFrame.getID();
						var contentId = com.str.replaceAll(contentBodyId,"_body","")
						var tabArr = frameObj.tabArr;
						var tabArrCnt = tabArr.length;
						for (var idx = 0; idx < tabArrCnt; idx++) {
							var tabInfo = tabArr[idx];
							if ( tabInfo.contentsID == contentId ) {
								frameObj.deleteTab(idx);
								break;
							}
						}
					}
				}
			} else if (gcm.WORK_LAYOUT_TYPE ==="SDI") {
				var frameObj = topFrame.wfm_content;
				if (!com.util.isEmpty(frameObj) && typeof frameObj.getPluginName  === "function" && frameObj.getPluginName() === "wframe") {
					frameObj.setSrc("/websquare/blank.xml")
				}
			}
		}
	} catch (ex) {
		console.error(ex);
	}
};

/**
 * 현재 페이지를 새로고침한다.
 *
 * @memberOf com.win
 * @date 2019.11.22
 * @param {Object} options 옵션
 * @param {Boolean} options.refreshBrowser 브라우저 전체를 새로고침할지 여부
 * @author 박상규
 * @example
com.win.reload();
*/
com.win.reload = function(options) {
	try {
		if ($w.isPopup() === true) {
			if ((com.util.isEmpty(options) === false) && (com.util.isEmpty(options.refreshBrowser) === false)) {
				$p.reinitialize(options.refreshBrowser);
			} else {
				if ($p.top().$p.getFrameId() === $p.getFrameId()) {
					$p.reinitialize(true);
				} else {
					reloadWFrame();
				}
			}
		} else {
			reloadWFrame();
		}
	} catch(ex) {
		console.error(ex);
	}

	function reloadWFrame() {
		var srcPath = "";
		if (com.util.isEmpty(com.data.getParameter("w2xPath")) === false) {
			srcPath = com.data.getParameter("w2xPath");
		} else if ((com.util.isEmpty(scwin.meta) === false) && (com.util.isEmpty(scwin.meta.srcPath) === false)) {
			srcPath = scwin.meta.srcPath;
		}

		if (com.util.isEmpty(srcPath) === false) {
			var param = {
				src : srcPath,
				data : com.data.getParameter()
			};
			com.win.setWframe($p.getFrame(), param);
		} else {
			console.error("The value of srcPath variable can not find.");
		}
	}
};

/**
 * 언어 코드를 설정한다.
 *
 * @memberOf com.win
 * @date 2019.11.22
 * @param {String} langCode 언어코드 (한국어 : "ko", 영어 : "en", 중국어 : "zh");
 * @author 박상규
 * @example
com.win.setLangCode("ko");
com.win.setLangCode("en");
*/
com.win.setLangCode = function(langCode) {
	WebSquare.cookie.setCookie("locale", langCode);
};


/**
 * 언어 코드를 반환한다.
 *
 * @memberOf com.win
 * @date 2019.11.22
 * @return langCode 언어코드 (한국어 : "ko", 영어 : "en", 중국어 : "zh");
 * @author 박상규
 * @example
com.win.getLangCode();
*/
com.win.getLangCode = function(langCode) {
	return WebSquare.cookie.getCookie("locale");
};

// =============================================================================
/**
 * 숫자 관련 함수를 제공한다.
 *
 * @author 박상규
 * @class num
 * @namespace com.num
 */
 // =============================================================================

com.num = {}

/**
 * 반올림 처리를 한다.
 *
 * @param {String|Number} value 반올림 처리를 할 값
 * @param {Number} point 반올림 처리를 할 소수점 자리 수 (Default : 0, 정수 값으로 반올림 처리)
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Number} 반올림 처리를 한 숫자 값
 * @example
com.num.round(23.4567); // return 예시) 23
com.num.round(23.5567); // return 예시) 24
com.num.round(23.5567, 2); // return 예시) 23.56
com.num.round(23.5564, 3); // return 예시) 23.556
 */
com.num.round = function(value, point) {

	var num = 1;
	if (typeof point !== "undefined") {
		num = Math.pow(10, point);
	}

	return Math.round(Number(value) * num) / num;
};


/**
 * 내림 처리를 한다.
 *
 * @param {String|Number} value 내림 처리를 할 값
 * @param {Number} point 내림 처리를 할 소수점 자리 수 (Default : 0, 정수 값으로 내림 처리)
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Number} 내림 처리를 한 숫자 값
 * @example
com.num.floor(23.5567); // return 예시) 23
com.num.floor(23.5567, 2); // return 예시) 23.55
 */
com.num.floor = function(value, point) {

	var num = 1;
	if (typeof point !== "undefined") {
		num = Math.pow(10, point);
	}

	return Math.floor(Number(value) * num) / num;
};


/**
 * 올림 처리를 한다.
 *
 * @param {String} value 올림 처리를 할 값 (String 또는 Number 타입 지원)
 * @param {Integer} point 올림 처리를 할 소수점 자리 수 (Default : 0, 정수 값으로 올림 처리)
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Number} 올림 처리를 한 숫자 값
 * @example
com.num.ceil(23.5567); // return 예시) 24
com.num.ceil(23.5567, 2); // return 예시) 23.56
 */
com.num.ceil = function(value, point) {

	var num = 1;
	if (typeof point !== "undefined") {
		num = Math.pow(10, point);
	}

	return Math.ceil(Number(value) * num) / num;
};


/**
 * 화폐 포맷을 적용해서 문자열을 반환한다.
 *
 * @param {String|Number} value 포멧터를 적용할 값
 * @param {String} type 적용할 포멧터 형식(Default:null,dollar,plusZero,won)
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 문자열
 * @example
com.num.formatMoney("12345"); // 12,345
com.num.formatMoney("12345", "dollar"); // $12,345
com.num.formatMoney("12345", "plusZero"); // 123,450
com.num.formatMoney("12345", "won"); // 12,345원
 */
com.num.formatMoney = function (value, type) {
	var amount;

	if (type == "plusZero") {
		amount = new String(value) + "0";
	} else {
		amount = new String(value);
	}

	amount = amount.split(".");

	var amount1 = amount[0].split("").reverse();
	var amount2 = amount[1];

	var output = "";
	for (var i = 0; i <= amount1.length - 1; i++) {
		output = amount1[i] + output;
		if ((i + 1) % 3 == 0 && (amount1.length - 1) !== i)
			output = ',' + output;
	}

	if (type == "dollar") {
		if (!amount2) {
			output = "$ " + output;
		} else {
			output = "$ " + output + "." + amount2;
		}
	} else if (type == "won") {
		if (!amount2) {
			output = output + "원";
		} else {
			output = output + "." + amount2 + "원";
		}
	} else {
		if (!amount2) {
			output = output;
		} else {
			output = output + "." + amount2;
		}
	}

	return output;
};


/**
 * 세번째 자리마다 콤마를 추가해서 반환한다.
 *
 * @param {String|Number} value 포멧터를 적용할 값
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 문자열
 * @example
com.num.formatNumber("12345677"); // "12,345,677"
com.num.formatNumber(12345677); // "12,345,677"
com.num.formatNumber(-12345677); // "-12,345,677"
 */
com.num.formatNumber = function (value) {
	return WebSquare.util.setNumber(value);
};


/**
 * 숫자가 맞는지 여부를 검사한다.
 *
 * @param {String|Number} value 검사할 숫자 값
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Boolean} 숫자 여부 (숫자이면 true, 아니면 false 반환)
 * @example
com.num.isNumber("123"); // true;
com.num.isNumber(123); // true;
com.num.isNumber("123.123"); // true;
com.num.isNumber(123.123); // true;
com.num.isNumber("-123.123"); // true;
com.num.isNumber(-123.123); // true;
com.num.isNumber("a123"); // false;
 */
com.num.isNumber = function (value) {
	return !isNaN(value);
};


/**
 * 홀수가 맞는지 여부를 검사한다.
 *
 * @param {String|Number} value 검사할 값
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Boolean} 홀수 여부 (홀수이면 true, 아니면 false 반환)
 * @example
com.num.isOdd("123"); // true;
com.num.isOdd(123); // true;
com.num.isOdd("122"); // false;
com.num.isOdd(122); // false;
 */
com.num.isOdd = function (value) {
	return WebSquare.util.isOdd(value);
};


/**
 * 문자열을 정수형으로 변환한다.
 *
 * @param {String} value 변환할 문자열
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Number} 변환된 정수형 값
 * @example
com.num.parseInt("5231"); // 5231;
 */
com.num.parseInt = function (value) {
	return WebSquare.util.parseInt(value);
};


/**
 * 문자열을 실수형으로 변환한다.
 *
 * @param {String} value 변환할 문자열
 * @memberOf com.num
 * @date 2019.11.16
 * @author 박상규
 * @return {Number} 변환된 실수형 값
 * @example
com.num.parseFloat("5231.22"); // 5231.22;
 */
com.num.parseFloat = function (value) {
	return WebSquare.util.parseFloat(value);
};


/**
 * 바이트 값을 적절한 단위(KB, MB, GB)를 변환해서 반환한다.
 *
 * @memberOf com.num
 * @date 2019.11.16
 * @param {String} value 변환할 값
 * @author 박상규
 * @example
com.num.formatByte(32132);
 */
com.num.formatByte = function(value) {
	var unitType = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	if (value == 0 || value == "0" || isNaN(value)) {
		return 0 + " " + unitType[0];
	}
	var index = Math.floor(Math.log(value) / Math.log(1024));
	return (value / Math.pow(1024, index)).toFixed(1) + " " + unitType[index];
};


// =============================================================================
/**
 * 문자열 관련 함수를 제공한다.
 *
 * @author 박상규
 * @class str
 * @namespace com.str
 */
 // =============================================================================

com.str = {}

/**
 * XML, JSON 객체를 String 타입으로 반환한다.
 *
 * @param {Object} object String으로 변환할 JSON 객체
 * @param {String} replacer 치환할 문자열
 * @param {Number} space 여백 수
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {String} String으로 변환된 객체
 */
com.str.serialize = function (object, replacer, space) {
	if (typeof object == 'string') {
		return object;
	} else if (com.util.isJSON(object)) {
		return JSON.stringify(object, replacer, space);
	} else if (com.util.isXmlDoc(object)) {
		return WebSquare.xml.serialize(object);
	} else {
		return object;
	}
};


/**
 * 문자열 좌측에 지정한 길이만큼 특정 문자를 채워서 반한환다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @param {String} str 포멧터를 적용할 문자열
 * @param {Number} length 0 으로 채울 길이
 * @param {String} char : 채우고자하는 문자(char)
 * @return {String} 일정길이 만큼 char 으로 채워진 문자열
 * @example
com.str.lpad("24", 4, "0"); // "0024"
com.str.lpad("11321", 8, "A"); // "AAA11321"
 */
com.str.lpad = function(str, length, char) {
	if (char.length > length) {
		console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
		return str + "";
	}
	while (str.length < length)
		str = char + str;
	str = str.length >= length ? str.substring(0, length) : str;
	return str;
};


/**
 * 문자열 우측에 지정한 길이만큼 특정 문자를 채워서 반한환다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @param {String} str 포멧터를 적용할 문자열
 * @param {Number} length 0 으로 채울 길이
 * @param {String} char : 채우고자하는 문자(char)
 * @return {String} 일정길이 만큼 char 으로 채워진 문자열
 * @example
com.str.rpad("24", 4, "0"); // "2400"
com.str.rpad("11321", 8, "A"); // "11321AAA"
 */
com.str.rpad = function(str, length, char) {
	if (char.length > length) {
		console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
		return str + "";
	}
	while (str.length < length)
		str += char;
	str = str.length >= length ? str.substring(0, length) : str;
	return str;
};


/**
 * 주민번호 문자열에 Formatter(######-#######)를 적용하여 반환한다.
 *
 * @param {String} str 주민번호 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 주민번호 문자열
 * @example
com.str.formatSSN("1234561234567");  // "123456-1234567"
 */
com.str.formatSSN = function (str) {
	var front = String(str).substr(0, 6);
	var back = String(str).substr(6, 7);
	var output = front + "-" + back;

	return output;
};


/**
 * 문자열에 전화번호 형식 Formatter를 적용하여 반환한다.
 *
 * @param {String} str 포멧터를 적용할 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 문자열
 * @example
com.str.formatPhone("0212345678");  // "02-1234-5678"
com.str.formatPhone("05051234567"); // "0505-123-4567"
com.str.formatPhone("03112345678"); // "031-1234-5678"
com.str.formatPhone("0311234567");  // "031-123-4567"
 */
com.str.formatPhone = function (str) {
	  try {
		  str = str.replace(/\s+/g,"");
		  var commCdList = ["0505"]; // 4자리 국번 ,예외가 되는 국번 확인
		  var commCdNum = str.substr(0,4); // 국번 4자리 확인
		  if(commCdList.indexOf(commCdNum) >-1){ //국번이 0505 인경우
			  return str.replace(/^(01[0136789]{1}|02|0[3-9]{1}[0-9]{1}[0-9]{1})-?([*0-9]{3,4})-?([0-9]{4})$/,"$1-$2-$3");
		  }else if(str.length <=11){
			  return str.replace(/^(01[0136789]{1}|02|0[3-9]{1}[0-9]{1})-?([*0-9]{3,4})-?([0-9]{4})$/,"$1-$2-$3");
		  }else{
			  return str;
		  }
	  } catch (ex) {
		  console.error(ex);
	  }
};


/**
 * 문자열에 시간 형식 Formatter를 적용하여 반환한다.
 *
 * @param {String} str 포멧터를 적용할 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 문자열
 * @author 박상규
 * @example
com.str.formatTime("123402"); // 12:34:02
com.str.formatTime("1234"); // 12:34:02
*/
com.str.formatTime = function(str) {
	try {
		var hour = String(str).substr(0, 2);
		var minute = String(str).substr(2, 2);
		var second = String(str).substr(4, 2);
		if (com.util.isEmpty(second)) {
			return hour + ":" + minute;
		} else {
			return hour + ":" + minute + ":" + second;
		}
	} catch (ex) {
		console.error(ex);
		return str;
	}
};


/**
 * 문자(char)의 유형을 리턴한다.
 *
 * @param {String} str 어떤 유형인지 리턴받을 문자
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {Number} 유니코드 기준 <br><br>
 * 한글음절[ 44032 ~ 55203 ] => 1 <br>
 * 한글자모[ 4352 ~ 4601 ] => 2 <br>
 * 숫자[ 48 ~ 57 ] => 4 <br>
 * 특수문자[ 32 ~ 47 || 58 ~ 64 || 91 ~ 96 || 123 ~ 126 ] => 8 <br>
 * 영문대[ 65 ~ 90 ] => 16 <br>
 * 영문소[ 97 ~ 122 ] => 32 <br>
 * 기타[그외 나머지] => 48
 * @example
com.str.getLocale("가"); // 1
com.str.getLocale("ㅏ"); // 2
com.str.getLocale("1");  // 4
com.str.getLocale("!");  // 8
com.str.getLocale("A");  // 16
com.str.getLocale("a");  // 32
com.str.getLocale("¿");  // 48
 */
com.str.getLocale = function (str) {
	var locale = 0;
	if (str.length > 0) {
		var charCode = str.charCodeAt(0);

		if (charCode >= 0XAC00 && charCode <= 0XD7A3) { // 한글음절.[ 44032 ~ 55203 ]
			locale = 0X1; // 1
		} else if ((charCode >= 0X1100 && charCode <= 0X11F9) || (charCode >= 0X3131 && charCode <= 0X318E)) { // 한글자모.[ 4352 ~ 4601 ]
			locale = 0X2; // 2
		} else if (charCode >= 0X30 && charCode <= 0X39) { // 숫자.[ 48 ~ 57 ]
			locale = 0X4; // 4
		} else if ((charCode >= 0X20 && charCode <= 0X2F) || (charCode >= 0X3A && charCode <= 0X40) || (charCode >= 0X5B && charCode <= 0X60)
			|| (charCode >= 0X7B && charCode <= 0X7E)) { // 특수문자
			locale = 0X8; // 8
		} else if (charCode >= 0X41 && charCode <= 0X5A) { // 영문 대.[ 65 ~ 90 ]
			locale = 0X10; // 16
		} else if (charCode >= 0X61 && charCode <= 0X7A) { // 영문 소.[ 97 ~ 122 ]
			locale = 0X20; // 32
		} else { // 기타
			locale = 0X30; // 48
		}
	}
	return locale;
};


/**
 * 입력받은 문자열에 한글이 포함되어 있는지 여부를 검사한다.
 *
 * @param {String} value 한글 유형인지 검증할 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {Boolean} true or false
 * @example
com.str.existKorean("abc"); // false
com.str.existKorean("abc무궁화"); // true
com.str.existKorean("무궁화꽃이"); // true
 */
com.str.existKorean = function (value) {
	check = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
	if (check.test(value)) {
		return true;
	} else {
		return false;
	}
};


/**
 * 입력받은 문자열 전체가 한글인지를 검사한다.
 *
 * @param {String} str 한글이 포함되어 있는지 검증 받을 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {Boolean} true or false
 * @example
com.str.isKorean("abcd"); // false
com.str.isKorean("abcd무궁화"); // false
com.str.isKorean("무궁화"); // true
 */
com.str.isKorean = function (str) {
	var result = false;

	for (var i = 0; i < str.length; i++) {
		c = str.charAt(i);
		if (!com.str.existKorean(c)) {
			result = false;
			break;
		} else {
			result = true;
		}

	}
	return result;
};


/**
 * 종성이 존재하는지 여부를 검사한다.
 *
 * @param {String} str 종성의 여부를 검사할 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {Boolean} true or false
 * @example
com.str.isFinalConsonant("종서")
// return 예시) false

com.str.isFinalConsonant("종성")
// return 예시) true

com.str.isFinalConsonant("입니다")
// return 예시) false

com.str.isFinalConsonant("입니당")
// return 예시) true
 */
com.str.isFinalConsonant = function (str) {
	var code = str.charCodeAt(str.length - 1);
	if ((code < 44032) || (code > 55197)) {
		return false;
	}
	if ((code - 16) % 28 == 0) {
		return false;
	}
	return true;
};


/**
 * 단어 뒤에 '은'이나 '는'을 붙여서 반환한다.
 *
 * @param {String} str 은, 는 붙일 문자열
 * @memberOf com.str
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 변환된 문자열
 * @example
com.str.attachPostposition("나");
// return 예시)"나는"

com.str.attachPostposition("나와 너");
// return 예시)"나와 너는"

com.str.attachPostposition("그래서");
// return 예시)"그래서는"

com.str.attachPostposition("그랬습니다만");
// return 예시)"그랬습니다만은"
 */
com.str.attachPostposition = function (str) {
	if (com.str.isFinalConsonant(str)) {
		str = str + "은";
	} else {
		str = str + "는";
	}
	return str;
};


/**
 * 사업자번호 유효성을 검사한다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @param {String} str 사업자번호 문자열
 * @return {Boolean} 정상이면 true, 비정상이면 false를 반환
 * @example
com.str.isBizID("1102112345"); // false
com.str.isBizID("1078616054"); // true
com.str.isBizID("2208139938"); // true
com.str.isBizID("1248100998"); // true
 */
com.str.isBizID = function (str) {
	var sum = 0;
	var aBizID = new Array(10);
	var checkID = new Array("1", "3", "7", "1", "3", "7", "1", "3", "5");

	for (var i = 0; i < 10; i++) {
		aBizID[i] = str.substring(i, i + 1);
	}
	for (var i = 0; i < 9; i++) {
		sum += aBizID[i] * checkID[i];
	}
	sum = sum + parseInt((aBizID[8] * 5) / 10);
	temp = sum % 10;
	temp1 = 0;

	if (temp != 0) {
		temp1 = 10 - temp;
	} else {
		temp1 = 0;
	}
	if (temp1 != aBizID[9]) {
		return false;
	}
	return true;
};


/**
 * 내외국인 주민등록번호 유효성을 검사한다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @param {String} str 문자열
 * @returns {Boolean} 정상이면 true, 비정상이면 false를 반환
 * @example
com.str.isSSN("9701011234567");
 */
com.str.isSSN = function (str) {
	var checkID = new Array(2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5);
	var i = 0, sum = 0;
	var temp = 0;
	var yy = "";

	if (str.length != 13) {
		return false;
	}
	for (i = 0; i < 13; i++) {
		if (str.charAt(i) < '0' || str.charAt(i) > '9') {
			return false;
		}
	}

	// foreigner PersonID Pass
	if (str.substring(6, 13) == "5000000" || str.substring(6, 13) == "6000000" || str.substring(6, 13) == "7000000"
		|| str.substring(6, 13) == "8000000") {
		return true;
	}
	for (i = 0; i < 12; i++) {
		sum += str.charAt(i) * checkID[i];
	}
	temp = sum - Math.floor(sum / 11) * 11;
	temp = 11 - temp;
	temp = temp - Math.floor(temp / 10) * 10;

	// 나이 (-) 체크
	if (str.charAt(6) == '1' || str.charAt(6) == '2' || str.charAt(6) == '5' || str.charAt(6) == '6') {
		yy = "19";
	} else {
		yy = "20";
	}

	if (parseInt(com.date.getServerDateTime("yyyy")) - parseInt(yy + str.substring(0, 2)) < 0) {
		return false;
	}

	// 외국인 주민번호 체크로직 추가
	if (str.charAt(6) != '5' && str.charAt(6) != '6' && str.charAt(6) != '7' && str.charAt(6) != '8') {
		if (temp == eval(str.charAt(12))) {
			return true;
		} else {
			return false;
		}
	} else {
		if ((temp + 2) % 10 == eval(str.charAt(12))) {
			return true;
		} else {
			return false;
		}
	}
	return false;
};


/**
 * 이메일 주소의 유효성을 검사한다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @param {String} str 메일주소
 * @return {Boolean} 정상이면 true, 비정상이면 false를 반환
 * @example
com.str.isEmail("emailTest@email.com");  // true
 */
com.str.isEmail = function (str) {
	if (typeof str != "undefined" && str != "") {
		var format = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

		if (format.test(str)) {
			return true;
		} else {
			return false;
		}
	}
	return true;
};


/**
 * 전화번호의 유효성을 검사한다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @param {String} str :: I :: Y :: :: 전화번호
 * @return {Boolean} 정상이면 true 그외는 false 반환
 * @author 박상규
 * @example
com.str.isPhone("01094832134"); // true
com.str.isPhone("02094832134"); // false
 */
com.str.isPhone = function(str) {
	try {
		var phoneNum = com.str.formatPhone(str);
		var isDash = (phoneNum.indexOf("-")>1);
		return isDash;
	} catch (e) {
		console.error(ex);
		return false;
	}
};


/**
* 문자열을 치환한다.
*
* @memberOf com.str
 * @date 2019.11.16
* @param	{String} str 문자열
* @param	{String} orgStr 검색할 문자
* @param	{String} repStr 치환할 문자
* @return   {String} 치환문자열
* @author 	김응한
* @example	com.str.replaceAll(obj.getValue(), "/", "");
*/
com.str.replaceAll = function( str, orgStr, repStr ){
	try {
		str = ""+str;
		return str.split(orgStr).join(repStr);
	} catch (e) {
		console.log("[com.str.replaceAll] Exception :: "+ e);
		return str;
	}
};


/**
 * 입력된 문자열의 좌우측 공백을 제거한 문자열을 구한다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @param {String} str 좌우측 공백문자를 제거하려는 문자열
 * @return {String} 입력된 문자열에서 좌우측 공백이 제거된 문자열
 * @author 김응한
 * @example com.str.trim("   a   ");  // return "a"
 */
com.str.trim = function(str) {
	try{
		if (typeof str == "undefined" || str == null) {
			str ="";
		}
		if (typeof str !== "string") {
			str = str + "";
		}
		return str.trim();
	} catch (e) {
		console.log("[com.str.trim] Exception :: ", e);
	}
};


/**
 * 문자열의 바이트 기준 문자열 길이를 반환한다.
 *
 * @memberOf com.str
 * @date 2019.11.16
 * @param {String} str 문자열
 * @param {String} ignoreChar 길이 측정 시 무사할 문자열
 * @return {Number} 문자열 길이
 * @author 박상규
 * @example
com.str.getByteLength("1231aABC");  // 8
com.str.getByteLength("1231a한글");  // 9
 */
com.str.getByteLength = function(str, ignoreChar) {
	return WebSquare.util.getStringByteSize(str, ignoreChar);
};


// =============================================================================
/**
 * 날짜 관련 함수를 제공한다.
 *
 * @author 박상규
 * @class date
 * @namespace com.date
 */
 // =============================================================================

com.date = {}

/**
 * 입력된 날짜에 지정된 만큼의 분을 더한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} pYmd 날짜 형식의 문자열 (yyyyMMdd or yyyyMMddHHmmss)
 * @param {Number} offset 더할 분 수.
 * @return {String} 지정된 offset만큼의 날짜가 더해진 입력 날짜.
 * @author 박상규
 * @example
com.date.addMinute("201708191210", 10); // "201708191220"
com.date.addMinute("201708191210", -10); // "201708191200"
 */
com.date.addMinute = function(pYmd, offset) {
	return WebSquare.date.dateTimeAdd(pYmd, offset, "minute");
};


/**
 * 입력된 날짜에 지정된 만큼의 시간을 더한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} pYmd 날짜 형식의 문자열 (yyyyMMdd or yyyyMMddHHmmss)
 * @param {Number} offset 더할 시간 수.
 * @return {String} 지정된 offset만큼의 날짜가 더해진 입력 날짜.
 * @author 박상규
 * @example
com.date.addHour("2017081912", 10); // "2017081922"
com.date.addHour("2017081912", -10); // "2017081902"
 */
com.date.addHour = function(pYmd, offset) {
	return WebSquare.date.dateTimeAdd(pYmd, offset, "hour");
};


/**
 * 입력된 날짜에 지정된 만큼의 날을 더한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} pYmd 날짜 형식의 문자열 (yyyyMMdd or yyyyMMddHHmmss)
 * @param {Number} offset 더할 날짜 수.
 * @return {String} 지정된 offset만큼의 날짜가 더해진 입력 날짜.
 * @author 박상규
 * @example
com.date.addDate("20170819", 2); // "20170821"
com.date.addDate("20170819", -10); // "20170809"
 */
com.date.addDate = function(pYmd, offset) {
	return WebSquare.date.dateAdd(pYmd, offset);
};


/**
 * 입력된 날짜에 지정된 만큼의 달을 더한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} pYmd 날짜 형식의 문자열 (yyyyMMdd or yyyyMMddHHmmss)
 * @param {Number} offset 더할 개월 수.
 * @return {String} 지정된 offset만큼의 개월이 더해진 입력 날짜.
 * @author 박상규
 * @example
com.date.addMonth("20170819", 2); // "20171019"
com.date.addMonth("20170819", -10); // "20161019"
 */
com.date.addMonth = function(pYmd, offset) {
	try {
		var date = "";
		var isDate = com.date.isDate(pYmd);

		if (!isDate) {
			return;
		}
		if (typeof offset == "undefined" || isNaN(offset)) {
			offset = 0;
		}

		var dY = (pYmd + "").substring(0, 4);
		var dM = (pYmd + "").substring(4, 6);
		var dD = (pYmd + "").substring(6, 8);
		var dTime = (pYmd + "").substring(8);
		dM = (dM * 1) + (offset * 1);
		if (dM > 0) {
			dY = (dY * 1) + Math.floor(dM / 12);
			dM = dM % 12;
		} else {
			dY = (dY * 1) - Math.floor((dM * -1 + 12) / 12);
			dM = dM % 12 + 12;
		}
		if (Number(dD) >= 30) {
			var chkMonth1 = [ 2 ];
			var chkMonth2 = [ 4, 6, 9, 11 ];

			if (chkMonth1.indexOf(dM) > -1) {
				if (comf.isLeafYear(dY + "01" + "01")) {
					dD = "29";
				} else {
					dD = "28";
				}
			} else if (chkMonth2.indexOf(dM) > -1) {
				if (Number(dD) > 30) {
					dD = "30";
				}
			}
		}
		var cDate = new Date(dY, dM - 1, dD);
		var cYear = cDate.getFullYear();
		var cMonth = cDate.getMonth() + 1;
		if ((cMonth + "").length < 2) {
			cMonth = "0" + cMonth;
		}
		var cDay = cDate.getDate();
		if ((cDay + "").length < 2) {
			cDay = "0" + cDay;
		}
		date = cYear + "" + cMonth + "" + cDay + "" + dTime;
		return date;
	} catch (ex) {
		console.error(ex);
	}
};


/**
 * 서버 시간을 기준으로 날짜를 반환한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String:N} sDateFormat 날짜 포맷<br/>
 * y Year 1996; 96<br/>
 * M Month in year 07<br/>
 * d Day in month 10<br/>
 * H Hour in day (0-23) 0<br/>
 * m Minute in hour 30<br/>
 * s Second in minute 55<br/>
 * S Millisecond 978<br/>
 * @return  String 현재날짜
 * @example
com.date.getServerDateTime("yyyy-MM-dd HH:mm:ss SSS");
com.date.getServerDateTime("yyyy-MM-dd");
com.date.getServerDateTime();
 */
com.date.getServerDateTime = function (sDateFormat) {
	if (com.util.isEmpty(sDateFormat)) {
		sDateFormat = "yyyyMMdd";
	}

	return WebSquare.date.getCurrentServerDate(sDateFormat);
};


/**
 * 문자열에 날짜 Formatter를 적용하여 반환한다.
 *
 * @param {String} str 포멧터를 적용할 파라메터 (String 또는 Number 타입 지원)
 * @param {String} type 적용할 포멧터 형식 Default:null,slash,date
 * @memberOf com.date
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 문자열
 * @example
com.date.formatDate(20120319, "slash");
// return 예시) 12/03/19

com.date.formatDate(20120319, "date");
// return 예시) 2012/03/19

com.date.formatDate(20120319, "colon");
// return 예시) 2012:03:19

com.date.formatDate(20120319);
// return 예시) 2012년 03월 19일
 */
com.date.formatDate = function (str, type) {
	var output = "";
	var date = new String(str);

	if (type == "slash") {
		date = date.substring(2, date.length);
		for (var i = 0; i <= date.length - 1; i++) {
			output = output + date[i];
			if ((i + 1) % 2 == 0 && (date.length - 1) !== i)
				output = output + "/";
		}
	} else if (type == "date") {
		if (date.length == 8) {
			output = date.substr(0, 4) + "/" + date.substr(4, 2) + "/" + date.substr(6, 2);
		}
	} else if (type == "colon") {
		if (date.length == 8) {
			output = date.substr(0, 4) + ":" + date.substr(4, 2) + ":" + date.substr(6, 2);
		}
	} else {
		var year = date.substr(0, 4);
		var month = date.substr(4, 2);
		var day = date.substr(6, 2);
		var output = year + "년 " + month + "월 " + day + "일";
	}
	return output;
};


/**
 * 입력된 값에 시간 Fomatter 적용하여 반환한다.
 *
 * @param {String} value 시간 Formatter를 적용한 값 (String 또는 Number 타입 지원)
 * @memberOf com.date
 * @date 2019.11.16
 * @author 박상규
 * @return {String} 포멧터가 적용된 문자열
 * @example
com.date.formatTime("123402");
// return 예시) "12:34:02"
 */
com.date.formatTime = function (value) {
	var hour = String(value).substr(0, 2);
	var minute = String(value).substr(2, 2);
	var second = String(value).substr(4, 2);
	var output = hour + ":" + minute + ":" + second;

	return output;
};


/**
 * 날짜 객체에 포매팅을 적용하여 반환한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {Date} 포맷팅을 적용할 날짜 객체
 * @param {String:N} sDateFormat 날짜 포맷<br/>
 * y Year 1996; 96<br/>
 * M Month in year 07<br/>
 * d Day in month 10<br/>
 * H Hour in day (0-23) 0<br/>
 * m Minute in hour 30<br/>
 * s Second in minute 55<br/>
 * S Millisecond 978<br/>
 * @return {String} 현재날짜
 * @example
com.date.formatDateTime(new Date());  // "20190822"
com.date.formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss SSS");  // "2019-08-22 15:55:35 705"
 */
com.date.formatDateTime = function (value, sDateFormat) {
	if (com.util.isEmpty(sDateFormat)) {
		sDateFormat = "yyyyMMdd";
	}

	return WebSquare.date.getFormattedDate(value, sDateFormat);
};


/**
 * 입력된 값이 Date 형식의 값인지 확인한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String|number} sDate 날짜 문자열 (yyyyMMdd or yyyyMMddHHmmss)
 * @param {Boolean} timeChk 시간체크. (true/false)
 * @return {Boolean} Date 형식에 일치하면 true, 아니면 false
 * @author 박상규
 * @example
com.date.isDate("20170819"); // return true
 */
com.date.isDate = function(sDate,timeChk) {
	var flag = true;
	try {
		if (sDate.length == 8) {
			sDate = sDate + "000000";
		}
		var y1 = parseInt(sDate.substring(0, 4), 10);
		var m1 = parseInt(sDate.substring(4, 6), 10);
		var d1 = parseInt(sDate.substring(6, 8), 10);
		var h1 = parseInt(sDate.substring(8, 10), 10);
		var t1 = parseInt(sDate.substring(10, 12), 10);
		var s1 = parseInt(sDate.substring(12), 10);
		if (isNaN(y1) || isNaN(m1) || isNaN(d1) || isNaN(h1) || isNaN(t1)
				|| isNaN(s1))
			flag = false;

		if (m1 < 1 || m1 > 12)
			flag = false;

		var maxDay = 31;
		if (m1 == 2) {
			maxDay = ((y1 % 400 == 0) || ((y1 % 4 == 0) && (y1 % 100 != 0))) ? 29
					: 28;
		} else if (m1 == 4 || m1 == 6 || m1 == 9 || m1 == 11) {
			maxDay = 30;
		}
		if (d1 < 1 || d1 > maxDay) {
			flag = false;
		}
		if (h1 + t1 + s1 != "") {
			if (h1 < 0 || h1 > 24) {
				flag = false;
			} else if (h1 == 24) {
				if(typeof timeChk == "boolean" && !timeChk)
					flag = false;
				if (t1 > 0)
					flag = false;
				if (s1 > 0)
					flag = false;
			}
			if (t1 < 0 || t1 > 59)
				flag = false;
			if (s1 < 0 || s1 > 59)
				flag = false;
		}
	} catch (e) {
		console.error(ex);
		flag = false;
	}
	return flag;
};


/**
 * 시작일자, 종료일자를 입력받아 두 날짜의 차이를 반환한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} fromDate 시작일자 (date형식은 yyyyMMdd or yyyyMMddHHmmss)
 * @param {String} toDate 종료일자 (date형식은 yyyyMMdd or yyyyMMddHHmmss)
 * @return {Number} 종료일자에서 시작일자의 날짜 차이 수.
 * @author 박상규
 * @example
com.date.diffDate("20170821", "20180621"); // 304
 */
com.date.diffDate = function(fromDate, toDate) {
	try {
		if (!com.date.isDate(fromDate) || !com.date.isDate(toDate)) {
			return;
		}
		var diffDate = WebSquare.date.dateDiff(fromDate, toDate);
		return diffDate;
	} catch (e) {
		console.error(ex);
	}
};


/**
 * 입력된 양력의 날짜가 윤년인지 검사한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} pYmd :: I :: Y ::  :: 윤달 확인 날짜.
 * @return {boolean} 윤달 유무( true : 윤달)
 * @author 박상규
 * @example
com.date.isLeafYear("20201212");  // return true
 */
com.date.isLeafYear = function(pYmd) {
	try{
		var isLeafYear = false;
		if (!com.date.isDate(pYmd)) {
			return;
		} else {
			pYmd = pYmd.substr(0, 8);
			var y1 = parseInt( pYmd.substr(0, 4), 10);
			isLeafYear = ((y1 % 400 == 0 ) || ((y1 % 4 == 0) && (y1 % 100 != 0))) ? true : false;
		}
		return isLeafYear;
	} catch (e) {
		console.log("[comf.isLeafYear]:" + e);
	}
};


/**
 * 특정 날짜의 요일을 반환한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} value "yyyyMMdd" 포맷 형태의 날짜를 나타내는 문자열 ("20190801")
 * @param {String} type 반환형식 기본값은 날짜를 한글로 반환 , num 인경우 숫자로 반환 일요일 : 1 ~ 토요일 : 7
 * @return {String} 요일
 * @example
com.date.getDay("20190822");  // "목요일"
com.date.getDay("20190824");  // "토요일"
com.date.getDay("20191010","num");  // "5"
 */
com.date.getDay = function (value,type) {
	var dayVal;
	if (type == "num") {
		var dayVal = WebSquare.date._getDay(value);
		if (dayVal == 0 ) {
			return "7";
		}else{
			return String(dayVal);
		}
	} else {
		return WebSquare.date.getDay(value);
	}
};

/**
 * 특정 날짜의 음력 날짜를 반환한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} "yyyyMMdd" 포맷 형태의 날짜를 나타내는 문자열
 * @return {String} 음력 날짜
 * @example
com.date.getLunar("20190824");  // "20190724"
 */
com.date.getLunar = function (value) {
	return  WebSquare.date.toLunar(value);
};


/**
 * 해당 월의 마지막 날짜를 반환한다.
 *
 * @memberOf com.date
 * @date 2019.11.16
 * @param {String} yearMonth 년월 문자열 (yyyyMM)
 * @return 마지막 날짜
 * @author 박상규
 * @example
com.date.getLastDateOfMonth("201510");  // 31
 */
com.date.getLastDateOfMonth = function(yearMonth) {
	try {
		if (typeof yearMonth !== "string") {
			yearMonth = com.str.serialize(yearMonth);
		}

		var year = yearMonth.substring(0, 4);
		var month = yearMonth.substring(4, 6);

		return (new Date(year, month, 0)).getDate();
	} catch(ex) {
		console.error(ex);
		return null;
	}
};

// =============================================================================
/**
 * 외부 솔루션 연동(Namo, Toast UI Editor 등) 관련 함수를 작성한다.
 *
 * @author 박상규
 * @class ext
 * @namespace com.ext
 */
 // =============================================================================

com.ext = {}

/**
 * Toast Editor를 생성한다.
 *
 * @memberOf com.ext
 * @date 2019.11.16
 * @param {Object} targetObj Toast UI Editor를 생성할 Target 객체
 * @param {String} type Toast UI Editor 생성 타입("editor", "viewer");
 * @param {Object} option Toast UI Editor 생성 옵션 (자세한 옵션은 https://nhn.github.io/tui.editor/api/latest/ToastUIEditor.html 참조)
 * @return {Object} Toast UI Editor 객체
 * @example
// Toast UI Editor를 생성 예제 코드
var option = {
	initialEditType : "markdown",
	previewStyle : "vertical",
	height : "600px",
	initialValue : dma_content1.get("memo"),
	policy : "template"	// 업로드 이미지 저장 정책
};

scwin.editor1 = com.ext.createEditor(tbx_editor1, "editor", option);

// Toast UI Viewer를 생성 예제 코드
var memoValue = dma_content1.get("memo");

var option = {
	height : "600px",
	initialValue : memoValue
};

scwin.viewer1 = com.ext.createEditor(tbx_viewer1, "viewer", option);
 */
com.ext.createEditor = function(targetObj, type, option) {
	var editor = null;

	option.el = document.querySelector("#" + targetObj.getID());

	// tui editor video plugin 2019.12.05
	function renderVideo(wrapperId, videoSrc) {
		const el = document.querySelector('#'+wrapperId);
		el.innerHTML = '<video class="tui-videosize" controls loop name="media"><source src="'+videoSrc+'" type="video/mp4">HTML5 video를 지원해야하며, video/mp4 형식만 가능합니다.</video>';
	}

	tui.Editor.defineExtension('video', function(){
		tui.Editor.codeBlockManager.setReplacer('video', function(videoSrc){
			const wrapperId = 'video'+Math.random().toString(36).substr(2, 10);
			setTimeout(renderVideo.bind(null, wrapperId, videoSrc), 0);
			return '<div id="'+wrapperId+'"></div>';
		});
	});


	if (type === "viewer") {
		option.viewer = true;
		//option.exts = ["chart", "uml", "colorSyntax"]; // uml 기능을 사용하기 위해서는 PlantUML(http://plantuml.com) 모듈을 서버에 설치해야 함
		option.exts = ["chart", "colorSyntax", "video"];   // 2019.12.05 vide extension 추가
		option.linkAttribute = { target: "_blank" };
		editor = new tui.Editor.factory(option);
	} else {

		//option.exts = ["chart", "uml", "colorSyntax", "scrollSync"];
		option.exts = ["chart", "colorSyntax", "scrollSync", "video"]; // 2019.12.05 vide extension 추가
		option.linkAttribute = { target: "_blank" };
		option.hooks = {
			"addImageBlobHook" : function(blob, callback) {
				var formData = new FormData();
				formData.append("FileData", blob, "image.png");

				// 파일 업로드 정책 설정
				if(option.hasOwnProperty("policy")) {
					formData.append("policy", option.policy);
				}

				$.ajax({
					url : gcm.CONTEXT_PATH + gcm.EDITOR_IMAGE_UPLOAD_URL,	// 이미지 파일 업로드 서비스 URL
					data : formData,
					processData : false,
					contentType : false,
					type : 'POST',
					success : function(data) {
						callback(data.SERVER_RESULT.imageUrl);
					},
					error : function(request, status, error) {
						com.win.alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
					}
				});
			}
		};

		editor = new tui.Editor(option);
	}

	return editor;
};

/**
 * Push 서버에 접속한다.
 *
 * @memberOf com.ext
 * @date 2019.11.16
 * @param {String} ip Push 서버 아이피
 * @param {String} port Push 서버 포트
 * @param {Function} callBackFunc 콜백 함수
 * @example
 */
com.ext.connectPushServer = function(ip, port, callBackFunc) {
	try {
		if (com.util.isEmpty(ip)) {
			console.error("ip가 전달되지 않았습니다.");
			return;
		}

		if (com.util.isEmpty(port)) {
			console.error("port가 전달되지 않았습니다.");
			return;
		}

		if (typeof callBackFunc !== "function") {
			console.error("Push 메시지를 수신할 콜백함수 객체가 전달되지 않았습니다.");
			return;
		}

		if (com.util.isEmpty(gcm.ebWebSocket)) {
			gcm.ebWebSocket = new EventBrokerWebsocket();
		}
		// --- begin : wss
		var socketProtocol = "ws://";
		console.log('protocol : '+document.location.protocol);
		if (document.location.protocol == "https:"){
			socketProtocol = "wss://";
			console.log('wss connect.');
		} else {
			console.log('ws connect.');
		}
		// --- end : wss
		var isSupported = gcm.ebWebSocket.checkWebSocketSupport();
		if (isSupported) {
			//gcm.ebWebSocket.setWebSocketUrl("ws://" + ip + ":" + port);
			gcm.ebWebSocket.setWebSocketUrl(socketProtocol + ip + ":" + port); // change protocol
			gcm.ebWebSocket.initWebSocket(function(data) {
				callBackFunc(data);
			});
		} else {
			console.error("Push 서비스를 이용할 수 없는 브라우저입니다.");
		}
	} catch(ex) {
		console.error(ex);
	}
};

/**
 * Push 서버에 새로운 이벤트를 등록한다.
 *
 * @memberOf com.ext
 * @date 2019.11.16
 * @param {String} eventKey 이벤트 키
 * @param {String} gubunKey 구분 키
 * @example
 */
com.ext.addPushEventBrocker = function(eventKey, gubunKey) {
	try {
		if (com.util.isEmpty(gcm.ebWebSocket)) {
			console.error("Push 서비스 접속 객체가 생성되지 않았습니다. com.ext.connectPushServer 호출 후에 사용하시기 바랍니다.");
		}

		if (com.util.isEmpty(eventKey)) {
			console.error("EventBroker Event Key가 전달되지 않았습니다.");
			return;
		}

		if (com.util.isEmpty(gubunKey)) {
			console.error("EventBroker Gubun Key가 전달되지 않았습니다.");
			return;
		}

		gcm.ebWebSocket.erbAddRegister(gubunKey, eventKey);
	} catch(ex) {
		console.error(ex);
	}
};

/**
 * Push 서버에 등록된 이벤트를 삭제한다.
 *
 * @memberOf com.ext
 * @date 2019.11.16
 * @param {String} eventKey 이벤트 키
 * @param {String} gubunKey 구분 키
 * @example
 */
com.ext.deletePushEventBroker = function(eventKey, gubunKey) {
	try {
		if (com.util.isEmpty(gcm.ebWebSocket)) {
			console.error("Push 서비스 접속 객체가 생성되지 않았습니다. com.ext.connectPushServer 호출 후에 사용하시기 바랍니다.");
		}

		if (com.util.isEmpty(eventKey)) {
			console.error("EventBroker Event Key가 전달되지 않았습니다.");
			return;
		}

		if (com.util.isEmpty(gubunKey)) {
			console.error("EventBroker Gubun Key가 전달되지 않았습니다.");
			return;
		}

		gcm.ebWebSocket.erbAddRegister(gubunKey, eventKey);
	} catch(ex) {
		console.error(ex);
	}
};

/**
 * Push 서버에 등록된 모든 이벤트를 삭제한다.
 *
 * @memberOf com.ext
 * @date 2019.11.16
 * @example
 */
com.ext.deleteAllPushEventBroker = function() {
	try {
		if (com.util.isEmpty(gcm.ebWebSocket)) {
			console.error("Push 서비스 접속 객체가 생성되지 않았습니다. com.ext.connectPushServer 호출 후에 사용하시기 바랍니다.");
		}

		gcm.ebWebSocket.erbRemoveAllRegister();
	} catch(ex) {
		console.error(ex);
	}
};

/**
 * Push 서버 접속을 종료한다.
 *
 * @memberOf com.ext
 * @date 2019.11.16
 * @example
 */
com.ext.closePushServer = function() {
	try {
		gcm.ebWebSocket.closeConnection();
	} catch(ex) {
		console.error(ex);
	}
};

// =============================================================================
/**
 * 디버그용 개발자도구 Console 로그 출력 관련 함수를 작성한다.
 *
 * @author 박상규
 * @class console
 * @namespace console
 */
 // =============================================================================

//웹스퀘어 엔진이 디버그 모드일 경우 Exception Exception을 console.error 함수를 보여주도록 설정함
if (WebSquare.logger.debug) {
	WebSquare.exception.printStackTrace = function(e, source, elemObj) {
		["WebSquare.exception.printStackTrace"];
		if (typeof elemObj !== "undefined") {
			var srcPath = "";
			if ( com.util.isEmpty(gcm.win._getScope(elemObj).$p.getFrame()) === false && com.util.isEmpty(gcm.win._getScope(elemObj).$p.getFrame().getSrc()) === false) {
				srcPath = gcm.win._getScope(elemObj).$p.getFrame().getSrc();
			} else if (com.util.isEmpty(gcm.win._getScope(elemObj).$p.getParameter("w2xPath")) === false) {
				srcPath = gcm.win._getScope(elemObj).$p.getParameter("w2xPath");
			}

			if (com.util.isEmpty(srcPath) === false) {
				console.error("Source File Path : " + srcPath);
			}

			console.error(e.message, e.stack);
		} else {
			console.error(e.message, e.stack.slice(0, 2));
		}
	}
} else {
	// 운영 모드일 때 console 출력을 할 수 있도록 하기 위해서 window._console 객체에 기존 window.console내 함수를 복사한다.
	window._console = {};
	window._console.log = console.log;
	window._console.info = console.info;
	window._console.trace = console.trace;
	window._console.error = console.error;
	window._console.warn = console.warn;
	window._console.debug = console.debug;
	window._console.dir = console.dir;
	window._console.table = console.table;
	window._console.count = console.count;
	window._console.time = console.time;
	window._console.timeEnd = console.timeEnd;
}

/**
 * 일반 메시지를 웹 브라우저 콘솔에 출력한다.
 *
 * 추가 매개변수와 함께 문자열 치환을 사용할 수 있다.
 *
 * @param {Object} 출력할 메시지 문자열 또는 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
var user = { name : "홍길동", tel : "010-2344-2323" };
console.log(user);

var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.log(userList);

console.log("사용자 등록이 완료되었습니다.");
console.log("%s님의 %d번째 등록이 완료되었습니다", "홍길동", 5);
 */
console.log = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.log, console);
		// return Function.prototype.bind.call(console.debug, console, "[LOG] :");
	} else {
		return new Function();
	}
})();


/**
 * 정보 메시지를 웹 브라우저 콘솔에 출력한다.
 *
 * 추가 매개변수와 함께 문자열 치환을 사용할 수 있다.
 *
 * @param {Object} 출력할 메시지 문자열 또는 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
var user = { name : "홍길동", tel : "010-2344-2323" };
console.info(user);

var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.info(userList);

console.info("사용자 등록이 완료되었습니다.");
console.info("%s님의 %d번째 등록이 완료되었습니다", "홍길동", 5);
 */
console.info = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.info, console);
	} else {
		return new Function();
	}
})();


/**
 * 스택 출력을 웹 브라우저 콘솔에 출력한다.
 *
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
console.trace();
 */
console.trace = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.trace, console);
	} else {
		return new Function();
	}
})();


/**
 * 정보 메시지를 웹 브라우저 콘솔에 출력한다.
 *
 * 추가 매개변수와 함께 문자열 치환을 사용할 수 있다.
 *
 * @param {Object} 출력할 메시지 문자열 또는 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
var user = { name : "홍길동", tel : "010-2344-2323" };
console.error(user);

var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.error(userList);

console.error("사용자 등록에 실패 했습니다.");
console.error("%s님의 %d번째 등록에 실패 했습니다.", "홍길동", 5);

try {
	var idx = idx2;
} catch(ex) {
	console.error(ex);
}
 */
console.error = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.error, console);
	} else {
		return new Function();
	}
})();


/**
 * 경고 메시지를 웹 브라우저 콘솔에 출력한다.
 *
 * 추가 매개변수와 함께 문자열 치환을 사용할 수 있다.
 *
 * @param {Object} 출력할 메시지 문자열 또는 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
var user = { name : "홍길동", tel : "010-2344-2323" };
console.warn(user);

var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.warn(userList);

console.warn("사용자 등록이 완료되었습니다.");
console.warn("%s님의 %d번째 등록이 완료되었습니다", "홍길동", 5);
 */
console.warn = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.warn, console);
	} else {
		return new Function();
	}
})();


/**
 * 디버그용 메시지를 웹 브라우저 콘솔에 출력한다.
 *
 * 추가 매개변수와 함께 문자열 치환을 사용할 수 있다.
 *
 * @param {Object} 출력할 메시지 문자열 또는 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
var user = { name : "홍길동", tel : "010-2344-2323" };
console.debug(user);

var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.debug(userList);

console.debug("사용자 등록이 완료되었습니다.");
console.debug("%s님의 %d번째 등록이 완료되었습니다", "홍길동", 5);
 */
console.debug = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.debug, console);
	} else {
		return new Function();
	}
})();


/**
 * 인자로 전달된 객체를 덤프해서 보기 쉽게 표시한다.
 *
 * JSON이나 Array를 Console창에 출력 시에 적합함
 *
 * @param {Object} Console에 출력할 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 콘솔 로그 출력
 * @example
var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.dir(userList);
 */
console.dir = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.dir, console);
	} else {
		return new Function();
	}
})();


/**
 * 인자로 전달된 객체를 테이블 형식으로 표시한다.
 *
 * IE에서는 console.log 함수와 동일하게 동작함. (IE에서는 console.table() 미지원)
 *
 * JSON이나 Array를 Console창에 출력 시에 적합함.
 *
 * @param {Object} Console에 출력할 객체
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @return {Object} 콘솔 로그 출력
 * @example
var userList = [
	{ name : "홍길동", tel : "010-2344-2323" },
	{ name : "김용수", tel : "010-2112-7562" },
	{ name : "박찬용", tel : "010-4241-2322" }
];
console.table(userList);
 */
if (gcm.util._getUserAgent() !== "msie") {
	console.table = (function() {
		if (WebSquare.logger.debug) {
			return Function.prototype.bind.call(console.table, console);
		} else {
			return new Function();
		}
	})();
} else {
	console.table = (function() {
		if (WebSquare.logger.debug) {
			return Function.prototype.bind.call(console.log, console);
		} else {
			return new Function();
		}
	})();
}


/**
 * 특정 행이 몇 번 실행되었는지 확인하기 위해서 사용한다.
 *
 * @param {String} 카운터 레이블 (행의 카운터 체크를 위한 레이블)
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @example
for (var idx = 0; idx < 100; idx++) {
	console.count("Level1");
	if (idx % 5 === 0) {
		console.count("Level2");
	}
}
 */
console.count = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.count, console);
	} else {
		return new Function();
	}
})();


/**
 * 콘솔 창에 시간 측정을 시작한다. (밀리초 단위로 표시됨)
 *
 * @param {String} 시간 측정 아이디 (console.timeEnd 실행 시 console.time 아이디와 동일해야 함)
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @return {Date} 시간 출력
 * @example
console.time("Check-1");
for (var i = 0; i < 1000000; i++) { }
console.timeEnd("Check-1");
 */
console.time = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.time, console);
	} else {
		return new Function();
	}
})();


/**
 * 콘솔 창에 시간 측정을 종료한다. (밀리초 단위로 표시됨)
 *
 * @param {String} 시간 측정 아이디 (console.timeEnd 실행 시 console.time 아이디와 동일해야 함)
 * @memberOf console
 * @date 2019.11.16
 * @author 박상규
 * @return {Time} 시간 출력
 * @example
console.time("Check-1");
for (var i = 0; i < 1000000; i++) { }
console.timeEnd("Check-1");
 */
console.timeEnd = (function() {
	if (WebSquare.logger.debug) {
		return Function.prototype.bind.call(console.timeEnd, console);
	} else {
		return new Function();
	}
})();
