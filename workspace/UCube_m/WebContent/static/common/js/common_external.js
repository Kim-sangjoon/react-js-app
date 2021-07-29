// =============================================================================
/**
 * 웹스퀘어 엔진이 로딩되지 않은 상태에서 필요한 공통 함수를 작성한다.
 *
 * @author 박상규
 * @class ecm
 * @namespace ecm
 * @description
- ecm 객체에 정의된 함수는 업무 화면에서는 사용해서는 안된다.
- UI 공통 내에서만 제한적으로 사용되어야 한다.
 */
// =============================================================================
var ecm = {};

/**
 * GET 방식으로 전달한 파라미터를 읽어 온다.
 *
 * @memberOf ecm
 * @date 2019.11.16
 * @param {String} 파라미터 키
 * @author 박상규
 * @return {Object} 파라미터 값
 * @example
var codeValue = ecm._getParameter("code");  // 특정 파라미터 값을 얻어오기
 */
ecm._getParameter = function(param) {
    var url = unescape(location.href);
    var paramArr = (url.substring(url.indexOf("?")+1,url.length)).split("&");
    var value = "";

    for(var i = 0 ; i < paramArr.length ; i++) {
        var temp = paramArr[i].split("=");

        if(temp[0].toUpperCase() == param.toUpperCase()) {
            value = paramArr[i].split("=")[1];
            break;
        }
    }

    return value;
};

/**
 * Toast UI Editor CSS, JS 파일을 로딩한다.
 *
 * @example
ecm._loadToastUIEditor();
 */
ecm._loadToastUIEditor = function() {
    var cssList = ["../../../external/tui.editor-1.4.6/css/codemirror.css",
        "../../../external/tui.editor-1.4.6/css/github.min.css",
        "../../../external/tui.editor-1.4.6/css/tui-editor.min.css",
        "../../../external/tui.editor-1.4.6/css/tui-editor-modify.css",
        "../../../external/tui.editor-1.4.6/css/tui-editor-contents.min.css",
        "../../../external/tui.editor-1.4.6/css/tui-editor-contents-modify.css"];

    for (var idx in cssList) {
        var cssLink = document.createElement("link");
        cssLink.setAttribute("rel", "stylesheet");
        cssLink.setAttribute("type", "text/css");
        cssLink.setAttribute("href", cssList[idx]);
        document.getElementsByTagName('head')[0].appendChild(cssLink);
    }

    var scriptLink1 = document.createElement("script");
    scriptLink1.setAttribute("type", "text/javascript");
    scriptLink1.setAttribute("src", "../../../external/tui.editor-1.4.6/js/tui-editor-Editor-full.min.js");
    document.getElementsByTagName('head')[0].appendChild(scriptLink1);
};

/**
 * index.html에서 meta데이터의 콘텐츠 정보를 가져온다
 *
 * @memberOf ecm
 * @date 2019.11.16
 * @param {String} 파라미터 키
 * @author 김응한
 * @return {Object} 메타 값
 * @example
var workLayout = ecm._getMeta("workLayout");  // 특정 메타데이터 값을 얻어오기
 */
ecm._getMeta = function(metaName) {
      var metas = document.getElementsByTagName('meta');

      for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
          return metas[i].getAttribute('content');
        }
      }
      return '';
};

ecm._loadToastUIEditor();