// =============================================================================
/**
 * 개발표준화토털(dssp)에서 사용되는 업무공통 라이브러리를 정의한다.
 *
 * @author 박상규
 * @class dssp
 * @namespace dssp
 * @description
- dssp 객체에 정의된 함수는 개발표준화포털 프로젝트(dssp)에서 사용하기 위해서 정의된 업무에 특화된 업무공통 라이브러리입니다.
 */
// =============================================================================

// 키워드 검색 URL
dssp.KEYWORD_SEARCH_URL = "/sch/SearchWisenut/v1/retrieveArkList/";

/**
 * 검색엔진 연동을 위한 통신 모듈을 생성한다.
 *
 * @memberOf dssp
 * @date 2019.11.16
 * @author 박상규
 * @example
dssp.createKeywordSearch();
 */
dssp.createKeywordSearch = function() {
    var dsOption = {
        baseNode : "list",
        repeatNode : "map",
        saveRemovedData : "true"
    };
    com.data.createDataList("dlt_searchResult", ["keyword"], ["text"] , dsOption);

    var option = {
        id : "sbm_searchEngine",
        method : "get",
        submitDoneHandler : function (e) {
            dlt_searchResult.setBroadcast(false);
            var schResult = com.util.getJSON(e.responseJSON.SERVER_RESULT.schResult);
            var resultItem = schResult.result[0].items;
            if (!com.util.isEmpty(resultItem)) {
                resultItem.concat(schResult.result[1].items);
                dlt_searchResult.setJSON(resultItem);
                dlt_searchResult.setBroadcast(true);
                acb_search.setItemSet("data:dlt_searchResult" ,"keyword" , "keyword");
                acb_search.openTable();
            }
        }
    };
    com.sbm.create(option);
};

/**
 * 입력된 키워드의 자동완성 기능을 위한 키워드 데이터를 조회한다.
 *
 * @memberOf dssp
 * @date 2019.11.16
 * @param {String} keyword 입력된 키워드
 * @param {String} keyCode 입력된 키 값
 * @author 박상규
 * @example
dssp.searchKeyword(keyword, keyCode);
 */
dssp.searchKeyword = function(keyword, keyCode) {
    if (com.util.isEmpty(keyword) === false) {
//      sbm_searchEngine.action = gcm.CONTEXT_PATH + "/web/com/layout/searchTestResult.json",
        if (gcm.util._getUserAgent() =="msie") {
            keyword = encodeURIComponent(keyword);
        }
        sbm_searchEngine.action = gcm.CONTEXT_PATH + dssp.KEYWORD_SEARCH_URL + keyword + "/common/fw/json";
        sbm_searchEngine.defultSubmissionAction = sbm_searchEngine.action;
        com.sbm.execute(sbm_searchEngine);
    }
};