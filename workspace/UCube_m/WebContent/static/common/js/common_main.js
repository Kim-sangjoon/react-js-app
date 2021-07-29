/**
 * 메인 레이아웃 초기화 세팅을 수행한다.
 */
scwin.initialize = function() {
    if ( gcm.util._getUserAgent() != "Chrome") {
        var alertMsg = com.data.getMessage("com.alt.0016","크롬") || "권장 브라우저는 크롬입니다";
        com.win.alert(alertMsg);
    }

    // window.layout 값은 현재 index.html에서 최초 세팅한다.
    if (com.util.isEmpty(window.workLayoutType) === false) {
        gcm.WORK_LAYOUT_TYPE = window.workLayoutType;
    } else {
        gcm.WORK_LAYOUT_TYPE = "MDI";
    }
    if (com.util.isEmpty(window.mainLayout) === false) {
        gcm.MAIN_LAYOUT = window.mainLayout;
    }


    var menuId = com.data.getParameter("menuId");
    var w2xPath = com.data.getParameter("w2xPath");
    if (com.util.isEmpty(menuId)&& com.util.isEmpty(menuId)) {
        scwin.openMainLayout(true);
    }else{
        scwin.hideMainLayOut();
    }

};

/**
 * 메뉴 데이터를 로딩해서 DataList(dlt_menu)에 저장한다.
 */
scwin.loadMenu = function(parentMenuId ,drawTopMenu,isAppend) {

    var option = {
        id : "sbm_menu",
        action : gcm.CONTEXT_PATH + "/auth/authCache/v1/retrieveCacheMenu/" + parentMenuId,
        method : "get",
        isShowMeg : true,
        submitDoneHandler : function(res) {
            scwin.loadMenuCallBack(res,parentMenuId ,drawTopMenu,isAppend)
        },
    };
    com.sbm.executeDynamic(option);
};

scwin.loadMenuCallBack = function(res, parentMenuId ,drawTopMenu,isAppend){
    var dltMenu = com.util.getComponent("dlt_menu");
    if(com.util.isEmpty(dltMenu)){
        var option = {
                "id" : "dlt_menu",
                "type" : "dataList",
                "option" : {
                    "baseNode": "list",
                    "repeatNode": "map"
                },
                "columnInfo" : [
                    { "id" : "menuId", "name": "메뉴코드", "dataType" :"text" },
                    { "id" : "programId", "name": "프로그램아이디", "dataType" :"text" },
                    { "id" : "menuNm", "name": "메뉴명", "dataType" :"text" },
                    { "id" : "parentMenuId", "name": "부모메뉴코드", "dataType" :"text" },
                    { "id" : "srcPath", "name": "소스경로", "dataType" :"text" },
                    { "id" : "menuLevel", "name": "메뉴레벨", "dataType" :"number" },
                    { "id" : "location", "name": "위치", "dataType" :"text" },
                    { "id" : "indexPath", "name": "인덱스경로", "dataType" :"text" },
                    { "id" : "popuScrnYn", "name": "메뉴구분자", "dataType" :"text" }
                    ]
        };

        $p.data.create(option);
    }

    var ldkMenu = com.util.getComponent("ldk_menu");
    if(com.util.isEmpty(ldkMenu)){
        var option = {
                "id" : "ldk_menu",
                "type" : "linkedDataList",
                "option" : {
                    "bind": "dlt_menu"
                },
                "columnInfo" : [
                    { "id" : "menuId", "name": "메뉴코드", "dataType" :"text" },
                    { "id" : "programId", "name": "프로그램아이디", "dataType" :"text" },
                    { "id" : "menuNm", "name": "메뉴명", "dataType" :"text" },
                    { "id" : "parentMenuId", "name": "부모메뉴코드", "dataType" :"text" },
                    { "id" : "srcPath", "name": "소스경로", "dataType" :"text" },
                    { "id" : "menuLevel", "name": "메뉴레벨", "dataType" :"number" },
                    { "id" : "location", "name": "위치", "dataType" :"text" },
                    { "id" : "indexPath", "name": "인덱스경로", "dataType" :"text" },
                    { "id" : "popuScrnYn", "name": "메뉴 구분자", "dataType" :"text" }
                    ]
        };

        $p.data.create(option);
    }

    dlt_menu.setJSON(res.responseJSON.SERVER_RESULT, isAppend);
    scwin.createMenu(parentMenuId ,drawTopMenu);
    scwin.setAccordionNav(true);


    if( $.isEmptyObject(com.win.getUserLoginInfo())){
        btn_myMenu.hide();
    }

    scwin.createFavObj(); //즐겨찾기 관련  객체 생성

    var menuId = com.data.getParameter("menuId");
    var w2xPath = com.data.getParameter("w2xPath");
    if (com.util.isEmpty(menuId) === false) {
        //gcm.win._menuTreeExtend(menuId);
        if( $.isEmptyObject(com.win.getUserLoginInfo())){
            $w.url("/ssoCheck/lgin");
        }
        var paramData = $w.getAllParameter();
        com.win.openMenu(menuId,paramData , {"isExtend" : true});
    } else if (com.util.isEmpty(w2xPath) === false) {
        var menuInfoArr = $p.top().dlt_menu.getMatchedJSON("srcPath", w2xPath);
        if (menuInfoArr.length > 0) {
            //gcm.win._menuTreeExtend(menuInfoArr[0].menuId);
            var paramData = $w.getAllParameter();
            com.win.openMenu(menuInfoArr[0].menuId , paramData , {"isExtend" : true} );
        } else {
            var alertMsg = com.data.getMessage("com.alt.0015") || "<b>페이지를 찾을 수 없습니다.</b> <br><br>요청하신 페이지가 존재하지 않거나 조회 권한이 없습니다.<br> 담당자에게 문의하시기 바랍니다.";
            com.win.alert(alertMsg);
            return;
        }
    }else{
        scwin.loadFav(); // 즐겨찾기 목록 조회
    }
}

/**
 * 아코디언 네비게이션 및 네비 바 동작을 세팅한다.
 */
scwin.setAccordionNav = function(isInit) {
    // 네비 바 움직임
    $('ul.menu > li').mouseover(function(e){
        var over_index = $(this);
        var move_position = $(over_index).offset().left;
        var move_width = $(over_index).width();
        $('.nav_bar').stop().animate({
            "left" : move_position,
            "width" : move_width
        }, 300);
    });

    // 네비 오버영역 제외시 네비 닫기
    $('ul.menu').mouseout(function(e){
        $('.nav_bar').stop().animate({
            "width" : "0"
        });
    });

    // Accordion menu - add class to li with child ul
    $('nav.lnb_list li').has('ul > li').addClass('hasChild');

    // Accordion menu - open/close
    $('nav.lnb_list li.hasChild.on > a').next('ul').show();
    $('nav.lnb_list li.hasChild > a').on('click', function() {
        $(this).parent().toggleClass('on');
        $(this).next('ul').slideToggle('fast');
    });

    // Accordion menu - add class to li with no child
    $('nav.lnb_list li').not(':has("ul > li")').addClass('noChild');

    // Accordion menu - add class to selected noChild li
    $('nav.lnb_list li.noChild a').on('click', function() {

    });

    // Accordion menu with badge - adjust padding right
    $('nav.lnb_listv li a').has('.badge').css('padding-right', 50);

    if(isInit){
        // LNB toggle animation
        $('.lnb_toggle').on('click', function() {
            $('.container').toggleClass('folded');
            if ($('.side').hasClass("on")) {
                scwin.btn_myMenu_onclick();
            }

        });

        $('.btn-folded').on('click',function() {
            $(this).toggleClass('fold');
            $('.support-menu').toggleClass('folded');
        });

    }
};

/**
 * 메인 메뉴 노드를 생성한다.
 */
scwin.createMenu = function(parentMenuId , drawTopMenu ) {
    var menuLevel = "1";
    var menuList = dlt_menu.getMatchedJSON("parentMenuId", parentMenuId);

    var gentopMenu = $p.getComponentById("gen_topMenu");
    var genSubMenu = $p.getComponentById("gen_menuDepth1");


    if(!com.util.isEmpty(drawTopMenu) && !com.util.isEmpty(gentopMenu)){
        gen_topMenu.removeAll();
        scwin.createTopMenu(menuList, "", "");

    }else if(!com.util.isEmpty(genSubMenu)){
        genSubMenu.removeAll();
        scwin.createSubMenu(genSubMenu.id, menuLevel, menuList, "", "");
    }

};

/**
 * 상단에 메인 메뉴 노드를 생성한다.
 */
scwin.createTopMenu = function(menuList, location, indexPath) {
    var menuCount = menuList.length;
    if(com.util.getComponent("gen_topMenuList")) {
        gen_topMenuList.removeAll();
        var genTopMenuList = gen_topMenuList;
    }


    for (var idx = 0; idx < menuCount; idx++) {
        var menu = menuList[idx];

        gen_topMenu.insert();
        var btn_topMenu = gen_topMenu.getChild(idx, "btn_topMenu");
        btn_topMenu.setUserData("menuId", menu.menuId);
        btn_topMenu.setUserData("menuNm", menu.menuNm);
        btn_topMenu.setUserData("srcPath", menu.srcPath);
        btn_topMenu.setUserData("idx", idx);
        btn_topMenu.setUserData("popuScrnYn", menu.popuScrnYn);

        var menuIdx = dlt_menu.getMatchedIndex("menuId", menu.menuId);
        if (menuIdx.length > 0) {
            menu.location = menu.menuNm;
            menu.indexPath = String(idx);
            dlt_menu.setCellData(menuIdx[0], "location", menu.location);
            dlt_menu.setCellData(menuIdx[0], "indexPath", menu.indexPath);
        }

        btn_topMenu.setValue(menu.menuNm);
        btn_topMenu.bind("onclick",
            function(e) {
                var popuScrnYn = this.getUserData("popuScrnYn");
                if(popuScrnYn != "W") {
                    scwin.hideMainLayOut();
                }
                var menuId = this.getUserData("menuId");
                var menuNm = this.getUserData("menuNm");
                var srcPath = this.getUserData("srcPath");
                var idx = this.getUserData("idx", idx);
                com.win.openMenu(menuId);
                if ($('.side').hasClass("on")) {
                    scwin.btn_myMenu_onclick();
                }
            }
        );

        if (menu.popuScrnYn =="H") {
            var btnParent = btn_topMenu.getParent();
            if(!com.util.isEmpty(btnParent)){
                btnParent.hide();
            }
        }


        if(!com.util.isEmpty(genTopMenuList)) {
            gen_topMenuList.insert();
            var btnTopMenu = gen_topMenuList.getChild( idx , "btn_topMenu" );
            btnTopMenu.setUserData("idx" ,idx);
            var grpTopMenuList = gen_topMenuList.getChild( idx , "grp_topMenuList" );
            btnTopMenu.setValue(menu.menuNm);
            if (menu.popuScrnYn =="H") {
                grpTopMenuList.hide();
            }

            btnTopMenu.bind("onclick",
                function(e) {
                    var idx = this.getUserData("idx");
                    var btnTopMenu =  gen_topMenu.getChild(idx, "btn_topMenu");
                    btnTopMenu.click();
                    var grpMenuOpenLayer = com.util.getComponent("grp_menuOpenLayer");
                    var grpMenulist = com.util.getComponent("grp_menulist");
                    if (!com.util.isEmpty(grpMenuOpenLayer)) {
                        grpMenuOpenLayer.hide();
                    }

                    if (!com.util.isEmpty(grpMenulist)) {
                        grpMenulist.removeClass("on");
                    }
            });
        }


        var genMenuDepth = $p.getComponentById("gen_menuDepth" + 1);
        subMenuList = dlt_menu.getMatchedJSON("parentMenuId", menuList[idx].menuId);
        if( subMenuList.length >0 ) {
            scwin.createSubMenu(genMenuDepth.id, 1, subMenuList, subMenuList[0].menuNm, idx);
        }
        genMenuDepth.removeAll();
    }
};


/**
 * 서브 메뉴 노드를 생성한다.
 */
scwin.createSubMenu = function(genMenuDepthId, menuLevel, menuList, location, indexPath) {
    var menuCount = menuList.length;
    var genIdx = 0;
    for (var idx = 0; idx < menuCount; idx++) {
        var menu = menuList[idx];
        if (menu.popuScrnYn =="H") {
            continue;
        }

        var genMenuDepth = $p.getComponentById(genMenuDepthId);
        genMenuDepth.insert();
        var grpMenuDepth = genMenuDepth.getChild(genIdx, "grp_menuDepth" + menuLevel);
        var tbxMenuLabel = genMenuDepth.getChild(genIdx, "tbx_menuLabel" + menuLevel);

        grpMenuDepth.setUserData("menuId", menu.menuId);
        grpMenuDepth.setUserData("menuLevel" , menuLevel);

        var menuIdx = dlt_menu.getMatchedIndex("menuId", menu.menuId);
        if (menuIdx.length > 0) {
            if (com.util.isEmpty(location)) {
                menu.location = menu.menuNm;
                menu.indexPath = String(genIdx);
            } else {
                if(!com.util.isEmpty(location)){
                    menu.location = location + " > " + menu.menuNm;
                    menu.indexPath = indexPath + "," + genIdx;
                }
            }

            dlt_menu.setCellData(menuIdx[0], "location", menu.location);
            dlt_menu.setCellData(menuIdx[0], "indexPath", menu.indexPath);
        }

        tbxMenuLabel.setLabel(menu.menuNm);
        grpMenuDepth.setUserData("lblVal" , menu.menuNm);
        grpMenuDepth.setUserData("srcPath" , menu.srcPath);
        grpMenuDepth.setUserData("popuScrnYn" , menu.popuScrnYn);
        grpMenuDepth.bind("onclick",
            function(e) {
                var srcPath = this.getUserData("srcPath");
                var popuScrnYn = this.getUserData("popuScrnYn");
                var menuId = this.getUserData("menuId");
                com.win.openMenu(menuId);
            }
        );


        grpMenuDepth.bind("onmouseover",
                function(e) {
                    var menuLevel = grpMenuDepth.getUserData("menuLevel");
                    var lblWidth;
                    if (menuLevel == "1") {
                        lblWidth = 190;
                    } else if( menuLevel == "2") {
                        lblWidth = 180;
                    } else if (menuLevel == "3") {
                        lblWidth = 180;
                    }
                    if(!com.util.isEmpty(lblWidth)) {
                        if (this.getChildren()[0].render.offsetWidth > lblWidth) {
                            var lblVal = this.getUserData("lblVal");
                            this.setTitle(lblVal);
                        }else {
                            this.setTitle("");
                        }
                    }
                }
        );



        var subMenuList = dlt_menu.getMatchedJSON("parentMenuId", menu.menuId);
        if (subMenuList.length > 0) {
            var genId = "gen_menuDepth" + (Number(menuLevel)+1)
            var genObj = genMenuDepth.getChild(genIdx , genId);
            if(!com.util.isEmpty(genObj)){
                scwin.createSubMenu(genObj.id , Number(menuLevel) +1, subMenuList, menu.location, menu.indexPath);
            }
        }

        genIdx++;
    }
};

/**
 * 메뉴 검색을 오픈한다.
 */
scwin.btn_unifiedSearch_onclick = function(e) {
    grp_msearch.addClass("on");
};

/**
 * 즐겨찾기 메뉴를 오픈한다.
 */
scwin.btn_myMenu_onclick = function() {
    $('.side').toggleClass('on');
        if($('.side').hasClass('on') === true) {
            if(!com.util.isEmpty(com.util.getComponent("ibx_searchMenu")) ){
                ibx_searchMenu.setValue("");
                grp_lnbScDoc.hide();
                grp_lnbFavInner.show();
            }
            $('.lnb_fav_list').slideDown();
    } else {
        $('.lnb_fav_list').slideUp();
    }
};




/**
 * 즐겨찾기와 최근 오픈메뉴 데이터를 로딩한다.
 */
scwin.loadFav = function() {
    try {
        var loginInfo = com.win.getUserLoginInfo();
        if(! com.util.isEmpty(loginInfo.intgUserId)) {
            if (!com.util.isEmpty(sbm_favSearch)) {
                com.sbm.execute(sbm_favSearch);
            }
        }
    } catch (ex) {
        console.error(ex);
    }
};

/**
 * 최근 오픈메뉴 데이터를 업데이트한다.
 */
scwin.updateRecMenu = function(menuId) {
    try {
        var loginInfo = com.win.getUserLoginInfo();
        if(! com.util.isEmpty(loginInfo.intgUserId)) {
            dlt_recUpdate.removeAll();
            var loginInfo = com.win.getUserLoginInfo();
            if(! com.util.isEmpty(loginInfo.intgUserId)) {
                var insertData = {
                        "intgUserId": loginInfo.intgUserId,
                        "menuId" : menuId ,
                        "userCncMenuDivsCd" : 20,
                        "pcMblCncCd" : "PC",
                        "sortOrd" : "",
                        "dataInpsId" : "SYS000",
                        "dataInptPgmId" : "system",
                        "dataMfpnId" : "SYS000",
                        "dataUpdPgmId" : "system"
                };

                dlt_recUpdate.setRowJSON(0, insertData );
                com.sbm.execute(sbm_recUpdate);
            }

        }
    } catch (ex) {
        console.error(ex);
    }
};

/**
 * 즐겨찾기와 관련 서브미션 및 데이터리스트를 생성한다.
 */
scwin.createFavObj = function() {
    try {
        var loginInfo = com.win.getUserLoginInfo();
        if(! com.util.isEmpty(loginInfo.intgUserId)) {
            var pFrame = com.win.getFrame();
            if (com.util.isEmpty(pFrame.getObj("dlt_userCncMenuDList"))) {
                var option = {
                        "id" : "dlt_userCncMenuDList",
                        "type" : "dataList",
                        "option" : {
                            "baseNode": "list",
                            "repeatNode": "map"
                        },
                        "columnInfo" : [
                            { "id" : "intgUserId", "name": "사용자아이디", "dataType" :"text" },
                            { "id" : "menuId", "name": "메뉴코드", "dataType" :"text" },
                            { "id" : "userCncMenuDivsCd", "name": "구분자", "dataType" :"text" },
                            { "id" : "pcMblCncCd", "name": "피시모바일구분", "dataType" :"text" },
                            { "id" : "sortOrd", "name": "정렬순서", "dataType" :"text" },
                            { "id" : "dataInpsId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataInptPgmId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataMfpnId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataUpdPgmId", "name": "구분자", "dataType" :"text" }
                            ]
                };
                $p.data.create(option);
            }

            if (com.util.isEmpty(pFrame.getObj("dlt_favList"))) {
                var option = {
                        "id" : "dlt_favList",
                        "type" : "dataList",
                        "option" : {
                            "baseNode": "list",
                            "repeatNode": "map"
                        },
                        "columnInfo" : [
                            { "id" : "intgUserId", "name": "사용자아이디", "dataType" :"text" },
                            { "id" : "menuId", "name": "메뉴코드", "dataType" :"text" },
                            { "id" : "userCncMenuDivsCd", "name": "구분자", "dataType" :"text" },
                            { "id" : "pcMblCncCd", "name": "피시모바일구분", "dataType" :"text" },
                            { "id" : "sortOrd", "name": "정렬순서", "dataType" :"text" },
                            { "id" : "dataInpsId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataInptPgmId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataMfpnId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataUpdPgmId", "name": "구분자", "dataType" :"text" }
                            ]
                };
                $p.data.create(option);
            }

            if (com.util.isEmpty(pFrame.getObj("dlt_recUpdate"))) {
                var option = {
                        "id" : "dlt_recUpdate",
                        "type" : "dataList",
                        "option" : {
                            "baseNode": "list",
                            "repeatNode": "map"
                        },
                        "columnInfo" : [
                            { "id" : "intgUserId", "name": "사용자아이디", "dataType" :"text" },
                            { "id" : "menuId", "name": "메뉴코드", "dataType" :"text" },
                            { "id" : "userCncMenuDivsCd", "name": "구분자", "dataType" :"text" },
                            { "id" : "pcMblCncCd", "name": "피시모바일구분", "dataType" :"text" },
                            { "id" : "sortOrd", "name": "정렬순서", "dataType" :"text" },
                            { "id" : "dataInpsId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataInptPgmId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataMfpnId", "name": "메뉴명", "dataType" :"text" },
                            { "id" : "dataUpdPgmId", "name": "구분자", "dataType" :"text" }
                            ]
                };
                $p.data.create(option);
            }

            var option = {
                    id : "sbm_favSearch",
                    // TODO :: 즐겨찾기 조회
                    action : gcm.CONTEXT_PATH + "/cmm/userCncMenuD/v1/retrieveUserCncMenuDList/" +loginInfo.intgUserId +"/null/null",
                    method : "get",
                    isShowMeg : true,
                    submitDoneHandler : function(res) {
                        dlt_userCncMenuDList.setJSON(res.responseJSON.SERVER_RESULT);
                        var favData =  dlt_userCncMenuDList.getMatchedJSON("userCncMenuDivsCd", "10");
                        var recData =  dlt_userCncMenuDList.getMatchedJSON("userCncMenuDivsCd", "20");
                        dlt_favList.setJSON(favData);

                        scwin.makeFavAndHis("fav" , favData);
                        scwin.makeFavAndHis("rec" , recData);
                        var parameMenuId  = com.data.getParameter("menuId");
                        if (parameMenuId !="") {
                            var isOn = scwin.isFavList(parameMenuId);
                            scwin.setTitleFavToggle(parameMenuId ,isOn );
                        }
                    }
            };
            com.sbm.create(option);

            var option = {
                    id : "sbm_favInsert",
                    // TODO :: 즐겨찾기 추가
                    ref : 'data:json,{"action":"inserted","id":"dlt_favList","key":"userCncMenuDList"}',
                    action : gcm.CONTEXT_PATH + "/cmm/userCncMenuD/v1/createUserCncMenuFrsc",
                    method : "post",
                    isShowMeg : true,
                    submitDoneHandler : function(res) {
                        scwin.loadFav();
                    }
            };
            com.sbm.create(option);

            var option = {
                    id : "sbm_favDelete",
                    // TODO :: 즐겨찾기  삭제
                    ref : 'data:json,{"action":"deleted","id":"dlt_userCncMenuDList","key":"userCncMenuDList"}',
                    action : gcm.CONTEXT_PATH + "/cmm/userCncMenuD/v1/deleteUserCncMenuD",
                    method : "post",
                    isShowMeg : true,
                    submitDoneHandler : function(res) {
                        scwin.loadFav();
                    }
            };
            com.sbm.create(option);

            var option = {
                    id : "sbm_recUpdate",
                    // TODO :: 최근 메뉴 추가
                    ref : 'data:json,{"id":"dlt_recUpdate","key":"userCncMenuDList"}',
                    action : gcm.CONTEXT_PATH +"/cmm/userCncMenuD/v1/createUserCncMenuRcnt",
                    method : "post",
                    isShowMeg : true,
                    submitDoneHandler : function(res) {
                        scwin.loadFav();
                    }
            };
            com.sbm.create(option);

        }

    } catch (ex) {
        console.error(ex);
    }
};



/**
 * 즐겨찾기와 최근메뉴 목록을 생성한다.
 */
scwin.makeFavAndHis = function(type, favData) {
    try {
        var genObj;
        if (type == "fav") {
            genObj = gen_favList;
        } else if (type == "rec") {
            genObj = gen_recList;
        }

        var favCnt = favData.length;
        genObj.removeAll();
        var menuId = "";
        var menuNm = "";
        var tbxMenuNm;
        var btnMenuNm;
        var btnFavUpdate;
        var genIdx = 0;

        for (var idx = 0; idx < favCnt; idx++) {
            menuId = favData[idx].menuId;//dltObj.getCellData(idx, "menuId");
            matchMenuInfo = dlt_menu.getMatchedJSON("menuId",menuId);
            if(matchMenuInfo.length>0){
                menuNm = matchMenuInfo[0].menuNm || "메뉴명 없음";
            }else{
                continue;
            }
            genObj.insertChild(genIdx);
            tbxMenuNm = genObj.getChild(genIdx, "tbx_menuNm");
            btnMenuNm = genObj.getChild(genIdx, "grp_btnMenuNm");
            btnFavUpdate = genObj.getChild(genIdx, "btn_favUpdate");

            if (type == "fav") {
                btnFavUpdate.addClass("on");
            } else if (type == "rec") {
                if (scwin.isFavList(menuId)) {
                    btnFavUpdate.addClass("on");
                }
            }

            btnMenuNm.setUserData("menuId", menuId);
            btnMenuNm.bind("onclick", function(e) {
                var menuId = this.getUserData("menuId");
                com.win.openMenu(menuId , "" , {"isExtend" : true});
            });

            btnFavUpdate.setUserData("menuId", menuId);
            btnFavUpdate.bind("onclick", function(e) {
                this.toggleClass("on");
                var isOn = this.hasClass("on");
                var menuId = this.getUserData("menuId");
                scwin.updateFavList(menuId, isOn);
            });

            tbxMenuNm.setValue(menuNm);
            genIdx++;
        }
    } catch (ex) {
        console.log(ex);
    }
};

/**
 * 즐겨찾기 목록을 추가 또는 삭제 후 재조회한다.
 */
scwin.updateFavList = function(menuId, isOn) {
    try {
        var loginInfo = com.win.getUserLoginInfo();
        if(! com.util.isEmpty(loginInfo.intgUserId)) {
            if (isOn) {
                var insertData = {
                        "intgUserId": loginInfo.intgUserId,
                        "menuId" : menuId ,
                        "userCncMenuDivsCd" : 10,
                        "pcMblCncCd" : "PC",
                        "sortOrd" : "",
                        "dataInpsId" : "SYS000",
                        "dataInptPgmId" : "system",
                        "dataMfpnId" : "SYS000",
                        "dataUpdPgmId" : "system"
                };
                dlt_favList.setRowJSON(0, insertData );
                com.sbm.execute(sbm_favInsert);
            } else {
                var matchIdxArr = dlt_favList.getMatchedIndex("menuId", menuId, true);
                if(matchIdxArr.length>0){
                    dlt_userCncMenuDList.deleteRows(matchIdxArr);
                    com.sbm.execute(sbm_favDelete);
                }
            }
            scwin.setTitleFavToggle(menuId, isOn);
        }

    } catch (ex) {
        console.log(ex);
    }
};


/**
 * 업무화면 타이틀에 즐겨찾기버튼을 토글한다. MDI인 경우 탭복제 기능이 있을 수 있으므로 모든 탭을 확인하여 토글함
 */
scwin.setTitleFavToggle = function(menuId, isOn) {
    try {
        if (gcm.WORK_LAYOUT_TYPE == "MDI" && !com.util.isEmpty("tac_content")) {
            var tabCount = tac_content.getTabCount();
            for (var idx = 0; idx < tabCount; idx++) {
                var tabFrame = tac_content.getFrame(idx);
                var tabFrameCom = tabFrame.getObj("com");
                var tabMenuId = tabFrameCom.win.getMenuId();
                if (menuId == tabMenuId) {
                    var btnFavEl = $("#" + tabFrame.id + " .page_header .btn_fav")[0];
                    if(!com.util.isEmpty(btnFavEl)){
                        var btnFavId = btnFavEl.id;
                        var btnFavObj = tabFrameCom.util.getComponent(btnFavId);
                        if (isOn) {
                            btnFavObj.addClass("on");
                        } else {
                            btnFavObj.removeClass("on");
                        }
                    }
                }
            }
        } else if (gcm.WORK_LAYOUT_TYPE == "SDI" && !com.util.isEmpty("wfm_content")) {
            var contentFrmCom = wfm_content.getObj("com");
            var contMenuId = contentFrmCom.win.getMenuId();
            if (menuId == contMenuId) {
                var btnFavEl = $("#" + wfm_content.id + " .page_header .btn_fav")[0];
                if(!com.util.isEmpty(btnFavEl)){
                    var btnFavId = btnFavEl.id;
                    var btnFavObj = contentFrmCom.util.getComponent(btnFavId);
                    if (isOn) {
                        btnFavObj.addClass("on");
                    } else {
                        btnFavObj.removeClass("on");
                    }
                }
            }
        }
    } catch (ex) {
        console.error(ex);
    }
}

/**
 * 해당 메뉴가 즐겨찾기 목록에 있는지 확인
 */
scwin.isFavList = function(menuId){
    try {
        if (com.util.getComponent("dlt_favList")) {
            var favMenuIdData =  dlt_favList.getMatchedIndex("menuId", menuId, true);
            if (favMenuIdData.length > 0 ) {
                    return true;
            }else{
                return false;
            }
        }
    } catch (ex) {
        console.error(ex);
    }
};

/**
 * MDI 탭버튼을 클릭한 경우 발생
 */
scwin.tac_content_ontabclick = function(tabID,idx) {
    com.win._layerHideAll();
};

/**
 *  MDI 탭 닫기 버튼을 클릭한 경우 발생
 */
scwin.tac_content_onbeforetabclose = function(tabID,idx) {
    var tabFrame = this.getFrame(idx);
    return scwin.closeBeforePage(tabFrame);
};

/**
 *  MDI 탭 모두닫기 버튼을 클릭한 경우 발생
 */
scwin.btn_close_all_onclick = function(e) {
    tac_content.deleteAllTabs();
};


scwin.closeBeforePage = function(frameObj) {
    var focusComp =com.util.getComponent(WebSquare.util.getFocusedComponentId());
    if(!com.util.isEmpty(focusComp) && !com.util.isEmpty(focusComp.getPluginName) && focusComp.getPluginName() =="input"){
        focusComp.commit();
    }

    var isUserFuncModified = false;

    if(typeof frameObj.getObj("scwin").beforeCloseModifiedCheck ==="function"){
        isUserFuncModified = frameObj.getObj("scwin").beforeCloseModifiedCheck() || false;
    }
    var isMoidfied = com.win.beforeCloseModifiedCheck(frameObj.id);
    isConfirm = isMoidfied || isUserFuncModified;

    if(isConfirm){
        if(confirm(com.data.getMessage("com.cfm.0007") ||"창을 닫으시겠습니까? 변경사항이 저장되지 않을 수 있습니다")){
            frameObj.setUserData("isMove",false);
            return true;
        } else {
            frameObj.setUserData("isMove",true);
            return false;
        }
    }else{
        return true;
    }
};

scwin.grp_mainLogo_onclick = function(e) {
    $w.url("/");
};

scwin.openMainLayout = function(isHistory){
    if ( gcm.WORK_LAYOUT_TYPE == "MDI") {
        //tac_content.deleteAllTabs();
    }
    $('nav.lnb_list li').removeClass('current');
    var mainLayout = com.util.getComponent("wfm_mainLayout");
    var genTopMenu = $p.top().com.util.getComponent("gen_topMenu");
    if (com.util.isEmpty(genTopMenu)) {
        mainLayout = com.util.getComponent("wfm_content");
        mainLayout.setSrc(gcm.MAIN_LAYOUT);
    } else if(!com.util.isEmpty(gcm.MAIN_LAYOUT) && !com.util.isEmpty(mainLayout) && !com.util.isEmpty(genTopMenu)){
        if(!com.util.isEmpty(wfm_mainLayout) && wfm_mainLayout.getStyle("display") =="none"){
            mainLayout.show("");
        }
        mainLayout.setSrc(gcm.MAIN_LAYOUT);
        com.win.setScrollTop(0,mainLayout);
    }

    var topFrame = $p.top();
    if (com.util.isEmpty(topFrame.com)) {
        topFrame = WebSquare.util.getMainFrame();
    }

    var genTopMenu = topFrame.com.util.getComponent("gen_topMenu");
    if (!com.util.isEmpty(genTopMenu)) {
        $("#"+genTopMenu.id + " >li").removeClass("current");
    }

    if ((typeof isHistory === "undefined") || (isHistory === true)) {
        history.pushState({ "data" : {}},"메인 레이아웃", "index.html");
    }

};

scwin.hideMainLayOut = function() {
    var wfm_mainLayout = com.util.getComponent("wfm_mainLayout");
    if(!com.util.isEmpty(wfm_mainLayout) && wfm_mainLayout.getStyle("display") !="none"){
        wfm_mainLayout.hide("");
    }
};

scwin.btn_pageCopy_onclick = function(e) {
    var selectIdx = tac_content.getSelectedTabIndex();
    if(selectIdx > -1){
        var tabFrame = tac_content.getFrame(selectIdx);
        var menuId = tabFrame.getObj("com").win.getMenuId();
        var options = {
            "openAction" : "new"
        };
        gcm.win._openMenuMDI(menuId,"",options);
    }
};


scwin.btn_menulist_onclick = function(e) {
    if(grp_menuOpenLayer.getStyle("display") =="none") {
        event.stopPropagation();
        com.win._layerHideAll();
        grp_menulist.addClass("on");
        grp_menuOpenLayer.show("");
    }else {
        event.stopPropagation();
        com.win._layerHideAll();
        grp_menulist.removeClass("on");
        grp_menuOpenLayer.hide("");
    }
};

//메뉴 검색 필터
scwin.searchMenu = function () {
    var ldkMenu = com.util.getComponent("ldk_menu");
    if(!com.util.isEmpty(ldkMenu)){
        ldkMenu.clearFilter();
        var filterOption = {
                "type" : "func",
                "colIndex" :"menuNm",
                "key" : dlt_filterFunc,
                "condition" : "and",
                "param" :  {}
        };

        ldkMenu.setColumnFilter(filterOption);

        function dlt_filterFunc(data, param, rowIndex) {
            var dltObj = com.util.getComponent(this.dataList);
            var searchVal = ibx_searchMenu.getValue();
            var searchValUpper = searchVal.toUpperCase();
            var srcPath = ldk_menu.getCellData(rowIndex,"srcPath");
            var menuId = ldk_menu.getCellData(rowIndex,"menuId");
            var dataUpper = data.toUpperCase();

            if (searchVal == "" ) {
                return false;
            }else if (srcPath =="") {
                return false;
            }else if (dataUpper.indexOf(searchValUpper) >-1  || menuId == searchVal ) {
                return true;
            }else {
                return false;
            }
        };
        ibx_searchMenu.focus();
    }

};


//메뉴 검색  버튼
scwin.btn_menuSearch_onclick = function(e) {
    grp_lnbScDoc.show();
    grp_lnbFavInner.hide();
    scwin.searchMenu();
};

//메뉴 검색 인풋박스
scwin.ibx_searchMenu_onkeyup = function(e) {
    if( e.keyCode == "13" ) {
        btn_menuSearch.click();
    }else if(this.getValue() =="" ) {
        grp_lnbScDoc.hide();
        grp_lnbFavInner.show();
    }

    ibx_searchMenu.focus();
};

//메뉴 검색 결과로 메뉴 열기
scwin.grd_searchMenu_oncellclick = function(row,col) {
    var menuId = ldk_menu.getCellData(row,"menuId");
    com.win.openMenu(menuId , "" , {"isExtend" : true});
    ibx_searchMenu.setValue("")
    grp_lnbScDoc.hide();
    grp_lnbFavInner.show();
    $('.lnb_fav_list').slideDown();
};

//푸쉬레이어 열기
scwin.btn_push_onclick = function(e) {
    if (!this.hasClass("on")) {
        com.win._layerHideAll();
        event.stopPropagation();
        btn_push.addClass("on");
        if (!com.util.isEmpty(wfm_pushOpenLayer) && !com.util.isEmpty(wfm_pushOpenLayer.getWindow()["scwin"])) {
            wfm_pushOpenLayer.getWindow()["scwin"].setPushList(scwin.setPushUnreadCount);
            grp_pushOpenLayer.show("");
        }
    }
};

scwin.setPushUnreadCount = function() {
    var strPushList = gcm.data._getSessionStorageItem("pushList");
    var pushList = com.util.isEmpty(strPushList) ? [] : com.util.getJSON(strPushList);
    tbx_pushBadge.setValue(pushList.filter(function(m){return m.isOpend == false;}).length);

    return pushList ;
}

//푸쉬서비스 초기화
scwin.initPushService = function() {

    // 초기 default 값 설정
    var pushList = scwin.setPushUnreadCount();

    var initPushService = function(config) {
        var ip = config.ip;
        var port = config.port;
        var gubunKey = config.gubunKey ;
        var eventKeys = config.eventKeys ;

        var callBackpushMessage = function(data) {
            console.log(data);
            var pushList = scwin.setPushUnreadCount();

            /*
                key (java) - event(javascript)
                type (java) - gubun(javascript)
            */
            if (data.ACTION_TYPE == "CONNECT_EVENT_BROKER") {
                eventKeys.forEach(function(elt, i, array) {
                    com.ext.addPushEventBrocker(elt, gubunKey);
                })
            }
            else if(data.ACTION_TYPE == "RECEIVE_DATA") {

                var msgMap = JSON.parse(data.MESSAGE);

                if(data.EVENT.indexOf("_public_info") > 0) {
                    msgMap.typeNm = "공지";
                    msgMap.type = "P"; // DSSP_PUBLIC
                }
                else {
                    msgMap.typeNm = "쪽지";
                    msgMap.type = "U"; // DSSP_USER
                }
                msgMap.isOpend = false;

                // msgMap.title
                // msgMap.userNm
                // msgMap.sendDttm
                // msgMap.message

                // 메인화면 종 표시 처리를 호출한다.
                console.table(msgMap);
                pushList.splice(0,0,msgMap);
                tbx_pushBadge.setValue(pushList.filter(function(m) {return m.isOpend == false;}).length);
                gcm.data._setSessionStorageItem("pushList", com.str.serialize(pushList));

                // 메시지 수신시 리스트 자동 열리도록. 2019.12.05
                scwin.btn_push_onclick.call(btn_push);

            }
        };

        com.ext.connectPushServer(ip, port, callBackpushMessage);
    }

    var option = {
             id : "sbm_retrievePushConfig",
             action : gcm.CONTEXT_PATH + "/cmm/push/v1/config",
             method : "get",
             submitDoneHandler : function(res) {

                 var config = res.responseJSON.SERVER_RESULT;
                 if(!com.util.isEmpty(config))
                     initPushService(config)
             }
        };

    com.sbm.executeDynamic(option);

};
