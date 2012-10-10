/**
 * @description 封装了地图的ocx控件，及与控件交互的方法
 * @date 2011/05/16
 * @author zhangsl
 */
Ext.namespace('cms.emap');
cms.emap.mappanel = function(config) {
	this.initUrl = '/ezEmapInfoAction!getAllEmapElements.action';
	this.upDatePosUrl = '/ezEmapInfoAction!changeElementShapeXml.action';
	this.removeElUrl = '/ezEmapInfoAction!deleteEmapElementInfo.action';
	this.recentElUrl = '/ezEmapInfoAction!searchRecentElement.action';
	cms.emap.mappanel.superclass.constructor.call(this, config);

};
Ext.extend(cms.emap.mappanel, Ext.ux.BaseControl, {
	elementItem : new cms.framework.map(),// 用来存储的子控件
	menuItem : new cms.framework.map(),// 用来存储的子控件
	objXml : undefined,
	loginParam : undefined,
	mapId : undefined,
	mapDivId : undefined,
	mapName : undefined,
	mapApp : undefined,
	loginFlag : 0,// >0 登录否则注销
	ocxDom : undefined,
	cursorHand : 'hand',
	contextmenu : undefined,
	mapElPrefix : 'mapElement_',
	divIdPrefix : 'div_',
	pIdPrefix : 'p_',
	imgIdPrefix : 'img_',
	elementId : 0,
	mapInfoDivId : 'MapInfoDiv',
	mapInfoRegion : undefined,
	mapInfoPanel : undefined,
	previewWin : undefined,
	pos : {},
	selectEl4RK : false,// 右键选中地图元素,
	commonAlarmEventName : '',// 存储普通报警信息
	commonAlarmNodeId : '',
	gpsElObj : '',
	crossingAlarmEventName : '',
	crossingAlarmTime : '',
	crossingAlarmNodeId : '',
	crossingAlarmVehicleSpeed : '',
	crossingAlarmPlace : '',
	crossingAlarmPlateInfo : '',
	crossingAlarmVehicleType : '',
	crossingAlarmpPlateType : '',
	crossingAlarmDirectIndex : '',
	crossingAlarmDrivewayNumber : '',
	crossingAlarmpPicUrl : '',
	thematicType : 0,// 专题图加载类型,默认为全部
	passTimeStrArray : '',
	elementIdArray : '',
	curX : '',
	curY : '',
	curElId : '',
	playbackWin : '',
	curCameraId : '',
	gis : 0,
	markerstarts : [],
	markerstarts2 : [],
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		this.createPlaybackWin();
	},
	initContextMenu : function(e, eg) {
		var addCameraItem = new Ext.menu.Item({
					code : 'addCameraItem',
					iconCls:'og-jiankongdian',
					text : '添加监控点',
					handler : this.contextMenuHandler.createDelegate(this,
							[eg], true)
				});
		this.menuItem.add('addCameraItem', addCameraItem);
		var addIoInItem = new Ext.menu.Item({
					code : 'addIoInItem',
					text : '添加报警输入',
					handler : this.contextMenuHandler.createDelegate(this)
				});

		this.menuItem.add('addIoInItem', addIoInItem);
		var addIoOutItem = new Ext.menu.Item({
					code : 'addIoOutItem',
					text : '添加报警输出',
					handler : this.contextMenuHandler.createDelegate(this)
				});
		this.menuItem.add('addIoOutItem', addIoOutItem);
		var addCarItem = new Ext.menu.Item({
					code : 'addCarItem',
					iconCls:'og-chezai',
					text : '添加车载',
					handler : this.contextMenuHandler.createDelegate(this,
							[eg], true)
				});
		this.menuItem.add('addCarItem', addCarItem);
		var addSimpleItem = new Ext.menu.Item({
					code : 'addSimpleItem',
					iconCls:'og-danbing',
					text : '添加单兵',
					handler : this.contextMenuHandler.createDelegate(this,
							[eg], true)
				});
		this.menuItem.add('addSimpleItem', addSimpleItem);
		var addBayonetItem = new Ext.menu.Item({
					code : 'addBayonetItem',
					iconCls:'og-kakou',
					text : '添加' + top.crossingManageName,
					handler : this.contextMenuHandler.createDelegate(this,
							[eg], true)
				});
		this.menuItem.add('addBayonetItem', addBayonetItem);
		var searchCarContrailItem = new Ext.menu.Item({
					code : 'searchCarContrailItem',
					text : '查询车辆轨迹',
					handler : this.contextMenuHandler.createDelegate(this)
				});
		this.menuItem.add('searchCarContrailItem', searchCarContrailItem);
		var previewItem = new Ext.menu.Item({
					code : 'previewItem',
					text : '视频预览',
					handler : this.previewHandler.createDelegate(this)
				});
		this.menuItem.add('previewItem', previewItem);
		var playbackItem = new Ext.menu.Item({
					code : 'playbackItem',
					text : '视频回放',
					handler : this.playbackHandler.createDelegate(this)
				});
		this.menuItem.add('playbackItem', playbackItem);
		var carPreviewItem = new Ext.menu.Item({
					code : 'carPreviewItem',
					text : '车载视频预览',
					handler : this.carPreviewHandler.createDelegate(this)
				});
		this.menuItem.add('carPreviewItem', carPreviewItem);
		var updateElItem = new Ext.menu.Item({
					code : 'updateElItem',
					text : '修改元素',
					handler : this.updateElHandler.createDelegate(this)
				});
		this.menuItem.add('updateElItem', updateElItem);

		var removeElItem = new Ext.menu.Item({
					code : 'removeElItem',
					text : '删除元素',
					iconCls:'og-shanchu',
					handler : this.removeElHandler.createDelegate(this, [e])
				});
		this.menuItem.add('removeElItem', removeElItem);
		var aroundQueryItem = new Ext.menu.Item({
					code : 'aroundQueryItem',
					iconCls:'og-zhoubian',
					text : '周边资源查询',
					handler : this.aroundQueryHandler
							.createDelegate(this, [eg])
				});
		this.menuItem.add('aroundQueryItem', aroundQueryItem);
		var startPointItem = new Ext.menu.Item({
					code : 'startPointItem',
					iconCls:'og-biaoji',
					text : '以此为起点',
					handler : this.startPointHandler.createDelegate(this, [eg])
				});
		this.menuItem.add('startPointItem', startPointItem);
		var endPointItem = new Ext.menu.Item({
					code : 'endPointItem',
					iconCls:'og-biaoji',
					text : '以此为终点',
					handler : this.endPointHandler.createDelegate(this, [eg])
				});
		this.menuItem.add('endPointItem', endPointItem);
		var barrierItem = new Ext.menu.Item({
					code : 'barrierItem',
					iconCls:'og-biaoji',
					text : '设置路障',
					handler : this.barrierHandler.createDelegate(this, [eg])
				});
		this.menuItem.add('barrierItem', barrierItem);
		var alarmHisItem = new Ext.menu.Item({
					code : 'alarmHisItem',
					text : '查看报警历史',
					handler : this.alarmHisHandler.createDelegate(this)
				});
		this.menuItem.add('alarmHisItem', alarmHisItem);
		var recentElItem = new Ext.menu.Item({
					code : 'recentElItem',
					text : '搜索最近元素',
					handler : this.recentElHandler.createDelegate(this)
				});
		this.menuItem.add('recentElItem', recentElItem);
		var quyuElItem = new Ext.menu.Item({
					code : 'quyuElItem',
					text : '区域碰撞查询'/*
									 * , handler :
									 * this.quyuElHandler.createDelegate(this)
									 */
				});
		this.menuItem.add('quyuElItem', quyuElItem);
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:19:04
		 * @description:添加交通组相关右键菜单，code用来区分操作
		 */
		var menu1 = new Ext.menu.Menu({
					items : [{
								code : 'vehiclealarmItem',
								text : '违章信息',
								handler : this.vehiclealarmHandler
										.createDelegate(this)
							}, {
								code : 'vehiclepassItem',
								text : '过车信息',
								handler : this.vehiclepassHandler
										.createDelegate(this)
							}, {
								code : 'alarmItem',
								text : '报警处理统计',
								handler : this.alarmHandler
										.createDelegate(this)
							}, {
								code : 'dasItem',
								text : '流量统计',
								handler : this.cartrafficHandler
										.createDelegate(this)
							}, {
								code : 'crossstateItem',
								text : top.crossingManageName + '设备状态',
								handler : this.crossstateHandler
										.createDelegate(this)
							}, {
								code : 'frequencyItem',
								text : '频度分析',
								handler : this.frequencyHandler
										.createDelegate(this)
							}]
				});

		var bayonetsearchItem = new Ext.menu.Item({
					code : 'bayonetsearchItem',
					text : '过车查询统计',
					menu : menu1
				});
		this.menuItem.add('bayonetsearchItem', bayonetsearchItem);
		var bayintimeItem = new Ext.menu.Item({
					code : 'bayintimeItem',
					text : '实时过车信息',
					handler : this.bayintimeHandler.createDelegate(this)
				});
		this.menuItem.add('bayintimeItem', bayintimeItem);
		this.contextmenu = new Ext.menu.Menu({
					ignoreParentClicks : true,
					items : [/* recentElItem, */
							/*
							 * bayintimeItem, bayonetsearchItem,
							 */
							/* quyuElItem, */
							addBayonetItem, /*
											 * addIoInItem, addIoOutItem,
											 * addCarItem, addSimpleItem,
											 */
							addCameraItem, /*addCarItem,addSimpleItem,*/
							/*
							 * searchCarContrailItem, previewItem, playbackItem,
							 */
							carPreviewItem, /* updateElItem, */
							removeElItem, aroundQueryItem, startPointItem,endPointItem,barrierItem
															 /*
									 * , alarmHisItem
									 */]

				});
	},
	carPreviewHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		this.getGPSInfoWin(elObj.nodeInfo.id);
	},
	previewHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		if (elObj.nodeInfo.elementType == 4000
				|| elObj.nodeInfo.elementType == 4100) {
			cms.ext.alert('提示', "不能进行预览！");
			return;
		}
		var cameraId = elObj.nodeInfo.linkId;
		if (elObj.nodeInfo.elementType == 6000) {
			var conn = Ext.lib.Ajax.getConnectionObject().conn;
			conn.open("post",
					"/crossingConfigAction!findCrossingInfoRelateCameraId.action?crossLsh="
							+ elObj.nodeInfo.linkId, false);
			conn.send(null);
			cameraId = Ext.util.JSON.decode(conn.responseText).cameraId;
			if (cameraId == -1) {
				cms.ext.alert(' 错误', '没有关联通道,不能进行预览!');
			} else {
				var eventObject = {
					eventCode : 'EmapEvent',
					sender : this,
					params : {
						operate : 'Preview',
						cameraId : cameraId
					}
				};
				this.fireEvent(eventObject.eventCode, eventObject);
			}
		} else if (elObj.nodeInfo.elementType == 5000
				|| elObj.nodeInfo.elementType == 5100) {// 车载或单兵
			cms.ext.alert(' 提示', '请选择相关通道进行预览!');
		} else {
			eventObject = {
				eventCode : 'EmapEvent',
				sender : this,
				params : {
					operate : 'Preview',
					cameraId : cameraId
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}
	},
	playbackHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		if (elObj.nodeInfo.elementType == 4000
				|| elObj.nodeInfo.elementType == 4100) {
			cms.ext.alert('提示', "不能进行回放！");
			return;
		}
		var cameraId = elObj.nodeInfo.linkId;
		if (elObj.nodeInfo.elementType == 6000) {
			var conn = Ext.lib.Ajax.getConnectionObject().conn;
			conn.open("post",
					"/crossingConfigAction!findCrossingInfoRelateCameraId.action?crossLsh="
							+ elObj.nodeInfo.linkId, false);
			conn.send(null);
			cameraId = Ext.util.JSON.decode(conn.responseText).cameraId;
			if (cameraId == -1) {
				cms.ext.alert(' 错误', '没有关联通道,不能进行回放!');
			} else {
				this.curCameraId = cameraId;
				var i = 0;
				var interval = setInterval(function() {
							if (i == 1) {
								this.playbackWin.show();
								clearInterval(interval);
							}
							i++;
						}.createDelegate(this), 100);
			}
		} else if (elObj.nodeInfo.elementType == 5000
				|| elObj.nodeInfo.elementType == 5100) {// 车载或单兵
			cms.ext.alert(' 提示', '请选择相关通道进行回放!');
		} else {
			this.curCameraId = cameraId;
			i = 0;
			interval = setInterval(function() {
						if (i == 1) {
							this.playbackWin.show();
							clearInterval(interval);
						}
						i++;
					}.createDelegate(this), 100);
		}
	},
	createPlaybackWin : function() {
		var url = '/modules/emap_js/ctrl/playbackwin.jsp?cameraId='
				+ this.curCameraId;
		this.playbackWin = new Ext.Window({
			title : "回放",
			width : 800,
			height : 510,
			modal : true,
			border : false,
			bodyBorder : false,
			resizable : false,
			closeAction : 'hide',
			renderTo : Ext.getBody(),
			plain : true,
			html : '<iframe id="newIframeWin" src="'
					+ url
					+ '" scrolling="'
					+ 'auto'
					+ '" '
					+ ' style="position:absolute; visibility:inherit; top:0; left:0; width:100%; height:100%; z-index:100;"></iframe>',
			listeners : {
				hide : function() {
					document.frames("newIframeWin").destory();
				},
				beforeshow : function() {
					document.frames("newIframeWin")
							.setCameraId(this.curCameraId);
					document.frames("newIframeWin").initPage();
				}.createDelegate(this)
			}
		});
	},
	rectpreviewHandler : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-6-3 下午01:50:34
		 * @description:拉框预览
		 */
		// var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var cameraId = num;

		if (3000 == 6000) {
			var conn = Ext.lib.Ajax.getConnectionObject().conn;
			conn.open("post",
					"/crossingConfigAction!findCrossingInfoRelateCameraId.action?crossLsh="
							+ num, false);
			conn.send(null);
			cameraId = Ext.util.JSON.decode(conn.responseText).cameraId;
			if (cameraId == -1) {
				cms.ext.alert(' 错误', '没有关联通道,不能进行预览!');
			} else {
				var url = '/modules/emap_js/ctrl/playwin.jsp?cameraId='
						+ cameraId;
				cms.ext.openwin("winLanePreview", "as" + "预览", url, 800, 600,
						false);
			}
		} else if (123 == 5000) {
			cms.ext.alert(' 提示', '请选择相关通道进行预览!');
		} else {
			var eventObject = {
				eventCode : 'EmapEvent',
				sender : this,
				params : {
					operate : 'Preview',
					cameraId : cameraId
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}
	},
	rectplaybackHandler : function(num) {
		if (!this.playbackWin) {
			this.createPlaybackWin();
		}
		var cameraId = num;
		if (5000 == 6000) {
			var conn = Ext.lib.Ajax.getConnectionObject().conn;
			conn.open("post",
					"/crossingConfigAction!findCrossingInfoRelateCameraId.action?crossLsh="
							+ elObj.nodeInfo.linkId, false);
			conn.send(null);
			cameraId = Ext.util.JSON.decode(conn.responseText).cameraId;
			if (cameraId == -1) {
				cms.ext.alert(' 错误', '没有关联通道,不能进行回放!');
			} else {
				var url = '/modules/emap_js/ctrl/playbackwin.jsp?cameraId='
						+ cameraId;
				cms.ext.openwin("winLanePlayback", elObj.nodeInfo.name + "回放",
						url, 1000, 600, false);
			}
		} else if (5 == 5000) {
			cms.ext.alert(' 提示', '请选择相关通道进行回放!');
		} else {
			this.curCameraId = cameraId;
			var i = 0;
			var interval = setInterval(function() {
						if (i == 1) {
							this.playbackWin.show();
							clearInterval(interval);
						}
						i++;
					}.createDelegate(this), 100);
		}
	},
	updateElHandler : function() {
		document.getElementById("mapInfoImg").src.indexOf('open') > -1
				&& this.switchMapInfoRegion(1);
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		elObj && this.mapInfoRegion.updateNodeForm(elObj);
	},
	removeElHandler : function(elObj) {
		// var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		Ext.Msg.confirm('提示', '确实要删除' + elObj.nodename + '吗？',
				function(button) {
					if (button != "yes") {
						return;
					}
					Ext.Ajax.request({
								url : this.removeElUrl,
								success : this.removeElSuccess
										.createDelegate(this),
								failure : this.removeElFailure
										.createDelegate(this),
								params : {
									elementId : elObj.nodeid,
									elementName : elObj.nodename,
									elementType : elObj.nodeinfos.elementType
								}
							});
				}, this);

	},
	crossingAlarmInfoHandler : function(linkId) {
		var conn = Ext.lib.Ajax.getConnectionObject().conn;
		conn.open("post",
				"crossingConfigAction!findPictureServerInfo.action?crossLsh="
						+ linkId, false);
		conn.send(null);
		var responseText = Ext.util.JSON.decode(conn.responseText);
		var serverIp = responseText.serverIp;
		var serverPort = responseText.serverPort;
		var picURL = "http://" + serverIp + ":" + serverPort
				+ this.crossingAlarmpPicUrl;
		this.pic = new cms.form.PictureField({
					prefix : 'pic',
					initImgUrl : picURL,
					maxWidth : 410,
					maxHeight : 415,
					hideOptBtn : true
				});
		this.picInfoPanel = new Ext.Panel({
					style : 'padding-top:5px;',
					width : 270,
					height : 220,
					defaultType : 'textfield',
					labelAlign : 'left',
					labelWidth : 55,
					layout : 'form',
					border : false,
					items : [{
								fieldLabel : '报警时间',
								name : 'alarmTime',
								value : this.crossingAlarmTime,
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '车牌号',
								name : 'plateInfo',
								value : this.crossingAlarmPlateInfo,
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '速度',
								name : 'vehicleSpeed',
								value : this.crossingAlarmVehicleSpeed + "km/h",
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '类型',
								name : 'vehicleType',
								value : this.crossingAlarmVehicleType,
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '报警信息',
								name : 'alarmEventName',
								value : this.crossingAlarmEventName,
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '车牌类型',
								name : 'plateType',
								value : this.crossingAlarmpPlateType,
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '方向',
								name : 'directIndex',
								value : this.crossingAlarmDirectIndex,
								width : 125,
								readOnly : true
							}, {
								fieldLabel : '车道号',
								name : 'drivewayNumber',
								value : this.crossingAlarmDrivewayNumber,
								width : 125,
								readOnly : true
							}]
				});
		this.picPanel = new Ext.Panel({
					border : false,
					frame : false,
					layout : 'form',
					width : Ext.getBody().getWidth(),
					height : Ext.getBody().getHeight(),
					bodyStyle : 'overflow-x:hidden; overflow-y:auto',
					items : [{
								layout : 'column',
								border : false,
								items : [this.pic.getControl(),
										this.picInfoPanel]
							}]
				});
		var win = new Ext.Window({
					id : 'winShowPic',
					title : '报警信息',
					width : 615,
					height : 450,
					iframeMask : true,
					modal : true,
					border : false,
					bodyBorder : false,
					closable : true,
					closeAction : 'close',
					autoDestroy : true,
					resizable : false,
					plain : true,
					items : [this.picPanel]
				});
		win.show();
	},
	aroundQueryHandler : function(eg) {
		var eventObject = {
			eventCode : 'EmapEvent',
			sender : this,
			params : {
				operate : 'aroundQuery',
				eg : eg
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	startPointHandler : function(eg) {
		
			var eventObject = {
				eventCode : 'EmapEvent',
				sender : this,
				params : {
					operate : 'shortQuerys',
					eg : eg
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		
	},
	endPointHandler : function(eg) {
	
			var eventObject = {
				eventCode : 'EmapEvent',
				sender : this,
				params : {
					operate : 'shortQuerye',
					eg : eg
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		
	},
	barrierHandler : function(eg) {

			var eventObject = {
				eventCode : 'EmapEvent',
				sender : this,
				params : {
					operate : 'shortQueryb',
					eg : eg
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		
	},
	alarmHisHandler : function() {
		var eventObject = {
			eventCode : 'EmapEvent',
			sender : this,
			params : {
				operate : 'alarmHistroy',
				cameraId : this.elementItem.get(this.mapElPrefix
						+ this.elementId).nodeInfo.linkId
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	recentElHandler : function() {
		Ext.Ajax.request({
					url : this.recentElUrl,
					success : this.recentElSuccess.createDelegate(this),
					failure : this.recentElFailure.createDelegate(this),
					params : {
						XPos : this.mapApp.getMouseMapX(),
						YPos : this.mapApp.getMouseMapY()
					}
				});
	},
	recentElSuccess : function(response) {
		if ((response.status == 200 && response.statusText == "OK" && parseInt(
				response.responseText, 10)) > 0) {
			this.locationMapEl(response.responseText);
		}
	},
	recentElFailure : function(response) {
	},
	removeElSuccess : function(response) {
		if (response.status == 200 && response.statusText == "OK"
				&& response.responseText == '1') {
			var eventObject = {
				eventCode : 'EmapEvent',
				sender : this,
				params : {
					operate : 'removeElItem'
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}
	},
	removeElFailure : function(response) {

	},
	contextMenuHandler : function(item, event, eg) {
		var eventObject = {
			eventCode : 'EmapEvent',
			sender : this,
			params : {
				operate : item.code,
				item : item,
				eg : eg
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	changeCursor : function(domId, cursorUrl) {
		Ext.get(domId) && Ext.get(domId).on('mouseover', function() {
					arguments[1].style.cursor = cursorUrl;
				});
	},

	afterrenderHandler : function(comp) {
		this.cacheMap();
		this.initMapEle();
		this.initContextMenu();
		this.initMapInfoRegion();
		this.initEagle();
		var eventObject = {
			eventCode : 'EmapEvent',
			sender : this,
			params : {
				operate : "InitEmap",
				mapApp : this.mapApp
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);

	},
	vehiclealarmHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'vehiclealarm',
				crosslsh : elObj.nodeInfo.linkId
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	vehiclepassHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'vehiclepass',
				crosslsh : elObj.nodeInfo.linkId
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	alarmHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'alarm',
				crosslsh : elObj.nodeInfo.linkId

			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	cartrafficHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'cartraffic',
				crosslsh : elObj.nodeInfo.linkId

			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	crossstateHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'crossstate',
				crosslsh : elObj.nodeInfo.linkId
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	frequencyHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'frequency',
				crosslsh : elObj.nodeInfo.linkId
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	quyuElHandler : function() {
		this.switchMapInfoRegion(1);
	},
	bayintimeHandler : function() {
		var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'intime',
				crosslsh : elObj.nodeInfo.linkId,
				elementId : elObj.nodeInfo.id
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	ctrlContextMenu : function(elObj) {
		// var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		// mapMode 0:控制客户端（不可编辑） 1：配置客户端（可编辑）
		if (this.selectEl4RK) {
			/**
			 * @author zhangsl
			 * @date : 2011-5-17 上午10:22:02
			 * @description:只在卡口上显示交通右键菜单，监控点不显示。
			 */
			this.menuItem.get('bayonetsearchItem').hide();
			this.menuItem.get('carPreviewItem').hide();
			this.menuItem.get('bayintimeItem').hide();
			this.menuItem.get('addCameraItem').hide();
			this.menuItem.get('addIoInItem').hide();
			this.menuItem.get('addIoOutItem').hide();
			this.menuItem.get('addCarItem').hide();
			this.menuItem.get('addSimpleItem').hide();
			this.menuItem.get('addBayonetItem').hide();
			this.menuItem.get('searchCarContrailItem').hide();
			this.menuItem.get('quyuElItem').hide();
			this.menuItem.get('startPointItem').hide();
			this.menuItem.get('endPointItem').hide();
			this.menuItem.get('barrierItem').hide();		
			if (mapMode == 1) {
				this.menuItem.get('recentElItem').show();
				this.menuItem.get('aroundQueryItem').hide();
				this.menuItem.get('updateElItem').show();
				this.menuItem.get('removeElItem').show();
				this.menuItem.get('alarmHisItem').hide();
				this.menuItem.get('previewItem').hide();
				this.menuItem.get('playbackItem').hide();
			} else {
				if (elObj.nodeinfos == null) {
					return;
				}
				this.menuItem.get('previewItem').hide();
				this.menuItem.get('playbackItem').hide();
				if (elObj.nodeinfos.elementType == 6000) {
					// alert(elObj.nodeInfo.elementType);
					this.menuItem.get('bayonetsearchItem').show();
					this.menuItem.get('bayintimeItem').show();
					this.menuItem.get('previewItem').show();
					this.menuItem.get('playbackItem').show();
				} else if (elObj.nodeinfos.elementType == 5000) {
					this.menuItem.get('carPreviewItem').show();
				} else {
					this.menuItem.get('previewItem').show();
					this.menuItem.get('playbackItem').show();
				}
				this.menuItem.get('updateElItem').hide();
				this.menuItem.get('removeElItem').hide();
				this.menuItem.get('aroundQueryItem').hide();
				this.menuItem.get('alarmHisItem').show();
			}
		} else {
			if (mapMode == 1) {
				this.menuItem.get('recentElItem').hide();
				this.menuItem.get('aroundQueryItem').show();
				this.menuItem.get('addCameraItem').show();
				this.menuItem.get('searchCarContrailItem').hide();
				this.menuItem.get('addIoInItem').show();
				this.menuItem.get('addIoOutItem').show();
				this.menuItem.get('addCarItem').show();
				this.menuItem.get('addSimpleItem').show();
				this.menuItem.get('addBayonetItem').show();
				this.menuItem.get('alarmHisItem').hide();
				this.menuItem.get('quyuElItem').hide();
				this.menuItem.get('startPointItem').hide();
				this.menuItem.get('endPointItem').hide();
				this.menuItem.get('barrierItem').hide();
			} else {
				this.menuItem.get('quyuElItem').show();
				this.menuItem.get('addCameraItem').hide();
				this.menuItem.get('searchCarContrailItem').show();
				this.menuItem.get('addIoInItem').hide();
				this.menuItem.get('addIoOutItem').hide();
				this.menuItem.get('addCarItem').hide();
				this.menuItem.get('addSimpleItem').hide();
				this.menuItem.get('addBayonetItem').hide();
				this.menuItem.get('aroundQueryItem').show();
				if (ezQueryPort == "" || ezQueryPort == null) {
					this.menuItem.get('startPointItem').hide();
					this.menuItem.get('endPointItem').hide();
					this.menuItem.get('barrierItem').hide();
				} else {
					this.menuItem.get('startPointItem').show();
					this.menuItem.get('endPointItem').show();
					this.menuItem.get('barrierItem').show();
				}
				this.menuItem.get('alarmHisItem').hide();
			}
			this.menuItem.get('previewItem').hide();
			this.menuItem.get('playbackItem').hide();
			this.menuItem.get('updateElItem').hide();
			this.menuItem.get('removeElItem').hide();
			this.menuItem.get('bayonetsearchItem').hide();
			this.menuItem.get('carPreviewItem').hide();
			this.menuItem.get('bayintimeItem').hide();
		}

	},
	cacheMap : function() {
		this.mapApp = new EzMap(document.getElementById(this.mapDivId));
	},
	/**
	 * 
	 * @param {}
	 *            flag 0隐藏，1显示
	 */
	switchMapInfoRegion : function(flag) {
		if (parseInt(flag, 10) == 0) {
			if (/MSIE (5\.5|6)/.test(navigator.userAgent)) {
				document.getElementById("mapInfoImg").src = '/modules/emap_js/images/openDlgBtn.png';
				document.getElementById("mapInfoImg").oSrc = '/modules/emap_js/images/openDlgBtn.png';
			} else {
				document.getElementById("mapInfoImg").src = '/modules/emap_js/images/openDlgBtn.png';
			}
			Ext.get('MapInfoDiv').setHeight(14);
			Ext.get('MapInfoDiv').setWidth(14);
			this.mapInfoRegion && this.mapInfoPanel.hide();
		} else {
			if (/MSIE (5\.5|6)/.test(navigator.userAgent)) {
				document.getElementById("mapInfoImg").src = '/modules/emap_js/images/closeDlgBtn.png';
				document.getElementById("mapInfoImg").oSrc = '/modules/emap_js/images/closeDlgBtn.png';
			} else {
				document.getElementById("mapInfoImg").src = '/modules/emap_js/images/closeDlgBtn.png';
			}
			Ext.get('MapInfoDiv').setWidth(200);
			if (!this.mapInfoRegion) {
				// switch (parseInt(mapMode)) {// 0:控制客户端（不可编辑） 1：配置客户端（可编辑）
				// case 0 :
				Ext.get('MapInfoDiv').setHeight(200);
				this.mapInfoRegion = new cms.emap.ctrlClient({
							mapApp : this.mapApp,
							listeners : {
								CtrlClientEvent : this.ctrlClientHandler
										.createDelegate(this)
							}
						});
				// break;
				// case 1 :
				// Ext.get('MapInfoDiv').setHeight(200);
				// this.mapInfoRegion = new cms.emap.confClient({
				// listeners : {
				// ConfClientEvent : this.confClientHandler
				// .createDelegate(this)
				// }
				// });
				// break;
				// }
				this.mapInfoPanel = this.mapInfoRegion.getControl();
				this.mapInfoPanel.render('MapInfoDiv');
			}
			this.mapInfoPanel.show();
		}
	},
	initMapInfoRegion : function() {
		if (mapMode == 0) {
			var mapInfoStr = '<div id="MapInfoDiv" style="z-index:99;position:absolute;top:22px;right:0px;width:14px;height:14px;"><img  id="mapInfoImg" style="z-index:100;position:absolute;bottom:0px;left:0px;"  src="/modules/emap_js/images/openDlgBtn.png" border=0/></div>'
			document.getElementById(this.mapDivId).insertAdjacentHTML(
					'afterEnd', mapInfoStr);
			this.changeCursor('mapInfoImg', this.cursorHand);

			if (/MSIE (5\.5|6)/.test(navigator.userAgent)) {
				Ext.get('mapInfoImg').on('click', function() {
					document.getElementById("mapInfoImg").oSrc.indexOf('open') > -1
							? this.switchMapInfoRegion(1)
							: this.switchMapInfoRegion(0);
				}, this);
			} else {
				Ext.get('mapInfoImg').on('click', function() {
					document.getElementById("mapInfoImg").src.indexOf('open') > -1
							? this.switchMapInfoRegion(1)
							: this.switchMapInfoRegion(0);
				}, this);
			}
		}
	},
	/**
	 * 初始化鹰眼
	 */
	initEagle : function() {
		var overViewStr = '<div id="eagleDiv" style="z-index:99;position:absolute;bottom:184px;right:184px;"><img id="eagleImg" src="/modules/emap_js/images/eagleHide.bmp" border=0/></div>';
		document.getElementById(this.mapDivId).insertAdjacentHTML('afterEnd',
				overViewStr);
		this.changeCursor('eagleImg', this.cursorHand);
		Ext.get('eagleImg').on('click', function() {
			if (document.getElementById("eagleImg").src.indexOf('Show') > -1) {
				this.mapApp.showOverView();
				document.getElementById("eagleDiv").style.bottom = '184px';
				document.getElementById("eagleDiv").style.right = '184px';
				document.getElementById("eagleImg").src = '/modules/emap_js/images/eagleHide.bmp';
			} else {
				this.mapApp.hideOverView();
				document.getElementById("eagleDiv").style.bottom = '0px';
				document.getElementById("eagleDiv").style.right = '0px';
				document.getElementById("eagleImg").src = '/modules/emap_js/images/eagleShow.bmp';
			}
		}, this);
		if (this.mapApp) {
			// this.mapApp.showMapControl();
			var uOverview = new OverView();
			uOverview.width = 200;
			uOverview.height = 200;
			uOverview.minLevel = 5;
			uOverview.maxLevel = 12;
			this.mapApp.hideCopyright();
			// this.mapApp.hideMapServer();
			this.mapApp.addOverView(uOverview);
			this.mapApp.showOverView();
			this.mapApp.showStandMapControl();
		}
	},
	/**
	 * 
	 * @param {}
	 *            elId 定位ID
	 * @param {}
	 *            scdId 辅助ID 根据最后一位参数决定意义
	 * @param {}
	 *            type 辅助ID说明字段辅助ID 当lType = 0 时lScdID为MapID，当lType =
	 *            1时lScdID为linkTypeId 即关联ID
	 */
	locationMapEl : function(elementId) {
		var elObj = this.elementItem.get(this.mapElPrefix + elementId);
		elObj.marker.flash();
		this.mapApp.recenterOrPanToLatLng(new Point(elObj.style.x,
				elObj.style.y));
	},
	locationMapElByLinkId : function(linkObj) {
		var selectObj = null;
		for (var index = 0, len = this.elementItem.count(); index < len; index++) {
			var elObj = this.elementItem.getByIndex(index);
			if (elObj.nodeInfo.linkId == linkObj.linkId
					&& elObj.nodeInfo.elementType == linkObj.elementType) {
				if (elObj.nodeInfo.elementType == 3000) {
					if (elObj.nodeInfo.elementSubType == linkObj.elementSubType) {
						selectObj = elObj;
					} else {
						continue;
					}
				} else {
					selectObj = elObj;
				}
			}
		}
		if (selectObj) {
			selectObj.marker.flash();
			this.mapApp.recenterOrPanToLatLng(new Point(selectObj.style.x,
					selectObj.style.y));
		}
	},
	abc : function(num) {
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'vehiclepass',
				crosslsh : num
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	abc1 : function(num1) {
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'vehiclealarm',
				crosslsh : num1
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	abc4 : function(num1, num2) {
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'intime',
				crosslsh : num1,
				elementId : num2
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	abc2 : function(num2) {
		this.rectpreviewHandler(num2)
	},
	abc3 : function(num3) {
		this.rectplaybackHandler(num3)
	},
	abc5 : function(num) {
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'cartraffic',
				crosslsh : num
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	abc6 : function(num) {
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'frequency',
				crosslsh : num
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	abc7 : function(num) {
		var eventObject = {
			eventCode : 'bayonetEvent',
			sender : this,
			params : {
				operate : 'crossstate',
				crosslsh : num
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	addNodeTomap : function(nodeInfo, style) {
		if (!this.mapApp)
			return;
		var pIcon = this.getIcon({
					elementType : nodeInfo.elementType,
					elementSubType : nodeInfo.elementSubType
				});
		var pt = new Point(style.x, style.y);
		var typename;
		switch (nodeInfo.elementType) {
			case 6000 :
				typename = top.crossingManageName + "类型";
				break;
			case 4000 :
				typename = "报警输入类型";
				break;
			case 4001 :
				typename = "报警输出类型";
				break;
			case 3000 :
				typename = "监控点类型";
				break;

		}
		var typesub
		// alert(nodeInfo.Point);
		switch (parseInt(nodeInfo.elementSubType)) {
			case 0 :
				typesub = "枪机";
				break;
			case 1 :
				typesub = "半球";
				break;
			case 2 :
				typesub = "快球";
				break;
			case 3 :
				typesub = "云台";
				break;
			default :
				typesub = "卡口";
				break;
		}
		if (nodeInfo.elementType == 5000) {
			typesub = "车载";
		}
		if (mapMode == 0) {
			var mkc = '<p/>'
					+ '<br/>'
					+ '<a id="zsl4" href="#"><b><font color="#1166cc">实时过车</font></b></a>  '
					+ '<a id="zsl1" href="#"><b><font color="#1166cc">违法查询</font></b></a>  '
					+ '<a id ="zsl" href="#"><b><font color="#1166cc">过车查询</font></b></a>  '
					+ '<p><br><a id ="zsl5" href="#"><b><font color="#1166cc">流量统计</font></b></a>  '
					+ '<a id ="zsl6" href="#"><b><font color="#1166cc">频度分析</font></b></a>  '
					+ '<a id ="zsl7" href="#"><b><font color="#1166cc">'
					+ top.crossingManageName + '状态</font></b></a>  ';
			var mkv = '<p/>'
					+ '<br/>'
					+ '<a id="zsl2" href="#"><b><font color="#1166cc">视频预览</font></b></a>  '
					+ '<a id="zsl3" href="#"><b><font color="#1166cc">视频回放</font></b></a>  ';
		} else {
			mkc = "";
			mkv = "";
		}
		if (nodeInfo.elementType == 6000) {
			var txt = "编号：" + nodeInfo.bianhao + '<p/>' + "车道数："
					+ nodeInfo.chedaoshu + '<p/>' + "限速值：" + nodeInfo.xiansu
					+ ' km/h' + mkc;

		} else if (nodeInfo.elementType == 5000) {
			var txt = '<p/>'
					+ '<br/>'
					+ '<a id="zslcar2" href="#"><b><font color="#1166cc">车载视频预览</font></b></a>';
		} else {
			var txt = "相机IP：" + nodeInfo.jiankongip + '<p/>' + "相机通道："
					+ nodeInfo.jiankongtongdao + mkv;
		}
		/**
		 * @author zhangsl
		 * @date : 2011-6-1 上午11:13:02
		 * @description:js时间格式化
		 */
		/*
		 * var day = new Date(); var Year = 0; var Month = 0; var Day = 0; var
		 * CurrentDate = ""; Year = day.getFullYear();// ie火狐下都可以 Month =
		 * day.getMonth() + 1; Day = day.getDate(); Hour = day.getHours();
		 * Minute = day.getMinutes(); Second = day.getSeconds(); CurrentDate +=
		 * Year + "年"; if (Month >= 10) { CurrentDate += Month + "月"; } else {
		 * CurrentDate += "0" + Month + "月"; } if (Day >= 10) { CurrentDate +=
		 * Day; } else { CurrentDate += "0" + Day; }
		 */
		var title = {
			fontSize : style.fontSize,
			fontColor : style.fontColor,
			bKGroundColor : style.bKGroundColor,
			bKTransparent : style.bKTransparent,
			text : '<p/>' + "名称：" + nodeInfo.name + '<p/>' + '<p/>' + "类型："
					+ typesub + '<p/>' + txt
		};
		var idObj = {
			div : this.divIdPrefix + this.mapElPrefix + nodeInfo.id,
			p : this.pIdPrefix + this.mapElPrefix + nodeInfo.id,
			img : this.imgIdPrefix + this.mapElPrefix + nodeInfo.id
		};
		var marker = this.createMapEl(idObj, pt, pIcon, title);
		this.mapApp.addOverlay(marker, true);
		Ext.get(idObj.div).on('mouseup', this.mouseupHandler, this);
		Ext.get(idObj.img).on('dblclick', function() {
			if (nodeInfo.elementType == 4000 || nodeInfo.elementType == 4100) {
				cms.ext.alert('提示', "不能进行预览！");
			}
			if (nodeInfo.elementType != 6000 && nodeInfo.elementType != 5000
					&& nodeInfo.elementType != 5100
					&& nodeInfo.elementType != 4000
					&& nodeInfo.elementType != 4100 && mapMode == 0) {
				var elObj = this.elementItem.get(this.getElId(arguments[1].id));
				this.elementId = elObj.nodeInfo.id;
				this.previewHandler();
			}
		}, this);
		Ext.get(idObj.img).on('click', function() {
			// this.mapApp.closeInfoWindow();
			var str = title.text;
			if (this.commonAlarmNodeId == nodeInfo.id) {
				str += '<br />' + this.commonAlarmEventName;
			}
			if (this.crossingAlarmNodeId == nodeInfo.id) {
				var place = this.crossingAlarmPlace == null
						? ''
						: this.crossingAlarmPlace
				str += '<br />' + "报警时间：" + this.crossingAlarmTime;
				str += '<br />' + "报警信息：" + this.crossingAlarmEventName;
				str += '<br />' + "车牌号：" + this.crossingAlarmPlateInfo;
				str += '<br />' + "速度：" + this.crossingAlarmVehicleSpeed
						+ "km/h";;
				str += '<br />' + "地点：" + place;
			}
			if (nodeInfo.elementType == 6000 && this.passTimeStrArray != ''
					&& this.elementIdArray != '') {
				// for (var i = 0, len = this.elementIdArray.length; i < len;
				// i++) {
				// if (this.elementIdArray[i] == nodeInfo.id) {
				// // str += '<br />' + this.passTimeStrArray[i];
				// }
				// }
			}
			if (nodeInfo.elementType == 5000 && this.gpsElObj != '') {
				pt = this.gpsElObj.marker.getPoint();
				flag = false;
			}
			if (nodeInfo.elementType == 5100 && this.gpsElObj != '') {
				pt = this.gpsElObj.marker.getPoint();
				flag = false;
			}
			if (this.curElId == nodeInfo.id && flag) {
				pt = new Point(this.curX, this.curY);
			}
			this.mapApp.openInfoWindow(pt, str);
			var elObj = this.elementItem.get(this.getElId(arguments[1].id));
			this.elementId = elObj.nodeInfo.id;
			if (clockmap.get('mapElement_' + this.elementId) != undefined) {
				clearInterval(clockmap.get('mapElement_' + this.elementId).clock);
				clockmap.remove('mapElement_' + this.elementId);
				var iconSrc = document.getElementById(elObj.idObj.img).src;
				iconSrc = iconSrc.substr(0, iconSrc.lastIndexOf('-'))
						+ '-online.png';
				document.getElementById(elObj.idObj.img).src = iconSrc;
				document.getElementById(elObj.idObj.p).style.backgroundColor = "#ffffff";
			}
			if (this.crossingAlarmNodeId == nodeInfo.id
					&& nodeInfo.elementType == 6000) {
				this.crossingAlarmInfoHandler(elObj.nodeInfo.linkId);
			}
			elclick = true;
		}, this);
		Ext.get(idObj.div).on('contextmenu', function() {
			this.mapApp.closeInfoWindow();
			if (this.mapApp.menuContainer
					&& this.mapApp.menuContainer.style.display != "none") {
				this.mapApp.menuContainer.style.display = "none";
			}
			this.selectEl4RK = true;
			var elObj = this.elementItem.get(this.getElId(arguments[1].id));
			this.elementId = elObj.nodeInfo.id;
		}, this);
		var flag = true;// 如果是车载或单兵报警了，就不取this.curX, this.curY,否则就给当前的点坐标添加元素提示
		// Ext.get(idObj.div).on('mouseover', function() {
		// var str = title.text;
		// if (this.commonAlarmNodeId == nodeInfo.id) {
		// str += '<br />' + this.commonAlarmEventName;
		// }
		// if (this.crossingAlarmNodeId == nodeInfo.id) {
		// var place = this.crossingAlarmPlace == null
		// ? ''
		// : this.crossingAlarmPlace
		// str += '<br />' + "报警时间：" + this.crossingAlarmTime;
		// str += '<br />' + "报警信息：" + this.crossingAlarmEventName;
		// str += '<br />' + "车牌号：" + this.crossingAlarmPlateInfo;
		// str += '<br />' + "速度：" + this.crossingAlarmVehicleSpeed
		// + "km/h";;
		// str += '<br />' + "地点：" + place;
		// }
		// if (nodeInfo.elementType == 6000 && this.passTimeStrArray != ''
		// && this.elementIdArray != '') {
		// // for (var i = 0, len = this.elementIdArray.length; i < len; i++) {
		// // if (this.elementIdArray[i] == nodeInfo.id) {
		// // // str += '<br />' + this.passTimeStrArray[i];
		// // }
		// // }
		// }
		// if (nodeInfo.elementType == 5000 && this.gpsElObj != '') {
		// pt = this.gpsElObj.marker.getPoint();
		// flag = false;
		// }
		// if (nodeInfo.elementType == 5100 && this.gpsElObj != '') {
		// pt = this.gpsElObj.marker.getPoint();
		// flag = false;
		// }
		// if (this.curElId == nodeInfo.id && flag) {
		// pt = new Point(this.curX, this.curY);
		// }
		// this.mapApp.openInfoWindow(pt, str);
		// }, this);
		Ext.get(idObj.div).on('mouseout', function() {
			if (elclick == true) {
				if (nodeInfo.elementType == 6000 && mapMode == 0
						&& Ext.get('zsl') != null) {
					Ext.get('zsl').on('click', function() {
								this.abc(nodeInfo.linkId);
							}, this);
					Ext.get('zsl1').on('click', function() {
								this.abc1(nodeInfo.linkId);
							}, this);
					Ext.get('zsl4').on('click', function() {
								if (bayclick == true) {
									bayclick = false;
									this.abc4(nodeInfo.linkId, nodeInfo.id);
								}
							}, this);
					Ext.get('zsl5').on('click', function() {
								this.abc5(nodeInfo.linkId);
							}, this);
					Ext.get('zsl6').on('click', function() {
								this.abc6(nodeInfo.linkId);
							}, this);
					Ext.get('zsl7').on('click', function() {
								this.abc7(nodeInfo.linkId);
							}, this);
				} else if (nodeInfo.elementType == 5000 && mapMode == 0
						&& Ext.get('zslcar2') != null) {
					Ext.get('zslcar2').on('click', function() {
								this.getGPSInfoWin(nodeInfo.id);
							}, this);
				} else if (mapMode == 0 && Ext.get('zsl2') != null) {
					Ext.get('zsl2').on('click', function() {
								this.abc2(nodeInfo.linkId);
							}, this);
					Ext.get('zsl3').on('click', function() {
								this.abc3(nodeInfo.linkId);
							}, this);
				}
				elclick = false;
			}
		}, this);
		Ext.get(idObj.div).on('dblclick', function() {
					this.mapApp.closeInfoWindow();
					// 如果是卡口，弹出信息框
					if (nodeInfo.elementType == 6000 && mapMode == 0) {
						this.getBayonetInfoWin(nodeInfo.id);
					}
					if (nodeInfo.elementType == 5000) {
						this.getGPSInfoWin(nodeInfo.id);
					}
					if (nodeInfo.elementType == 5100) {
						this.getGPSInfoWin(nodeInfo.id);
					}
				}, this);

		mapMode == 1 && marker.enableEdit();
		this.elementItem.add(this.mapElPrefix + nodeInfo.id, {
					nodeInfo : nodeInfo,
					style : style,
					marker : marker,
					idObj : idObj
				});
	},
	getElId : function(id) {
		if (id.startsWith(this.pIdPrefix)) {
			return id.removeStart(this.pIdPrefix);
		} else if (id.startsWith(this.divIdPrefix)) {
			return id.removeStart(this.divIdPrefix);
		} else if (id.startsWith(this.imgIdPrefix)) {
			return id.removeStart(this.imgIdPrefix);
		}
	},
	createMapEl : function(idObj, point, icon, title) {
		var bkColor = '';
		if (title.bKTransparent == 0) {
			bkColor = 'background-color:' + title.bKGroundColor;
		}
		var uHTMLOverLay1 = new HTMLElementOverLay(idObj.div, point, '<p id="'
						+ idObj.p
						// + '"
						// style="position:absolute;top:-36px;left:-50;color:'
						// + title.fontColor
						// + ';padding:3px 10px;border:1px solid
						// black;font-size:'
						// + title.fontSize + 'px;' + bkColor
						+ '" >'
						// + title.text
						+ '</p><img id="' + idObj.img + '" src="' + icon.image
						+ '" width="' + icon.width + '" height="' + icon.height
						+ '" style="position:absolute;top:-10px;left:-10px;">');
		return uHTMLOverLay1;
	},
	mouseupHandler : function() {
		if (mapMode == 1) {
			this.mapApp.closeInfoWindow();
			var elObj = this.elementItem.get(this.getElId(arguments[1].id));
			if (elObj) {
				if (elObj.style.x == this.mapApp.getMouseMapX()
						&& elObj.style.y == this.mapApp.getMouseMapY())
					return;
				var shapeXml = '<Shape><ShapeType>Point</ShapeType><Point><X>'
						+ this.mapApp.getMouseMapX() + '</X><Y>'
						+ this.mapApp.getMouseMapY() + '</Y></Point></Shape>';
				this.elementId = elObj.nodeInfo.id;
				this.curX = this.mapApp.getMouseMapX();
				this.curY = this.mapApp.getMouseMapY();
				this.curElId = elObj.nodeInfo.id;
				Ext.Ajax.request({
							url : this.upDatePosUrl,
							success : this.updatePosSuccess
									.createDelegate(this),
							failure : this.updatePosFailure
									.createDelegate(this),
							params : {
								elementId : elObj.nodeInfo.id,
								latitude : this.mapApp.getMouseMapY(),
								longitude : this.mapApp.getMouseMapX(),
								shapeXml : shapeXml
							}
						});
			}
		}
	},
	confClientHandler : function(event) {
		var elObj = event.params.elObj;
		var p = Ext.get(this.pIdPrefix + this.mapElPrefix + elObj.nodeInfo.id);
		p.setStyle('color', elObj.style.fontColor);
		p.setStyle('font-size', elObj.style.fontSize);
		if (elObj.style.bKTransparent == 0) {
			p.setStyle('background-color', elObj.style.bKGroundColor);
		} else {
			p.setStyle('background-color', '');
		}
		var elObj_old = this.elementItem.get(this.mapElPrefix
				+ elObj.nodeInfo.id);
		elObj_old.style.fontColor = elObj.style.fontColor;
		elObj_old.style.fontSize = elObj.style.fontSize;
		elObj_old.style.bKGroundColor = elObj.style.bKGroundColor;
		elObj_old.style.bKTransparent = elObj.style.bKTransparent;

	},
	ctrlClientHandler : function() {

	},
	updatePosSuccess : function(response) {
		if (response.status == 200 && response.statusText == "OK"
				&& response.responseText == '1') {
			var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
			elObj.style.x = this.mapApp.getMouseMapX();
			elObj.style.y = this.mapApp.getMouseMapY();
		} else {
			cms.ext.alert('提示', '更新失败!');
		}
	},
	updatePosFailure : function(response) {
		cms.ext.alert('提示', '更新失败!');
	},
	/**
	 * { elements:els, operate : event.params.operate, style : event.params.data }
	 * 
	 * @param {}
	 *            params
	 */
	addNodeHandler : function(data) {
		for (var index = 0, len = data.elements.length; index < len; index++) {
			var el = data.elements[index];
			var id = el.id;
			var linkId = el.linkId;
			var name = el.name;
			var font = "宋体";
			var fontPos = 5;
			var x = data.pos.x;
			var y = data.pos.y;
			var fontSize = data.style.fontSize;
			var fontColor = data.style.fontColor;
			var bKGroundColor = data.style.bKGroundColor;
			var bKTransparent = data.style.bKTransparent == 0 ? false : true;
			var nodeInfo = {}, style = {};
			nodeInfo.elementType = el.elementType;
			nodeInfo.elementSubType = el.elementSubType;
			nodeInfo.name = name;
			nodeInfo.id = id;
			nodeInfo.linkId = linkId;
			style.x = x;
			style.y = y;
			style.fontSize = fontSize;
			style.fontColor = fontColor;
			style.bKGroundColor = bKGroundColor;
			style.bKTransparent = bKTransparent;
			style.font = font;
			this.addNodeTomap(nodeInfo, style);
		}
		this.updateStatisticsHandler();
		this.mapApp.clearOverlays(true);
		this.initMapEle();
	},

	initMapEle : function() {
		Ext.Ajax.request({
					url : this.initUrl,
					params : {
						elementType : this.thematicType,
						eleadd : this.thematicType
					},
					success : this.initELeSuccess.createDelegate(this),
					failure : this.initELeFailure.createDelegate(this)
				});
	},
	/**
	 * 反转字符串工具类
	 */
	reverseString : function(color) {
		var rlt = '';
		for (var index = color.length - 1; index >= 0; --index) {
			rlt += color.substring(index, index + 1);
		}
		return rlt;
	},
	decodeC : function(number) {
		var dec = parseFloat(number);
		var hex = dec.toString(16).toUpperCase();
		var color = this.reverseString(hex);
		var comColor = color;
		for (var index = 0; index < 6 - color.length; index++) {
			comColor += '0';
		}
		return comColor;
	},
	initELeSuccess : function(response) {
		if (response.status == 200 && response.statusText == "OK") {
			if (response.responseText == '')
				return;
			var elObj = Ext.decode(response.responseText);
			for (var index = 0, len = elObj.emapElements.length; index < len; index++) {
				var el = elObj.emapElements[index];
				var id = el.elementId;
				var linkId = el.linkId;
				var name = el.elementName;
				var font = "宋体";
				var fontPos = 5;
				var shapeJson = Ext.decode(el.shapeXml);
				var x = shapeJson.Point.X;
				var y = shapeJson.Point.Y;
				var revJson = Ext.decode(el.xmlRev);
				var fontSize = revJson.Font.FontSize;
				var fontColor = this.decodeC(revJson.Font.FontColor);
				var bKGroundColor = this.decodeC(revJson.BKGroundColor);
				var bKTransparent = revJson.BKTransparent;
				var nodeInfo = {}, style = {};
				nodeInfo.elementType = el.elementType;
				nodeInfo.elementSubType = el.elementSubType;
				nodeInfo.name = name;
				nodeInfo.id = id;
				nodeInfo.linkId = linkId;
				nodeInfo.chedaoshu = el.chedaoshu;
				nodeInfo.bianhao = el.bianhao;
				nodeInfo.xiansu = el.xiansu;
				nodeInfo.jiankongip = el.jiankongip;
				nodeInfo.jiankongtongdao = el.jiankongtongdao;
				style.x = x;
				style.y = y;
				style.fontSize = fontSize;
				style.fontColor = fontColor;
				style.bKGroundColor = bKGroundColor;
				style.bKTransparent = bKTransparent;
				style.font = font;
				this.addNodeTomap(nodeInfo, style);
			}
			this.updateStatisticsHandler();
		}
	},
	updateStatisticsHandler : function() {

		var cameraTotal = 0, ioInTotal = 0, ioOutTotal = 0, carTotal = 0, simpleTotal = 0, bayonetTotal = 0;

		for (var index = 0, len = this.elementItem.count(); index < len; index++) {
			var elObj = this.elementItem.getByIndex(index);
			switch (parseInt(elObj.nodeInfo.elementType)) {
				case 3000 :
					cameraTotal++;
					break;
				case 4000 :
					ioInTotal++;
					break;
				case 4100 :
					ioOutTotal++;
					break;
				case 5000 :
					carTotal++;
					break;
				case 5100 :
					simpleTotal++;
					break;
				case 6000 :
					bayonetTotal++;
					break;
			}
		}
		var eventObject = {
			eventCode : 'EmapEvent',
			sender : this,
			params : {
				operate : 'UpdateStatistics',
				statObj : {
					cameraTotal : cameraTotal,
					ioInTotal : ioInTotal,
					ioOutTotal : ioOutTotal,
					carTotal : carTotal,
					simpleTotal : simpleTotal,
					bayonetTotal : bayonetTotal
				}
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);

	},
	initELeFailure : function(response) {
		cms.ext.alert('提示', '初始化失败!');
	},
	getIcon : function(type) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-20 上午10:00:18
		 * @description:区分半球枪机图标
		 */
		var elementSubType;
		var icon = {};
		icon.height = 18;
		icon.width = 18;
		switch (parseInt(type.elementType)) {
			case 3000 :// camera
				elementSubType = type.elementSubType;
				if (elementSubType == 0) {// 枪机
					icon.image = "/skin/blue/images/common/tree/gun-camera-online.png";
				} else if (elementSubType == 1) {// 半球
					icon.image = "/skin/blue/images/common/tree/half-ball-online.png";
				} else if (elementSubType == 2) {// 快球
					icon.image = "/skin/blue/images/common/tree/fast-ball-online.png";
				} else if (elementSubType == 3) {// 云台
					icon.image = "/skin/blue/images/common/tree/ptz-online.png";
				}
				break;
			case 4000 :// 报警输入
				icon.image = "/skin/blue/images/common/tree/alarm-in.png";
				break;
			case 4100 :// 报警输出
				icon.image = "/skin/blue/images/common/tree/alarm-out.png";
				break;
			case 5000 :// 车载
				icon.image = "/skin/red/images/common/tree/car-online.png";
				break;
			case 5100 :// 单兵
				icon.image = "/skin/red/images/common/tree/db-online.png";
				break;
			case 6000 :// 卡口
				icon.image = "/skin/red/images/common/tree/bayonet-online.png";
				break;
		}
		return icon;
	},
	searchMapEl : function(keyObj) {

	},
	disVideo : function(params) {
		mapMode == 0 ? this.ocxDom.Fun_OpPlugInAction(2001, params.id,
				params.data) : this.ocxDom
				.Fun_SetRequestData(2001, params.data);
	},
	alarmInfoPanel : function(alarmEventName, nodeId, elementId, elObj) {
		this.commonAlarmEventName = alarmEventName;
		this.commonAlarmNodeId = nodeId;
		Ext.get(this.divIdPrefix + this.mapElPrefix + nodeId).on('click',
				function(e) {
					elObj.marker.openInfoWindowHtml(alarmEventName);
				}, this);
	},
	crossingInfoPanel : function(alarmTime, alarmEventName, vehicleSpeed,
			alarmPlace, plateInfo, vehicleType, plateType, directIndex,
			drivewayNumber, picUrl, nodeId, elObj) {
		this.crossingAlarmTime = alarmTime;
		this.crossingAlarmEventName = alarmEventName;
		this.crossingAlarmVehicleSpeed = vehicleSpeed;
		this.crossingAlarmPlace = alarmPlace;
		this.crossingAlarmPlateInfo = plateInfo;
		this.crossingAlarmVehicleType = vehicleType;
		this.crossingAlarmpPlateType = plateType;
		this.crossingAlarmDirectIndex = directIndex;
		this.crossingAlarmDrivewayNumber = drivewayNumber;
		this.crossingAlarmpPicUrl = picUrl;
		this.crossingAlarmNodeId = nodeId;
		Ext.get(this.divIdPrefix + this.mapElPrefix + nodeId).on('click',
				function(e) {
					var str = "";
					str += '<br />' + alarmTime;
					str += '<br />' + alarmEventName;
					str += '<br />' + plateInfo;
					str += '<br />' + vehicleSpeed;
					str += '<br />' + alarmPlace;
					elObj.marker.openInfoWindowHtml(str);
				}, this);
	},
	getBayonetInfoWin : function(elementId) {
		var othis = this;
		Ext.Ajax.request({
			url : 'crossingConfigAction!findCrossingByElementId.action',
			params : {
				elementId : elementId
			},
			success : function(response) {
				var jsonResult = Ext.util.JSON.decode(response.responseText);
				var crossingIndex = jsonResult[0].crossingIndex;
				var crossingIp = jsonResult[0].crossingIp;
				var drivewayNum = jsonResult[0].drivewayNum;
				var longitude = jsonResult[0].longitude;
				var crossingName = jsonResult[0].crossingName;
				var crossingPort = jsonResult[0].crossingPort;
				var speedLimit = jsonResult[0].speedLimit;
				var latitude = jsonResult[0].latitude;
				var cameraId = jsonResult[0].cameraId;
				var confFlag = parseInt(jsonResult[0].fronttype) == 1
						? true
						: false;
				var ip = parseInt(jsonResult[0].fronttype) == 1 ? '' : 'IP地址';
				var port = parseInt(jsonResult[0].fronttype) == 1 ? '' : '端口';
				var bayPreviewBtn = new Ext.Button({
							text : top.crossingManageName + '预览',
							width : 140,
							handler : function() {
								if (cameraId == -1) {
									cms.ext.alert(' 错误', '没有关联通道,不能进行预览!');
								} else {
									othis.rectpreviewHandler(cameraId);
								}
							}
						});

				var bayPlaybackBtn = new Ext.Button({
							text : top.crossingManageName + '回放',
							width : 140,
							handler : function() {
								if (cameraId == -1) {
									cms.ext.alert(' 错误', '没有关联通道,不能进行回放!');
								} else {
									othis.rectplaybackHandler(cameraId);
								}
							}
						});
				var bayInfoPanel = new Ext.FormPanel({
					width : '100%',
					height : 135,
					labelWidth : 45,
					border : false,
					frame : false,
					items : [{
						layout : 'column',
						frame : false,
						border : false,
						items : [{
									style : 'padding:3px 0px 0px 3px',
									frame : false,
									border : false,
									columnWidth : .5,
									labelAlign : 'left',
									layout : 'form',
									defaultType : 'textfield',
									items : [{
												fieldLabel : '编&nbsp;&nbsp;&nbsp;号',
												name : 'crossingIndex',
												value : crossingIndex,
												width : 85,
												readOnly : true
											}, {
												fieldLabel : '车道数',
												name : 'drivewayNum',
												value : drivewayNum,
												width : 85,
												readOnly : true
											}, {
												fieldLabel : '经&nbsp;&nbsp;&nbsp;度',
												name : 'longitude',
												value : longitude,
												width : 85,
												readOnly : true
											}, {
												fieldLabel : ip,
												name : 'crossingIp',
												value : crossingIp,
												hidden : confFlag,
												width : 85,
												readOnly : true
											}]
								}, {
									style : 'padding:3px 0px 0px 3px',
									frame : false,
									border : false,
									columnWidth : .5,
									labelAlign : 'left',
									layout : 'form',
									defaultType : 'textfield',
									items : [{
												fieldLabel : '名称',
												name : 'crossingName',
												value : crossingName,
												width : 85,
												readOnly : true
											}, {
												fieldLabel : '限速',
												name : 'speedLimit',
												value : speedLimit + 'km/h',
												width : 85,
												readOnly : true
											}, {
												fieldLabel : '纬度',
												name : 'latitude',
												value : latitude,
												width : 85,
												readOnly : true
											}, {
												fieldLabel : port,
												name : 'crossingPort',
												value : crossingPort,
												hidden : confFlag,
												width : 85,
												readOnly : true
											}]
								}]
					}, {
						style : 'padding:0px 0px 0px 3px',
						frame : false,
						border : false,
						layout : 'column',
						labelAlign : 'left',
						items : [{
									frame : false,
									border : false,
									columnWidth : .5,
									items : [bayPreviewBtn]
								}, {
									frame : false,
									border : false,
									columnWidth : .5,
									items : [bayPlaybackBtn]
								}]
					}]
				});
				var laneCm = new Ext.grid.ColumnModel({
							columns : [new Ext.grid.RowNumberer(), {
										header : '车道名称',
										dataIndex : 'laneName',
										align : 'center',
										width : 150
									}, {
										header : '预览',
										dataIndex : 'preview',
										align : 'center',
										width : 75,
										css : 'color:blue;cursor:hand;'
									}, {
										header : '回放',
										dataIndex : 'playback',
										align : 'center',
										width : 75,
										css : 'color:blue;cursor:hand;'
									}, {
										header : 'cameraId',
										dataIndex : 'cameraId',
										align : 'center',
										width : 150,
										hidden : true
									}]
						});
				var laneStore = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
						url : 'crossingConfigAction!findCameraInfoByCrossingId.action'
					}),
					reader : new Ext.data.JsonReader({
								totalProperty : 'total',
								root : 'crossingInfoCamras',
								successProperty : 'success'
							}, [{
										name : 'laneName',
										mapping : "laneName",
										type : 'string'
									}, {
										name : 'cameraId',
										mapping : "cameraId",
										type : 'string'
									}, {
										name : 'preview',
										mapping : "preview",
										type : 'string'
									}, {
										name : 'playback',
										mapping : "playback",
										type : 'string'
									}])
				});
				laneStore.load({
							params : {
								elementId : elementId
							}
						});
				var laneGrid = new Ext.grid.GridPanel({
							height : 240,
							width : '100%',
							title : '车道信息',
							cm : laneCm,
							ds : laneStore,
							region : 'center',
							border : false,
							columnLines : true,
							autoScroll : true,
							trackMouseOver : true,
							stripeRows : true,
							loadMask : true,
							viewConfig : {
								forceFit : true
							},
							listeners : {
								cellclick : this.cellclickEventHandler
										.createDelegate(this)
							}
						});
				var elObj = this.elementItem.get(this.mapElPrefix
						+ this.elementId);
				var bayInfoWin = new Ext.Window({
							title : elObj.nodeInfo.name + '信息',
							resizable : false,
							frame : true,
							border : false,
							width : 300,
							height : 410,
							layout : 'form',
							modal : true,
							items : [bayInfoPanel, laneGrid]
						});
				bayInfoWin.show();

			}.createDelegate(this),
			failure : function(response) {
				cms.ext.alert(' 错误', '查询失败!');
			}
		}, this);
	},
	getGPSInfoWin : function(elementId) {
		var gpsCm = new Ext.grid.ColumnModel({
					columns : [new Ext.grid.RowNumberer(), {
								header : '通道名称',
								dataIndex : 'cameraName',
								align : 'center',
								width : 150
							}, {
								header : '预览',
								dataIndex : 'preview',
								align : 'center',
								width : 75,
								css : 'color:blue;cursor:hand;',
								renderer : function() {
									return "预览";
								}
							}, {
								header : '回放',
								dataIndex : 'playback',
								hidden : true,
								align : 'center',
								width : 75,
								css : 'color:blue;cursor:hand;',
								renderer : function() {
									return "回放";
								}
							}, {
								header : 'cameraId',
								dataIndex : 'cameraId',
								align : 'center',
								width : 150,
								hidden : true
							}]
				});
		var gpsStore = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : 'cameraInfo!findCamerasByElementId.action'
							}),
					reader : new Ext.data.JsonReader({
								totalProperty : 'total',
								root : 'gpsInfoCamras',
								successProperty : 'success'
							}, [{
										name : 'cameraName',
										mapping : "cameraName",
										type : 'string'
									}, {
										name : 'cameraId',
										mapping : "cameraId",
										type : 'string'
									}])
				});
		gpsStore.load({
					params : {
						elementId : elementId
					}
				});
		var gpsGrid = new Ext.grid.GridPanel({
					height : 280,
					width : '100%',
					cm : gpsCm,
					ds : gpsStore,
					region : 'center',
					border : false,
					columnLines : true,
					autoScroll : true,
					trackMouseOver : true,
					stripeRows : true,
					loadMask : true,
					viewConfig : {
						forceFit : true
					},
					listeners : {
						cellclick : this.cellclickEventHandler
								.createDelegate(this)
					}
				});
		// var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		var gpsInfoWin = new Ext.Window({
					title : /* elObj.nodeInfo.name + */'通道信息',
					resizable : false,
					frame : true,
					border : false,
					width : 300,
					height : 290,
					layout : 'form',
					modal : true,
					items : [gpsGrid]
				});
		gpsInfoWin.show();
	},
	cellclickEventHandler : function(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var cameraId = record.get(grid.getColumnModel().getDataIndex(4));
		if (columnIndex == 2) {// 预览
			if (cameraId == -1) {
				cms.ext.alert(' 错误', '没有关联通道,不能进行预览!');
			} else {
				var eventObject = {
					eventCode : 'EmapEvent',
					sender : this,
					params : {
						operate : 'Preview',
						cameraId : cameraId
					}
				};
				this.fireEvent(eventObject.eventCode, eventObject);
			}
		} else if (columnIndex == 3) {// 回放
			if (cameraId == -1) {
				cms.ext.alert(' 错误', '没有关联通道,不能进行回放!');
			} else {
				this.curCameraId = cameraId;
				var i = 0;
				var interval = setInterval(function() {
							if (i == 1) {
								this.playbackWin.show();
								clearInterval(interval);
							}
							i++;
						}.createDelegate(this), 100);
			}
		}
	},
	setThematicType : function(thematicType) {
		this.thematicType = thematicType;
	}

});
