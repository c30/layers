/**
 * @description 导航器
 * @date 2011/05/16
 * @author zhangsl
 */
Ext.namespace('cms.emap');
cms.emap.navigate = function(config) {
	this.emapTreeUrl = '/gisAction!getEmapData.action';
	cms.emap.navigate.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.navigate, Ext.ux.BaseControl, {
	showWinFn : top.showmodal,
	allPanel : undefined,
	path : '',
	mapId : undefined,
	emapTreeLoader : undefined,
	ioTree : undefined,
	cameraTree : undefined,
	emapTree : undefined,
	mapNodePrefix : 'emapInfo_',
	elementNodePrefix : 'emapEleInfo_',
	ioInPrefix : 'ioInInfo_',
	ioOutPrefix : 'ioOutInfo_',
	cameraPrefix : 'cameraInfo_',
	carPrefix : 'carInfo_',
	simplePrefix : 'simpleInfo_',
	eMapBaseParams : {},
	nodeParams : undefined,
	mappanel : undefined,
	newNodeList : [],
	timesta : "1",
	objXml : undefined,
	disVideoId : undefined,
	newNodeMap : new cms.framework.map(),
	taskState : undefined,
	trapanel : undefined,
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		// this.emaptreename();//.createDelegate(this);
		this.createEmapTreeLoader();
		this.createEmapTree();
		var confFlag = parseInt(mapMode, 10) == 1 ? true : false;
		// Ext.getCmp('emapTree').hidden();
		this.createCameraTree();
		// this.createIoTree();
		/**
		 * @author zhangsl
		 * @date : 2011-6-9 下午02:03:08
		 * @description:查询列表
		 */
		this.brandNo = new Ext.form.TextField({
					fieldLabel : '车牌号码',
					name : 'brandNo',
					width : 145,
					allowBlank : false,
					selectOnFocus : true
				});
		this.crotext = new Ext.form.TextField({
					// emptyText : '*或？模糊查询',
					width : 94,
					maxLength : 15,
					maskRe : new RegExp("[^(/:;,.#$&*?^!@'\"<>|%_\\\\)]"),
					hideLabel : true
				});
		this.croCmb = new Ext.form.ComboBox({
					width : 45,
					minListWidth : 50,
					name : 'croCmb',
					valueField : 'id',
					displayField : 'value',
					value : '浙',
					selectOnFocus : true,
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					fieldLabel : '车牌号码',
					store : new Ext.data.SimpleStore({
								fields : ['id', 'value'],
								data : BAYONET_PLATE_NO_PRE_NO_ALL
							})
				});
		this.startTime = new cms.form.DateFieldCtrl({
					name : 'startTime',
					width : 145,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.stopTime = new cms.form.DateFieldCtrl({
					name : 'stopTime',
					width : 145,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.store = new Ext.data.SimpleStore({
					proxy : new Ext.ux.data.PagingMemoryProxy(shuzu1),
					fields : [{
								name : 'passTimeStr',
								type : 'string'
							}, {
								name : 'crossingname',
								type : 'string'
							}, {
								name : 'vehicleLsh',
								type : 'int'
							}]

				});
		var cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : false
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '过车时间',
								dataIndex : 'passTimeStr',
								align : 'center',
								width : 114
							}, {
								header : top.crossingManageName + '名称',
								dataIndex : 'crossingname',
								align : 'center',
								width : 90
							}, {
								header : '过车流水号',
								dataIndex : 'vehicleLsh',
								hidden : true
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({
			title : '搜索结果',
			ds : this.store,
			height : document.body.clientHeight - 285,
			// autoHeight:true,
			cm : cm,
			viewConfig : {
				forceFit : true
			},
			// view : new Ext.ux.grid.BufferView({
			// rowHeight : 20,
			// scrollDelay : false
			// }),
			border : false,
			columnLines : false,
			frame : false,
			autoScroll : true,
			trackMouseOver : true,
			loadMask : true,
			id : 'vehicleguiji',
			stripeRows : true,
			bbar : new Ext.PagingToolbar({
						pageSize : 100,
						store : this.store,
						displayInfo : false
					})
				// listeners : {
				// rowclick : this.locationMapEL
				// }
			});
		this.resultPanel.on('rowdblclick', function(grid, rowIndex, event) {
					var vehicleLsh = grid.getStore().getAt(rowIndex)
							.get('vehicleLsh');
					getCarDetailInfoWin(vehicleLsh, "vehicleguiji", "100", 0);
				});
		this.btnSearch = new Ext.Button({
					width : 66,
					text : '查询',
					handler : function() {
						if (this.gpsCheck.getValue()) {
							this.trafuncar()
						} else {
							this.trafun();
						}
					}.createDelegate(this)

				});
		this.traCheck = new Ext.form.Checkbox({
					boxLabel : "实时轨迹",
					hideLabel : true,
					checked : false,
					listeners : {
						'check' : this.traHandler.createDelegate(this)
					}
				});
		this.gpsCheck = new Ext.form.Checkbox({
					boxLabel : "车载",
					hideLabel : true,
					checked : false,
					listeners : {
						'check' : this.gpsHandler.createDelegate(this)
					}
				});
		this.trapanel = new Ext.form.FormPanel({
					// width : 200,
					// height : 245,
					border : false,
					items : [{
						layout : 'form',
						style : 'padding:4px 0px 0px 0px',
						border : false,
						frame : false,
						labelAlign : 'right',
						labelWidth : 65,
						items : [{
									layout : 'column',
									// columnWidth : .78,
									border : false,
									frame : false,
									defaults : {
										labelWidth : 65,
										layout : 'form',
										border : false,
										frame : false
									},
									items : [{
												columnWidth : .545,
												items : [this.croCmb]
											}, {
												columnWidth : .455,
												items : [this.crotext]
											}]
								}, this.startTime.getControl(),
								this.stopTime.getControl(), {
									layout : 'column',
									border : false,
									frame : false,
									items : [{
												width : 9,
												border : false
											}, this.traCheck, {
												width : 60,
												border : false
											}, /* this.gpsCheck, */{
												width : 16,
												border : false
											}, this.btnSearch]
								}, this.resultPanel]
					}]

				});
		/**
		 * @author : zhangsl
		 * @date : 2011-11-19 下午2:47:42
		 * @description:车载设备
		 */
		this.brandNo1 = new Ext.form.TextField({
					fieldLabel : '车牌号码',
					name : 'brandNo1',
					width : 160,
					allowBlank : false,
					selectOnFocus : true
				});
		this.crotext1 = new Ext.form.TextField({
					// emptyText : '*或？模糊查询',
					width : 100,
					maxLength : 15,
					maskRe : new RegExp("[^(/:;,.#$&*?^!@'\"<>|%_\\\\)]"),
					hideLabel : true
				});
		this.croCmb1 = new Ext.form.ComboBox({
					width : 50,
					minListWidth : 50,
					name : 'croCmb1',
					valueField : 'id',
					displayField : 'value',
					value : '浙',
					selectOnFocus : true,
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					fieldLabel : '车牌号码',
					store : new Ext.data.SimpleStore({
								fields : ['id', 'value'],
								data : BAYONET_PLATE_NO_PRE_NO_ALL
							})
				});
		this.startTime1 = new cms.form.DateFieldCtrl({
					name : 'startTime1',
					width : 160,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.stopTime1 = new cms.form.DateFieldCtrl({
					name : 'stopTime1',
					width : 160,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.store1 = new Ext.data.Store({
					proxy : new Ext.ux.data.PagingMemoryProxy(shuzu1),
					reader : new Ext.data.ArrayReader({}, [{
										name : 'createTime',
										type : 'string'
									}, {
										name : 'speed',
										type : 'string'
									}])

				});
		var cm1 = new Ext.grid.ColumnModel({
					defaults : {
						sortable : false
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '过车时间',
								dataIndex : 'createTime',
								align : 'center',
								width : 139
							}, {
								header : '速度(km/h)',
								dataIndex : 'speed',
								align : 'center',
								width : 70
							}]
				});
		this.resultPanel1 = new Ext.grid.GridPanel({
			title : '搜索结果',
			ds : this.store1,
			height : cms.util.getBodyHeight() - 138,
			// autoHeight:true,
			cm : cm1,
			viewConfig : {
				forceFit : true
			},
			// view : new Ext.ux.grid.BufferView({
			// rowHeight : 20,
			// scrollDelay : false
			// }),
			border : false,
			columnLines : false,
			frame : false,
			autoScroll : true,
			trackMouseOver : true,
			loadMask : true,
			id : 'vehiclechezai',
			stripeRows : true,
			bbar : new Ext.PagingToolbar({
						pageSize : 100,
						store : this.store1,
						displayInfo : false
					})
				// listeners : {
				// rowclick : this.locationMapEL
				// }
			});
		this.btnSearch1 = new Ext.Button({
					width : 80,
					text : '查询',
					handler : function() {
						this.trafuncar();

					}.createDelegate(this)

				});
		this.trapanel1 = new Ext.form.FormPanel({
					// width : 200,
					// height : 245,
					border : false,
					items : [{
						layout : 'form',
						style : 'padding:4px 0px 0px 0px',
						border : false,
						frame : false,
						labelAlign : 'right',
						labelWidth : 69,
						items : [{
									layout : 'column',
									// columnWidth : .78,
									border : false,
									frame : false,
									defaults : {
										labelWidth : 69,
										layout : 'form',
										border : false,
										frame : false
									},
									items : [{
												columnWidth : .545,
												items : [this.croCmb1]
											}, {
												columnWidth : .455,
												items : [this.crotext1]
											}]
								}, this.startTime1.getControl(),
								this.stopTime1.getControl(), {
									layout : 'column',
									border : false,
									frame : false,
									items : [{
												width : 158,
												border : false
											}, this.btnSearch1]
								}, this.resultPanel1]
					}]

				});
		/**
		 * @author zhangsl
		 * @date : 2011-6-14 下午01:57:09
		 * @description:全图查询
		 */
		this.schData = [/*
						 * ['0', '所有设备'], ['3000', '监控点设备'], ['5000', '车载'] ,
						 * ['4000', '报警输入'], ['4100', '报警输出'],['5000',
						 * '车载'],['5100', '单兵'] , ['6000',
						 * top.crossingManageName + '设备'],
						 */
		['point', '地点'], ['line', '街道']/*, ['polygon', '区域']*/];
		this.schType1 = new Ext.form.ComboBox({
					width : 155,
					code : 'schType1',
					valueField : 'id',
					displayField : 'value',
					selectOnFocus : true,
					fieldLabel : '查询类型',
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					value : "point",
					store : new Ext.data.SimpleStore({
								fields : ['id', 'value'],
								data : this.schData
							}),
					listeners : {
		// select : function() {
					// this.textTaskName.setValue(arguments[0]
					// .getRawValue());
					// }.createDelegate(this)
					}
				});

		this.keyword = new Ext.form.TextField({
					width : 155,
					fieldLabel : '关键字',
					maxLength : 48,
					enableKeyEvents : true,
					maskRe : new RegExp("[^(/:;,#$&*?^!@'\"<>|%_\\\\)]"),
					name : 'keyword',
					listeners : {
						keyup : function(textField, e) {
							if (e.getKey() == 13) {
								this.searchHandler();
							}
						}.createDelegate(this)
					}
				});

		this.arreader = new Ext.data.JsonReader({
					root : 'kjElements',
					totalProperty : 'total',
					successProperty : 'success',
					fields : [{
								name : 'elementId',
								mapping : 'pathname'
							}, {
								name : 'elementName',
								mapping : 'pathname'
							}, {
								name : 'elementType',
								mapping : 'geotype'
							}, {
								name : 'elementpoint',
								mapping : 'theGeom'
							}]
				});
		this.arstore = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/NetAnalyAction!getSpatialInfo.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.arreader,
					listeners : {
						load : function(a, record, b) {
							var eshuzu = [];
							for (var i = 0; i < record.length; i++) {
								var szChildDataArrays = [];
								szChildDataArrays[0] = record[i].data.elementpoint;
								szChildDataArrays[1] = record[i].data.elementName;
								szChildDataArrays[2] = record[i].data.elementType;
								eshuzu.push(szChildDataArrays);
							}
							var eventObject = {
								eventCode : 'huline',
								sender : this,
								params : {
									geom : eshuzu
								}
							};
							this.fireEvent(eventObject.eventCode, eventObject);
						}.createDelegate(this)
					}
				});
		var arcm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '元素ID',
								hidden : true,
								dataIndex : 'elementId'
							}, {
								header : '资源名称',
								dataIndex : 'elementName',
								width : 145
							}, {
								header : '类型',
								dataIndex : 'elementType',
								width : 40,
								sortable : true,
								renderer : function(value) {
									var type;
									switch (parseInt(value, 10)) {
										case 3000 :
											type = '监控点';
											break;
										case 4000 :
											type = '报警输入';
											break;
										case 4100 :
											type = '报警输出';
											break;
										case 5000 :
											type = '车载';
											break;
										case 5100 :
											type = '单兵';
											break;
										case 6000 :
											type = top.crossingManageName
													+ "设备";
											break;
										case -1 :
											type = "地点";
											break;
										case -2 :
											type = "街道";
											break;
										case -3 :
											type = "区域";
											break;
										default :
											type = '监控点';
											break;
									}
									return type;
								}
							}, {
								header : '坐标',
								hidden : true,
								dataIndex : 'elementpoint'
							}]
				});
		this.arresultPanel = new Ext.grid.GridPanel({
					title : '空间信息',
					ds : this.arstore,
					height : 270,
					cm : arcm,
					viewConfig : {
						forceFit : true
					},
					border : false,
					columnLines : false,
					frame : false,
					autoScroll : true,
					trackMouseOver : true,
					loadMask : true,
					id : 'emelent',
					stripeRows : true,
					bbar : new Ext.PagingToolbar({
								pageSize : 20,
								store : this.arstore,
								displayInfo : false,
								displayMsg : '第 {0} 到 {1} 条数据 共{2}条',
								emptyMsg : "没有数据"
							}),
					listeners : {
						rowclick : this.locationMapEL.createDelegate(this)
					}
				});

		this.schBtn = new Ext.Button({
					width : 72,
					text : '查询',
					handler : this.searchHandler.createDelegate(this)
				});
		// this.aroundpanel = new Ext.Panel({
		// resizable : false,
		// frame : true,
		// border : false,
		// labelAlign : 'left',
		// labelWidth : 80,
		// layout : 'form',
		// items : [this.schType1,this.keyword, this.arresultPanel],
		// buttons : [this.schBtn]
		//
		// });
		this.aroundpanel = new Ext.Panel({
					// width : 200,
					// height : '100%',
					border : false,
					items : [{
								layout : 'form',
								style : 'padding:3px 0px 0px 0px',
								border : false,
								frame : false,
								labelAlign : 'right',
								labelWidth : 60,
								items : [this.schType1, this.keyword, {
											layout : 'column',
											border : false,
											frame : false,
											items : [{
														width : 152,
														border : false
													}, this.schBtn]
										}, this.arresultPanel]
							}]
				});
		if (confFlag) {
			this.allPanel = new Ext.TabPanel({
						activeTab : 0,
						width : '100%',
						enableTabScroll : true,
						border : false,
						defaults : {
							width : '100%',
							height : cms.util.getBodyHeight() - 55,// gridHeight,
							layout : 'form',
							border : false,
							autoScroll : true
						},
						items : [{
									id : 'emapInfo',
									title : '电子地图',
									hidden : true,
									items : [this.emapTree]
								}, {
									id : 'cameraInfo',
									title : '地图查询',
									items : [this.aroundpanel]
								}/*
									 * , { id : 'deviceIo', title : '车辆轨迹',
									 * items : [this.trapanel] }
									 */],
						listeners : {
							FnPanelEvent : this.fnPanelEventHandler
									.createDelegate(this)
						}
					});
		} else {
			this.allPanel = new Ext.TabPanel({
						activeTab : 0,
						width : '100%',
						enableTabScroll : true,
						border : false,
						defaults : {
							width : '100%',
							height : cms.util.getBodyHeight() - 55,// gridHeight,
							layout : 'form',
							border : false,
							autoScroll : true
						},
						items : [{
									id : 'emapInfo',
									title : '电子地图',
									hidden : true,
									items : [this.emapTree]
								}, {
									id : 'cameraInfo',
									title : '地图查询',
									items : [this.aroundpanel]
								}, {
									id : 'deviceIo',
									title : '车辆轨迹',
									items : [this.trapanel]
								}/*
									 * , { id : 'carZinfo', title : '车载', items :
									 * [this.trapanel1] }
									 */],
						listeners : {
							FnPanelEvent : this.fnPanelEventHandler
									.createDelegate(this)
						}
					});
		}

		return this.allPanel;
	},
	trafun : function() {

		if (this.crotext.getValue().trim() == "") {
			cms.ext.alert('错误', '车牌号码不能为空 ！');
			this.traCheck.setValue(false);
			return;
		}
		if (this.startTime.getValue().trim() == ''
				|| this.stopTime.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.startTime.getValue() != '' && this.stopTime.getValue() != '') {
			if (cms.util.compareDateTime(this.stopTime.getValue(),
					this.startTime.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				this.traCheck.setValue(false);
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
		var mask = new Ext.LoadMask("vehicleguiji", {
					msg : '数据加载中...    '
				});
		mask.show();
		Ext.Ajax.request({
			timeout : EXT_QUERY_TIME_OUT,
			url : '/crossingConfigAction!findCrossingInfoByPlateInfoAndPassTime.action',
			params : {
				brandNo : this.croCmb.getValue()
						+ this.crotext.getValue().toUpperCase(),
				startTime : this.startTime.getValue(),
				mapMode : mapMode,
				stopTime : this.stopTime.getValue()
			},
			success : function(response) {
				var jsonResult = Ext.util.JSON.decode(response.responseText);
				var crossingVehiclePass = jsonResult.crossingVehiclePassDTOs;
				var pointsStr = '';
				var pointsStrs = '';
				shuzu1.length = 0;
				var passTimeStrArray = new Array();
				var elementIdArray = new Array();
				for (var i = 0, len = crossingVehiclePass.length; i < len; i++) {
					var szChildDataArray = [];
					szChildDataArray[0] = crossingVehiclePass[i].passTimeStr;
					szChildDataArray[1] = crossingVehiclePass[i].crossingname;
					szChildDataArray[2] = crossingVehiclePass[i].vehicleLsh;
					shuzu1.push(szChildDataArray);
					if (crossingVehiclePass[i].longitude != '') {
						pointsStr += crossingVehiclePass[i].longitude + ','
								+ crossingVehiclePass[i].latitude + ',';
					}
					passTimeStrArray.push(crossingVehiclePass[i].passTimeStr);
					elementIdArray.push(crossingVehiclePass[i].elementId);
				}
				if (pointsStr != '') {
					this.getVal();
					mask.hide();
					firstpx = pointsStr.split(",")[0];
					firstpy = pointsStr.split(",")[1];
					var firstPoint = firstpy + ',' + firstpx;
					pointsStrs = pointsStr.trim().substring(0,
							pointsStr.length - 1);
					var eventObject = {
						eventCode : 'gpsRD',
						sender : this,
						params : {
							operate : 'drawline',
							code : 'emap',
							firstPoint : firstPoint,
							pointsStr : pointsStrs,
							passTimeStrArray : passTimeStrArray,
							elementIdArray : elementIdArray,
							brandNo : this.croCmb.getValue()
									+ this.crotext.getValue().toUpperCase(),
							ist : this.timesta,
							firstpx : firstpx,
							firstpy : firstpy
						}
					};
					this.fireEvent(eventObject.eventCode, eventObject);
				} else {
					cms.ext.alert('提示', '无此信息!');
					shuzu1.length = 0;
					this.getVal();
					var eventObject = {
						eventCode : 'gpsRDC',
						sender : this,
						params : {
							operate : 'drawline',
							code : 'emap'
						}
					};
					this.fireEvent(eventObject.eventCode, eventObject);
					mask.hide();
					this.traCheck.setValue(false);
				}

			}.createDelegate(this),
			failure : function(response) {
				cms.ext.alert('错误', '查询失败!');
				mask.hide();
				this.traCheck.setValue(false);
			}
		}, this);
	},
	trafuncar : function() {

		if (this.crotext.getValue().trim() == "") {
			cms.ext.alert('错误', '车牌号码不能为空 ！');
			return;
		}
		if (this.startTime.getValue().trim() == ''
				|| this.stopTime.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.startTime.getValue() != '' && this.stopTime.getValue() != '') {
			if (cms.util.compareDateTime(this.stopTime.getValue(),
					this.startTime.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				return;
			}
		}
		var st = cms.util.getTime(this.startTime.getValue());
		var et = cms.util.getTime(this.stopTime.getValue());
		var dif = et - st;
		if (dif > 24 * 3600 * 1000) {
			cms.ext.alert('错误', '查询时间不能超过一天！');
			return;
		}
		var mask = new Ext.LoadMask("vehicleguiji", {
					msg : '数据加载中...    '
				});
		mask.show();
		Ext.Ajax.request({
			timeout : EXT_QUERY_TIME_OUT,
			url : '/GpsQueryAction!queryData.action',
			params : {
				plateInfo : this.croCmb.getValue()
						+ this.crotext.getValue().toUpperCase(),
				startTime : this.startTime.getValue(),
				stopTime : this.stopTime.getValue()
			},
			success : function(response) {
				var jsonResult = Ext.util.JSON.decode(response.responseText);
				var crossingVehiclePass = jsonResult.GpsInfo;
				var pointsStr = '';
				var pointsStrs = '';
				shuzu1.length = 0;
				for (var i = 0, len = crossingVehiclePass.length; i < len; i++) {
					var szChildDataArray = [];
					szChildDataArray[0] = crossingVehiclePass[i].createTime;
					szChildDataArray[1] = crossingVehiclePass[i].speed;
					// szChildDataArray[2] = crossingVehiclePass[i].direction;
					shuzu1.push(szChildDataArray);
					if (crossingVehiclePass[i].longitude != '') {
						pointsStr += crossingVehiclePass[i].longitude + ','
								+ crossingVehiclePass[i].latitude + ',';
					}
				}
				if (pointsStr != '') {
					this.getValcar();
					mask.hide();
					firstpx = pointsStr.split(",")[0];
					firstpy = pointsStr.split(",")[1];
					var firstPoint = new Point(firstpx, firstpy);
					pointsStrs = pointsStr.trim().substring(0,
							pointsStr.length - 1);
					var eventObject = {
						eventCode : 'NavigateEvent',
						sender : this,
						params : {
							operate : 'drawline',
							code : 'emap',
							firstPoint : firstPoint,
							pointsStr : pointsStrs,
							brandNo : this.croCmb.getValue()
									+ this.crotext.getValue().toUpperCase(),
							ist : this.timesta
						}
					};
					this.fireEvent(eventObject.eventCode, eventObject);
				} else {
					cms.ext.alert('提示', '无此信息!');
					mask.hide();
				}

			}.createDelegate(this),
			failure : function(response) {
				cms.ext.alert('错误', '查询失败!');
				mask.hide();
			}
		}, this);
	},
	traHandler : function(box, isChecked) {
		if (isChecked) {
			this.gpsCheck.disable();
			this.startTime.setValue(bay.common.gettracurDatemin());
			this.stopTime.setValue(bay.common.gettracurDate());
			this.timesta = "0";
			taskState = {
				run : this.trafun.createDelegate(this),// 执行任务时执行的函数
				interval : 600000
				// 任务间隔，毫秒为单位，这里是60秒
			}
			Ext.TaskMgr.start(taskState);// 初始化时就启动任务
		} else {
			Ext.TaskMgr.stop(taskState);
			this.timesta = "1";
			this.stopTime.setValue(bay.common.gettraDate());
			this.gpsCheck.enable();
		}
	},
	gpsHandler : function(box, isChecked) {
		if (isChecked) {
			this.traCheck.disable();
			this.resultPanel.getColumnModel().setColumnHeader(2, '速度');
			// this.resultPanel.getColumnModel().setColumnWidth(1,114);
			// this.resultPanel.getColumnModel().setColumnWidth(2,90);
			this.resultPanel.getStore().removeAll();
			// this.resultPanel.reconfigure(this.store1,this.cm1);
			// shuzu1.length=0;
		} else {
			// shuzu1.length=0;
			// this.resultPanel.reconfigure(this.store,this.cm);
			this.resultPanel.getColumnModel().setColumnHeader(2,
					top.crossingManageName + '名称');
			// this.resultPanel.getColumnModel().setColumnWidth(1,114);
			// this.resultPanel.getColumnModel().setColumnWidth(2,90);
			this.resultPanel.getStore().removeAll();
			this.traCheck.enable();
		}
	},
	locationMapEL : function(grid, rowIndex, event) {
		var record = grid.getStore().getAt(rowIndex);
		var eventObject = {
			eventCode : 'dingwei',
			sender : this,
			params : {
				operate : 'locationMapEL',
				elementId : record.get('elementName')
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	searchHandler : function() {
		this.arstore.removeAll();
		if (this.keyword.getValue().trim() == "") {
			Ext.Msg.alert('错误', '请输入关键字 ！');
			return;
		}
		masks = new Ext.LoadMask("emelent", {
					msg : '数据加载中...    '
				});
		masks.show();
		inum = 0;
		st = "";
		if (this.schType1.getValue() == '0'
				|| this.schType1.getValue() == '3000'
				|| this.schType1.getValue() == '6000'
				|| this.schType1.getValue() == '5000') {

			Ext.Ajax.request({
						timeout : EXT_QUERY_TIME_OUT,
						url : '/ezEmapInfoAction!queryElement.action',
						params : {
							searchType : 0,
							mapMode : mapMode,
							elementType : this.schType1.getValue(),
							elementName : this.keyword.getValue()
						},
						success : function(response) {
							var jsonResult = Ext.util.JSON
									.decode(response.responseText);
							var emapElement = jsonResult.emapElements;
							var eshuzu = [];
							for (var i = 0, len = emapElement.length; i < len; i++) {
								var szChildDataArrays = [];
								szChildDataArrays[0] = emapElement[i].elementId;
								szChildDataArrays[1] = emapElement[i].elementName;
								szChildDataArrays[2] = emapElement[i].elementType;
								eshuzu.push(szChildDataArrays);
							}
							this.arstore.loadData(eshuzu);
							masks.hide();
						}.createDelegate(this),
						failure : function(response) {
							cms.ext.alert('错误', '查询失败!');
							masks.hide();
						}
					}, this);
		} else {
			this.arstore.baseParams = {
				searchType : 0,
				mapMode : mapMode,
				kjType : this.schType1.getValue(),
				kjName : this.keyword.getValue(),
				start : 0,
				limit : 20
				// 结束时间
			};
			this.arstore.load();
			masks.hide();
		}
	},
	createEmapTreeLoader : function() {
		this.emapTreeLoader = new Ext.tree.TreeLoader({
					dataUrl : this.emapTreeUrl,
					baseParams : {},
					listeners : {
						'beforeload' : this.beforeloadOfEmapTreeLoader
								.createDelegate(this),
						'load' : this.loadOfLoaferHandler.createDelegate(this)

					}
				});
	},
	getVal : function() {
		this.store.load({
					params : {
						start : 0,
						limit : 100
					}
				});
	},
	getValcar : function() {
		this.store1.load({
					params : {
						start : 0,
						limit : 100
					}
				});
	},
	createEmapTree : function() {

		this.emapTree = new Ext.tree.TreePanel({
					root : new Ext.tree.AsyncTreeNode({// 根节点
						id : this.mapNodePrefix + 0,
						text : '电子地图',
						qtip : '电子地图',
						draggable : false,
						iconCls : 'GIS_Map'
					}),
					split : true, // 分离
					autoScroll : true, // 自动滚动
					autoHeight : false, // 自动高度
					expanded : true, // 展开根结点
					frame : false, // 美化界面
					enableDD : false, // 是否支持拖拽效果
					containerScroll : true, // 是否支持滚动条
					rootVisible : false, // 是否隐藏根节点
					border : false, // 边框
					animate : true, // 动画效果
					useArrows : true, // 显示箭头
					lines : true, // 节点间的虚线条
					width : '100%', // 宽度
					height : cms.util.getBodyHeight() - 29,
					loader : this.emapTreeLoader,
					listeners : {
						click : this.emapTreeClickHandler.createDelegate(this)
					}
				});

	},
	createCameraTree : function() {
		o = this;
		this.cameraTree = new Ext.tree.TreePanel({
			root : {
				id : 'controlUnit_0',
				text : '监控设备',
				qtip : '监控设备',
				nodeType : 'async',
				draggable : false,
				iconCls : 'control_unit'
			},
			loader : new Ext.tree.TreeLoader({
				dataUrl : this.path + '/gisAction!getCameraInfoTreeJSON.action',
				listeners : {
					"loadexception" : function(loader, node, response) {
						node.loaded = false;
					},
					"beforeload" : function(loader, node) {
						loader.baseParams.nodeId = node.id;
					},
					load : function(thiz, node, response) {
						node.id == 'controlUnit_0' && node.childNodes[0]
								&& node.childNodes[0].expand();
						o.loadOfLoaferHandler();
					}
				}
			}),
			split : true, // 分离
			autoScroll : true, // 自动滚动
			autoHeight : false, // 自动高度
			expanded : true, // 展开根结点
			frame : false, // 美化界面
			enableDD : false, // 是否支持拖拽效果
			containerScroll : true, // 是否支持滚动条
			rootVisible : false, // 是否隐藏根节点
			border : false, // 边框
			animate : true, // 动画效果
			useArrows : true, // 显示箭头
			lines : true, // 节点间的虚线条
			width : '100%', // 宽度
			height : 320,
			listeners : {
				click : this.normalTreeClickHandler.createDelegate(this)
			}
		});
	},
	createIoTree : function() {
		this.ioTree = new Ext.tree.TreePanel({
					root : {
						id : 'controlUnit_0',
						text : '报警设备',
						qtip : '报警设备',
						nodeType : 'async',
						draggable : false,
						iconCls : 'control_unit'
					},
					loader : new Ext.tree.TreeLoader({
								dataUrl : path
										+ '/gisAction!getIOInfoTreeJSON.action',
								listeners : {
									"loadexception" : function(loader, node,
											response) {
										node.loaded = false;
									},
									"beforeload" : function(loader, node) {
										loader.baseParams.nodeId = node.id;
									},
									load : function(thiz, node, response) {
										node.id == 'controlUnit_0'
												&& node.childNodes[0]
												&& node.childNodes[0].expand();
									}
								}
							}),
					split : true, // 分离
					autoScroll : true, // 自动滚动
					autoHeight : false, // 自动高度
					expanded : true, // 展开根结点
					frame : false, // 美化界面
					enableDD : false, // 是否支持拖拽效果
					containerScroll : true, // 是否支持滚动条
					rootVisible : false, // 是否隐藏根节点
					border : false, // 边框
					animate : true, // 动画效果
					useArrows : true, // 显示箭头
					lines : true, // 节点间的虚线条
					width : '100%', // 宽度
					height : '100%',
					listeners : {
						click : this.normalTreeClickHandler
								.createDelegate(this)
					}
				});
	},
	emaptreename : function() {
		Ext.Ajax.request({
					url : '/gisAction!getEmapData.action',
					params : {},
					success : function(response) {
						var jsonResult = Ext.util.JSON
								.decode(response.responseText);
						cms.ext.alert('提示', response.responseText)
						// var crossingVehiclePass =
						// jsonResult.crossingVehiclePassDTOs;
						// var pointsStr = '';
						// var shuzu = [];
						// var passTimeStrArray = new Array();
						// var elementIdArray = new Array();
						// for (var i = 0, len = crossingVehiclePass.length; i <
						// len; i++) {
						// var szChildDataArray = [];
						// szChildDataArray[0] =
						// crossingVehiclePass[i].passTimeStr;
						// szChildDataArray[1] =
						// crossingVehiclePass[i].carSpeed;
						// shuzu.push(szChildDataArray);
						// pointsStr += crossingVehiclePass[i].latitude + ','
						// + crossingVehiclePass[i].longitude + ',';
						// passTimeStrArray
						// .push(crossingVehiclePass[i].passTimeStr);
						// elementIdArray
						// .push(crossingVehiclePass[i].elementId);
						// }
						// if (pointsStr != '') {
						// var firstPoint = new Point(
						// crossingVehiclePass[0].latitude,
						// crossingVehiclePass[0].longitude);
						// pointsStr.trim().substring(0,
						// crossingVehiclePass.length - 1);
						// var eventObject = {
						// eventCode : 'NavigateEvent',
						// sender : this,
						// params : {
						// operate : 'drawline',
						// code : 'emap',
						// firstPoint : firstPoint,
						// pointsStr : pointsStr,
						// passTimeStrArray : passTimeStrArray,
						// elementIdArray : elementIdArray
						// }
						// };
						// this.fireEvent(eventObject.eventCode, eventObject);
						// this.getVal(shuzu)
						// } else {
						// cms.ext.alert('提示', '无此信息!');
						// }

					}.createDelegate(this),
					failure : function(response) {
						cms.ext.alert('错误', '查询失败!');
					}
				}, this);
	},
	/**
	 * EmapTree 取得数据后的处理方法
	 * 
	 * @param {}
	 *            thiz
	 * @param {}
	 *            node 节点
	 * @param {}
	 *            response 响应对象
	 */
	loadOfLoaferHandler : function(thiz, node, response) {
		// if (node.id == (this.mapNodePrefix + 0)) {
		// node.childNodes[0].expand();
		var eventObject = {
			eventCode : 'NavigateEvent',
			sender : this,
			params : {
				operate : "SetMapId",
				code : 'emap',
				mapId : 1,
				mapName : "地图"
			}
		};
		this.mapId = 1;
		this.fireEvent(eventObject.eventCode, eventObject);

		// }
		cms.framework.log(node);
	},
	/**
	 * EmapTree 请求数据前的处理方法
	 * 
	 * @param {}
	 *            This
	 * @param {}
	 *            node
	 * @param {}
	 *            callback
	 */
	beforeloadOfEmapTreeLoader : function(This, node, callback) {
		if (node.id.startsWith(this.mapNodePrefix)) {
			this.eMapBaseParams.nodeId = node.id
					.removeStart(this.mapNodePrefix);
			this.eMapBaseParams.nodeTypeCode = 'map';
		} else if (node.id.startsWith(this.elementNodePrefix)) {
			this.eMapBaseParams.nodeId = node.id
					.removeStart(this.elementNodePrefix);
			this.eMapBaseParams.nodeTypeCode = node.attributes.nodeTypeCode;
		}
		this.emapTreeLoader.baseParams = this.eMapBaseParams;
	},
	/**
	 * 接收功能面板的事件，进行处理
	 * 
	 * @param {}
	 *            event
	 */
	fnPanelEventHandler : function(event) {
		switch (event.params.operate) {
			case 'InitEmap' :
				this.mappanel = event.sender;
				break;
			case 'AddElRlt' :
				this.addElHandler(event.params.data);
				break;
			case 'removeElItem' :
				this.removeElHandler(event.params.elementId);
				break;

			default :
				break;
		}
	},
	/**
	 * 单击事件处理函数
	 * 
	 * @param {}
	 *            node
	 * @param {}
	 *            e
	 */
	normalTreeClickHandler : function(node, e) {
		if (node.isLeaf()) {

			var ids = node.id.split('_');
			var elementType, elementSubType = 0;
			var id = ids[1];
			switch (ids[0] + '_') {
				case this.cameraPrefix :
					elementType = 3000;
					if (node.attributes.iconCls.indexOf('gun') > -1) {
						elementSubType = 0;
					} else if (node.attributes.iconCls.indexOf('halfball') > -1) {
						elementSubType = 1;
					} else if (node.attributes.iconCls.indexOf('fastball') > -1) {
						elementSubType = 2;
					} else if (node.attributes.iconCls.indexOf('ptz') > -1) {
						elementSubType = 3;
					}
					break;
				case this.ioInPrefix :
					elementType = 4000;
					break;
				case this.ioOutPrefix :
					elementType = 4100;
					break;
				case this.carPrefix :
					elementType = 5000;
					break;
				case this.simplePrefix :
					elementType = 5100;
					break;
				default :
					break;
			}
			var eventObject = {
				eventCode : 'npanTo2',
				params : {
					elemlinkid : id
				},
				sender : this
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}
	},
	/**
	 * 单击事件处理函数
	 * 
	 * @param {}
	 *            node
	 * @param {}
	 *            e
	 */
	emapTreeClickHandler : function(node, e) {
		if (node.isLeaf()) {
			this.mappanel.locationMapEl(node.id
					.removeStart(this.elementNodePrefix));
		}
	},
	removeElHandler : function(elementId) {
		this.cameraTree.root.reload();
		// var node = this.emapTree
		// .getNodeById(this.elementNodePrefix + elementId);
		// var parentNode = this.emapTree.getNodeById(this.mapNodePrefix
		// + this.mapId);
		// parentNode && node && parentNode.removeChild(node);
	},
	/**
	 * 地图上添加成功后更新导航器地图树
	 */
	addElHandler : function(data) {

		/* s代码前台添加节点 */

		this.cameraTree.root.reload();
		// for (var index = 0, len = data.elements.length; index < len; index++)
		// {
		// var el = data.elements[index];
		// var id = el.id;
		// var linkId = el.linkId;
		// var name = el.name;
		// var iconCls = '';
		// switch (parseInt(el.elementType)) {
		// case 3000 :
		// elementSubType = el.elementSubType;
		// if (elementSubType == 0) {
		// iconCls = "camera_info_icon_gungis";
		// } else if (elementSubType == 1) {
		// iconCls = "camera_info_icon_halfballgis";
		// } else if (elementSubType == 2) {
		// iconCls = "camera_info_icon_fastballgis";
		// } else if (elementSubType == 3) {
		// iconCls = "camera_info_icon_ptzgis";
		// }
		// break;
		// case 4000 :
		// iconCls = "device_io_icon_in";
		// break;
		// case 4100 :
		// iconCls = "device_io_icon_out";
		// break;
		// case 6000 :
		// iconCls = "bayonet_info_icon";
		// break;
		// case 5000 :
		// iconCls = "gps_info_icon_car";
		// break;
		// case 5100 :
		// iconCls = "gps_info_icon_sim";
		// break;
		// default :
		// break;
		// }
		// var parentNode = this.emapTree.getNodeById(this.mapNodePrefix
		// + this.mapId);
		// var newNode = new Ext.tree.TreeNode({
		// id : this.elementNodePrefix + id,
		// leaf : true,
		// iconCls : iconCls,
		// text : name
		// });
		// parentNode.appendChild(newNode);
		// !parentNode.isExpanded() && parentNode.expand();
		// }

	}
});
