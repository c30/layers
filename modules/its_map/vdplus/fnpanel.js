/**
 * @description 地图功能面板
 * @date 2011/05/16
 * @author zhangsl
 * 
 */
Ext.namespace('cms.emap');
cms.emap.fnpanel = function(config) {
	cms.emap.fnpanel.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.fnpanel, Ext.ux.BaseControl, {
	controlItem : new cms.framework.map(),// 用来存储的子控件
	showWinFn : top.showmodal,
	mapId : undefined,
	pLine : undefined,
	rline : [],
	statisticsTBar : undefined,
	elPosition : {
		x : 0,
		y : 0
	},
	addNodeWin : undefined,
	// mapApp : undefined,
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		// 导航主面板
//		var map = new cms.emap.mappanel({
//					listeners : {
//						EmapEvent : this.onEmapEventHandler
//								.createDelegate(this)
//
//					}
//				});
//		this.controlItem.add('map', map);
//		var ctrlPanel = new cms.emap.ctrlpanel({
//
//					listeners : {
//						CtrlPanelEvent : this.ctrlPanelHandler
//								.createDelegate(this),
//						RectEvent : this.rectHandler.createDelegate(this)
//					}
//				});
//		this.controlItem.add('ctrlPanel', ctrlPanel);

	},
	navigateEventHandler : function(event) {
		switch (event.params.operate) {
			case 'SetMapId' :
				this.controlItem.get('map').mapId = event.params.mapId;
				this.mapId = event.params.mapId;
				this.controlItem.get('map').mapName = event.params.mapName;
				break;
			case 'DisVideo' :
				this.controlItem.get('map').disVideo(event.params);
				break;
			case 'drawline' :
				this.tradraw(event);
				break;
			case 'locationMapEL' :
				this.controlItem.get('map')
						.locationMapEl(event.params.elementId);
				break;
			default :
				break;
		}
	},
	updateStatisticsTBar : function(statObj) {
		if (!this.statisticsTBar) {
			this.statisticsTBar = Ext
					.get(this.controlItem.get('ctrlPanel').toolbar.items.items[0].id).dom;
		}
		var content = '';// '当前操作地图:' + this.controlItem.get('map').mapName;
		content += ' 元素统计:'
		if (statObj.cameraTotal > 0) {
			content += '  监控点个数:' + statObj.cameraTotal;
		}
		if (statObj.ioInTotal > 0) {
			content += '  报警输入个数:' + statObj.ioInTotal;
		}

		if (statObj.ioOutTotal > 0) {
			content += '  报警输出个数:' + statObj.ioOutTotal;
		}
		if (statObj.carTotal > 0) {
			content += '  车载个数:' + statObj.carTotal;
		}
		if (statObj.simpleTotal > 0) {
			content += '  单兵个数:' + statObj.simpleTotal;
		}
		if (statObj.bayonetTotal > 0) {
			content += '  ' + top.crossingManageName + '个数:'
					+ statObj.bayonetTotal;
		}
		this.statisticsTBar.innerText = content;
		this.controlItem.get('ctrlPanel').toolbar.doLayout();
	},
	showAddNodeWindowHandler : function(button, event) {
		var config = {};
		config.title = button.text;
		config.mapName = this.controlItem.get('map').mapName;
		var mapApp = this.controlItem.get('map').mapApp;
		switch (button.code) {
			case 'addCameraBtn' :
				config.treeType = 0;
				config.pos = mapApp.getCenterLatLng();
				config.po = mapApp.getCenterLatLng();
				break;
			case 'addIoInBtn' :
				config.treeType = 1;
				config.pos = mapApp.getCenterLatLng();
				break;
			case 'addIoOutBtn' :
				config.treeType = 2;
				config.pos = mapApp.getCenterLatLng();
				break;
			case 'addCarBtn' :
				config.treeType = 3;
				config.pos = mapApp.getCenterLatLng();
				config.po = mapApp.getCenterLatLng();
				break;
			case 'addSimpleBtn' :
				config.treeType = 4;
				config.pos = {};
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addBayonetBtn' :
				config.treeType = 5;
				config.pos = mapApp.getCenterLatLng();
				config.po = mapApp.getCenterLatLng();
				// config.pos.x = mapApp.getMouseMapX();
				// config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addCameraItem' :
				config.treeType = 0;
				config.pos = {};
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				config.po = {};
				config.po.x = mapApp.getMouseMapX();
				config.po.y = mapApp.getMouseMapY();
				break;
			case 'addIoInItem' :
				config.treeType = 1;
				config.pos = {};
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addIoOutItem' :
				config.treeType = 2;
				config.pos = {};
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addCarItem' :
				config.treeType = 3;
				config.pos = {};
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				config.po = {};
				config.po.x = mapApp.getMouseMapX();
				config.po.y = mapApp.getMouseMapY();
				break;
			case 'addSimpleItem' :
				config.treeType = 4;
				config.pos = {};
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addBayonetItem' :
				config.treeType = 5;
				config.po = {};
				config.pos = {};
				config.po.x = mapApp.getMouseMapX();
				config.po.y = mapApp.getMouseMapY();
				config.pos.x = mapApp.getMouseMapX();
				config.pos.y = mapApp.getMouseMapY();
				break;

		}
		this.showAddNodeWindow(config);
	},
	showAddNodeWindow : function(config) {
		this.addNodePanel = new cms.emap.addNode({
					mapId : this.mapId,
					treeType : config.treeType,
					mapName : config.mapName,
					pos : config.pos,
					po : config.po,
					listeners : {
						AddNodeEvent : this.addNodeHandler.createDelegate(this),
						Close : this.closeWin.createDelegate(this)
					}
				});
		this.controlItem.add('addNodePanel', this.addNodePanel);
		this.addNodeWin = new Ext.Window({
					title : config.title,
					resizable : false,
					// closeAction : 'hide',
					layout : 'fit',
					width : 330,
					height : 445,
					// autoScroll : true,
					border : false,
					frame : true,
					modal : true,
					items : [this.addNodePanel.getControl()/* ,this.description */]
				});

		this.addNodeWin.show();

	},
	showAlarmListWin : function(cameraId) {
		this.alarmListPanel = new cms.emap.alarmList({
					cameraId : cameraId
				});
		this.alarmListWin = new Ext.Window({
					title : '报警历史',
					resizable : false,
					layout : 'fit',
					width : 600,
					height : 450,
					border : false,
					frame : true,
					modal : true,
					items : [this.alarmListPanel.getControl()]
				});

		this.alarmListWin.show();
	},
	addNodeHandler : function(event) {
		switch (event.params.operate) {
			case 'ConfirmBtn' :
				this.controlItem.get('map').addNodeHandler(event.params.data);

				var eventObject = {
					eventCode : 'FnPanelEvent',
					sender : this,
					params : {
						operate : "AddElRlt",
						data : event.params.data
					}
				};
				this.fireEvent(eventObject.eventCode, eventObject);

				break;
			case 'CancelBtn' :
				break;
			default :
				break;
		}
		this.addNodeWin.close();
	},
	onEmapEventHandler : function(eventObject) {
		switch (eventObject.params.operate) {
			case 'addCameraItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addIoInItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addIoOutItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addCarItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addSimpleItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addBayonetItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'searchCarContrailItem' :
				this.searchCarContrail();
				break;
			case 'InitEmap' :
				this.controlItem.get('ctrlPanel').mapApp = this.controlItem
						.get('map').mapApp;
				eventObject.eventCode = 'FnPanelEvent';
				this.fireEvent(eventObject.eventCode, eventObject);
				break;
			case 'removeElItem' :
				eventObject.eventCode = 'FnPanelEvent';
				this.fireEvent(eventObject.eventCode, eventObject);
				break;
			case 'UpdateStatistics' :
				this.updateStatisticsTBar(eventObject.params.statObj);
				break;
			case 'aroundQuery' :
				this.controlItem.get('ctrlPanel').showSearchWin(1);
				this.controlItem.get('ctrlPanel').updateCenterStation(
						eventObject.params.xPos, eventObject.params.yPos);
				break;
			case 'alarmHistroy' :
				this.showAlarmListWin(eventObject.params.cameraId);
				break;
			case 'updateCoordinates' :
				this.controlItem.get('ctrlPanel').updateCenterStation(
						eventObject.params.xPos, eventObject.params.yPos);
				break;
			case 'Preview' :
			alert(1)
				this.controlItem.get('ctrlPanel')
						.previewByClkEl(eventObject.params.cameraId);
				break
			case 'shortQuery' :
				this.swaybar(eventObject.params.m1, eventObject.params.m2,
						eventObject.params.m3, eventObject.params.m4);
				break
			default :
				break;
		}
	},
	ctrlPanelHandler : function(eventObject) {
		switch (eventObject.params.operate) {
			case 'locationMapEL' :
				this.controlItem.get('map')
						.locationMapEl(eventObject.params.elementId);
				break;
			case 'showAll' :
				this.controlItem.get('map').initMapEle();
				break;
			default :
				break;
		}
	},
	closeWin : function() {
		this.addNodeWin.close();
	},
	searchCarContrail : function() {
		this.brandNo = new Ext.form.TextField({
					fieldLabel : '车牌号码',
					name : 'brandNo',
					maskRe : new RegExp("[^(/:;,#$&*?^!@'\"<>|%_\\\\)]"),
					width : 160,
					maxLength : 25,
					allowBlank : false,
					selectOnFocus : true
				});
		this.startTime = new cms.form.DateFieldCtrl({
					name : 'startTime',
					width : 160,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.stopTime = new cms.form.DateFieldCtrl({
					name : 'stopTime',
					width : 160,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.btnSearch = new Ext.Button({
			width : 80,
			text : '查询',
			handler : function() {
				if (this.brandNo.getValue().trim() == "") {
					cms.ext.alert('错误', '车牌号码不能为空 ！');
					return;
				}
				if (this.startTime.getValue().trim() == ''
						|| this.stopTime.getValue().trim() == '') {
					cms.ext.alert('错误', '时间不能为空！');
					return;
				}
				if (this.startTime.getValue() != ''
						&& this.stopTime.getValue() != '') {
					if (cms.util.compareDateTime(this.stopTime.getValue(),
							this.startTime.getValue()) != 1) {
						cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
						return;
					}
				}
				var st = cms.util.getTime(this.startTime.getValue());
				var et = cms.util.getTime(this.stopTime.getValue());
				var dif = et - st;
				if (dif > 3 * 24 * 3600 * 1000) {
					cms.ext.alert('错误', '查询时间不能超过三天！');
					return;
				}
				var op = this.brandNo.getValue().toUpperCase();
				Ext.Ajax.request({
					timeout : EXT_QUERY_TIME_OUT,
					url : '/crossingConfigAction!findCrossingInfoByPlateInfoAndPassTime.action',
					params : {
						brandNo : this.brandNo.getValue().toUpperCase(),
						startTime : this.startTime.getValue(),
						mapMode : mapMode,
						stopTime : this.stopTime.getValue()
					},
					success : function(response) {
						var jsonResult = Ext.util.JSON
								.decode(response.responseText);
						var crossingVehiclePass = jsonResult.crossingVehiclePassDTOs;
						var pointsStr = '';
						var pointsStrs = '';
						var passTimeStrArray = new Array();
						var elementIdArray = new Array();
						for (var i = 0, len = crossingVehiclePass.length; i < len; i++) {
							if (crossingVehiclePass[i].longitude != '') {
							pointsStr += crossingVehiclePass[i].longitude + ','
									+ crossingVehiclePass[i].latitude + ',';
							}
							passTimeStrArray
									.push(crossingVehiclePass[i].passTimeStr);
							elementIdArray
									.push(crossingVehiclePass[i].elementId);
						}
						if (pointsStr != '') {
							fpx = pointsStr.split(",")[0];
							fpy = pointsStr.split(",")[1];
							var firstPoint = new Point(fpx, fpy);
							pointsStrs = pointsStr.trim().substring(0,
									pointsStr.length - 1);
							var k = firstPoint;
							var m = pointsStrs;
							var o = passTimeStrArray;
							var p = elementIdArray;
							var q = 1;
							var r = op;
							this.tradrawk(k, m, o, p, q, r)
						} else {
							cms.ext.alert('提示', '无此信息!');
						}
					}.createDelegate(this),
					failure : function(response) {
						cms.ext.alert('错误', '查询失败!');
					}
				}, this);
				searchCarContrailWin.close();
			}.createDelegate(this)

		});
		var searchCarContrailWin = new Ext.Window({
					title : '查询车辆轨迹',
					width : 250,
					height : 145,
					modal : true,
					resizable : false,
					items : [{
						style : 'padding:1px 0px 0px 0px',
						layout : 'form',
						border : false,
						frame : false,
						labelAlign : 'right',
						labelWidth : 60,
						items : [this.brandNo, this.startTime.getControl(),
								this.stopTime.getControl()]
					}],
					buttons : [this.btnSearch]
				});
		searchCarContrailWin.show();

	},
	onvehicleHandler : function(eventObject) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:25:39
		 * @description:卡口右键功能的调用
		 */
		switch (eventObject.params.operate) {
			case 'vehiclealarm' :
				this.controlItem.get('bayonetsearch')
						.showvehiclealarmWin(eventObject.params.crosslsh);
				break;
			case 'vehiclepass' :
				this.controlItem.get('bayonetsearch')
						.showvehiclepassWin(eventObject.params.crosslsh);
				break;
			case 'alarm' :
				this.controlItem.get('bayonetsearch')
						.showalarmWin(eventObject.params.crosslsh);
				break;
			case 'cartraffic' :
				this.controlItem.get('bayonetsearch')
						.showcartrafficWin(eventObject.params.crosslsh);
				break;
			case 'crossstate' :
				this.controlItem.get('bayonetsearch')
						.showcrossstateWin(eventObject.params.crosslsh);
				break;
			case 'Search' :
				this.controlItem.get('bayonetsearch')
						.searchData(eventObject.params);
				break;
			case 'frequency' :
				this.controlItem.get('bayonetsearch')
						.showfre(eventObject.params.crosslsh);
				break;
			case 'intime' :
				this.controlItem.get('bayonetsearch')
						.showbayintime(eventObject.params.crosslsh);
				this.controlItem.get('bayonetsearch').showpre(
						eventObject.params.crosslsh,
						eventObject.params.elementId);
				RemoveInfo();
				TryGetPassCarInfo();
				break;
			default :
				break;
		}
	},
	rectHandler : function(eventObject) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:25:39
		 * @description:卡口右键功能的调用
		 */
		switch (eventObject.params.operate) {
			case 'rectbayalarm' :
				this.controlItem.get('bayonetsearch')
						.showvehiclealarmWin(eventObject.params.elementId);
				break;
			case 'rectbaypass' :
				this.controlItem.get('bayonetsearch')
						.showvehiclepassWin(eventObject.params.elementId);
				break;
			case 'rectbayfre' :
				this.controlItem.get('bayonetsearch')
						.showfre(eventObject.params.elementId);
				break;
			case 'rectpre' :
				this.controlItem.get('map')
						.rectpreviewHandler(eventObject.params.elementId);
				break;
			case 'rectback' :
				this.controlItem.get('map')
						.rectplaybackHandler(eventObject.params.elementId);
				break;
			case 'crossstate' :
				this.controlItem.get('bayonetsearch')
						.showcrossstateWin(eventObject.params.crosslsh);
				break;
			case 'Search' :
				this.controlItem.get('bayonetsearch')
						.searchData(eventObject.params);
				break;
			default :
				break;
		}
	},
	tradraw : function(eventObject) {
		var k = eventObject.params.firstPoint;
		var m = eventObject.params.pointsStr;
		var o = eventObject.params.passTimeStrArray;
		var p = eventObject.params.elementIdArray;
		var q = eventObject.params.ist;
		var r = eventObject.params.brandNo;
		var shortpoint = m.split(",");
		if (ezQueryPort == "") {
			this.tradrawk(k, m, o, p, q, r)
		} else {
			var map = this.controlItem.get('map');
			map.mapApp.clearOverlays();
			for (s = 0; s < shortpoint.length - 2; s++) {
				this.swaybar(shortpoint[s], shortpoint[s + 1],
						shortpoint[s + 2], shortpoint[s + 3]);
				s = s + 1;
			}
		}
	},
	tradrawk : function(k, m, o, p, q, r) {
		var map = this.controlItem.get('map');
		// for (ir = 0; ir < this.rline.length; ir++) {
		// map.mapApp.removeOverlay(this.rline[ir]);
		// }
		map.mapApp.clearOverlays();
		map.mapApp.recenterOrPanToLatLng(k);
		this.pLine = new Polyline(m, "#ff0000", 4, 0.7, 1);
		this.rline.push(this.pLine);
		map.passTimeStrArray = o;
		map.elementIdArray = p;
		if (q == "0") {
			map.mapApp.addOverlay(this.pLine);
		} else if (q == "1") {
			var pIcon = new Icon();
			pIcon.image = "/modules/emap_js/images/tack.png";
			pIcon.height = 37;
			pIcon.width = 25;
			pIcon.topOffset = -17;
			pIcon.leftOffset = 0;
			EzServerClient.GlobeFunction.displayDynamicPolyline(this.pLine,
					"shortdash", map.mapApp, 30, 30);
			this.marker = new Marker(k, pIcon, new Title(r, 12, 7, "宋体", null,
							null, "red", "1"));
			this.rline.push(this.marker);
			map.mapApp.addOverlay(this.marker);
			this.marker.setInterval(50);
			this.marker.setRepeat(false);
			this.marker.setPath(20, 700, m); // 根据设定的路径进行推演，根据设置的路径和设定的时间间隔进行推演
			// this.marker.setExtendStatus(5,250,1,2);
			// //设置元素的生长状态，根据推演的周期和开始结束比例，在推演的过程中实现该元素比例的变化
			this.marker.play(true);
			// this.marker.startMove();
		}
	},
	swaybar : function(m1, m2, m3, m4) {
		stX = m1;
		stY = m2;
		edX = m3;
		edY = m4;
		var queryPort = ezQueryPort;
		if (queryPort == "" || queryPort == null) {
			cms.ext.alert('提示', '路径服务未开启！');
			return;
		}
		$.ajaxSetup({
					dataType : "text/plain"
				});
		var stpt = new Point(parseFloat(stX), parseFloat(stY));
		var edpt = new Point(parseFloat(edX), parseFloat(edY));
		var stpt = stX + "," + stY;
		var edpt = edX + "," + edY;
		var tmpQueryData = {
			startPoint : stpt,
			stopPoint : edpt
		};
		var tmp = undefined;
		try {
			$.get(queryPort, tmpQueryData, function(data) {
						tmp = data;
						axlelock(tmp);
					});
		} catch (e) {
			cms.ext.alert('提示', "请启用浏览器<安全设置-Internet区域>中的<通过域访问数据源>选项！");
		}
		return tmp;
	},
	showTeammanager : function() {
		/**
		 * @author zhangsl
		 * @date : 2011-5-24 上午09:13:14
		 * @description:分组管理
		 */
		var win = this.getTeamWin();
		win.show();
	},
	getTeamWin : function() {

		this.btnSearch1 = new Ext.Button({
					width : 80,
					text : '添加',
					handler : this.confirmHandler.createDelegate(this)

				});
		this.btnSearch2 = new Ext.Button({
					width : 80,
					text : '清除',
					handler : this.canHandler.createDelegate(this)

				});

		this.btnSearch3 = new Ext.Button({
					width : 80,
					text : '删除',
					handler : this.delHandler.createDelegate(this)

				});
		this.teamnametext = new Ext.form.TextField({
			fieldLabel : '分组名称',
			labelWidth : 72,
			width : 250
				// hideLabel : true
			});
		this.teamdestext = new Ext.form.TextField({
			fieldLabel : '分组描述',
			labelWidth : 72,
			width : 250
				// hideLabel : true
			});
		this.teampanel = new Ext.Panel({
					baseCls : "x-plain",
					border : false,
					frame : false,
					layout : 'column',
					items : [{
								baseCls : "x-plain",
								width : 45,
								border : false
							}, this.btnSearch1, {
								baseCls : "x-plain",
								width : 30,
								border : false
							}, this.btnSearch2, {
								baseCls : "x-plain",
								width : 30,
								border : false
							}, this.btnSearch3]

				});
		this.tree = new Ext.ux.ChkboxTree({
					treeLoaderUrl : '/preview!getAllWithCheckBox.action',
					height : 300
				});
		this.treePanelRegion = new Ext.Panel({
					// region : 'north',
					height : 326,
					border : false,
					frame : false,
					layout : 'fit',
					items : this.tree.getControl()
				});

		this.store = new Ext.data.JsonStore({
					url : path + '/teamAction!getAllTeamJSON.action',
					fields : [{
								name : 'Teamname',
								mapping : 'groupName'
							}, {
								name : 'Teamdes',
								mapping : 'description'
							}]
				});
		var cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '分组名称',
								dataIndex : 'Teamname',
								align : 'center',
								width : 180
							}, {
								header : '分组描述',
								dataIndex : 'Teamdes',
								align : 'center',
								width : 180
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({
			// region : 'south',
			// layout : 'fit',
			title : '搜索结果',
			ds : this.store,
			height : 230,
			cm : cm,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
			viewConfig : {
				forceFit : true
			},
			view : new Ext.ux.grid.BufferView({
						rowHeight : 20,
						scrollDelay : false
					}),
			border : false,
			columnLines : false,
			frame : false,
			autoScroll : true,
			trackMouseOver : true,
			loadMask : true,
			stripeRows : true
				// listeners : {
				// rowclick : this.locationMapEL
				// }
			});
		this.schWin = new Ext.Window({
					title : '分组管理',
					resizable : false,
					frame : true,
					modal : true,
					border : false,
					width : 410,
					height : 590,
					layout : 'form',
					items : [this.treePanelRegion, this.teamnametext,
							this.teamdestext, {
								xtype : 'hidden',
								name : 'id'
							}, this.teampanel, this.resultPanel]

				});
		this.store.load();
		return this.schWin;

	},
	getEleType : function() {
		var elementType, elementSubType;
		switch (parseInt(this.treeType)) {
			case 0 :// camera
				elementType = 3000;
				elementSubType = this.tree.getSelectedNodeType();
				break;
			case 1 :// 报警输入
				elementType = 4000;
				elementSubType = '';
				break;
			case 2 :// 报警输出
				elementType = 4001;
				elementSubType = '';
				break;
			case 3 :// GPS
				elementType = 5000;
				elementSubType = this.tree.getSelectedNodeType();
				break;
			case 4 :// 卡口
				elementType = 6000;
				elementSubType = '';
				break;
			default :
				elementType = 3000;
				elementSubType = '';
				break;
		}
		return {
			elementType : elementType,
			elementSubType : elementSubType
		};
	},
	saveNode : function() {
		var shapeXml = '<Shape><ShapeType>Point</ShapeType><Point><X>'
				+ this.pos.x + '</X><Y>' + this.pos.y + '</Y></Point></Shape>';
		var eleType = this.getEleType();
		this.event.params.data.BKGroundColor = this.event.params.data.BKGroundColor
				.removeStart('#');
		this.event.params.data.FontColor = this.event.params.data.FontColor
				.removeStart('#');
		if (this.tree.getSelectedNodesNames() == ""
				|| this.tree.getSelectedNodesIds() == "") {
			cms.ext.alert('提示', '没有节点被选中 ！');
			return;
		}
		Ext.Ajax.request({
					url : this.addNodeUrl,
					success : this.addSuccess.createDelegate(this),
					failure : this.addFailure.createDelegate(this),
					params : {
						emapId : this.mapId,
						linkId : this.tree.getSelectedNodesIds(),
						elementName : this.tree.getSelectedNodesNames(),
						elementType : eleType.elementType,
						elementSubType : eleType.elementSubType,
						shapeXml : shapeXml,
						description : '',
						xmlRev : this.orgStyle(),
						latitude : this.pos.y,
						longitude : this.pos.x
					}
				});
	},
	addNodeFormEventHandler : function(event) {
		this.event = event;
		switch (event.params.operate) {
			case 'ConfirmBtn' :
				this.saveNode();
				break;
			case 'CancelBtn' :
				var eventObject = {
					eventCode : 'Close',
					sender : this,
					params : {}
				};
				this.fireEvent(eventObject.eventCode, eventObject);
				break;
			default :
				break;
		}
	},
	confirmHandler : function() {
		if (!form.getForm().isValid()) {
			return;
		}
		if (form.getForm().findField("id").getValue() == "") {
			// 添加
			form.getForm().submit({
						url : './jsp/save.jsp',
						success : function(f, action) {
							if (action.result.success) {
								Ext.Msg.alert('消息', action.result.msg,
										function() {
											grid.getStore().reload();
											form.getForm().reset();
											form.buttons[0].setText('添加');
										});
							}
						},
						failure : function() {
							Ext.Msg.alert('错误', "添加失败");
						}
					});
		} else {
			// 修改
			form.getForm().submit({
						url : './jsp/save.jsp',
						success : function(f, action) {
							if (action.result.success) {
								Ext.Msg.alert('消息', action.result.msg,
										function() {
											grid.getStore().reload();
											form.getForm().reset();
											form.buttons[0].setText('添加');
										});
							}
						},
						failure : function() {
							Ext.Msg.alert('错误', "修改失败");
						}
					});
		}

	},
	canHandler : function() {
		this.teamnametext.reset();
		this.teamdestext.reset();
		this.btnSearch1.setText('添加1');
	},
	delHandler : function() {
		var id = form.getForm().findField('id').getValue();
		if (id == '') {
			Ext.Msg.alert('提示', '请选择需要删除的信息。');
		} else {
			Ext.Ajax.request({
						url : './jsp/remove.jsp',
						success : function(response) {
							var json = Ext.decode(response.responseText);
							if (json.success) {
								Ext.Msg.alert('消息', json.msg, function() {
											grid.getStore().reload();
											form.getForm().reset();
											form.buttons[0].setText('添加');
										});
							}
						},
						failure : function() {
							Ext.Msg.alert('错误', "删除失败");
						},
						params : "id=" + id
					});
		}
	}
});
