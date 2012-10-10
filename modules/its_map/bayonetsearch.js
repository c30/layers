/**
 * @author zhangsl
 * @date : 2011-5-17 下午08:00:53
 * @description:交通组右键功能（交互类）
 */
Ext.namespace('cms.emap');
cms.emap.bayonetsearch = function(config) {
	cms.emap.bayonetsearch.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.bayonetsearch, Ext.ux.BaseControl, {
	mapApp : undefined,
	elementItem : new cms.framework.map(),// 用来存储的子控件
	mapName : '',
	centerStation : undefined,
	cruiseBtn : undefined,
	zoomInBtn : undefined,
	zoomOutBtn : undefined,
	areaBtn : undefined,
	lengthBtn : undefined,
	serachBtn : undefined,
	loadMapBtn : undefined,
	printBtn : undefined,
	toolbar : undefined,
	tabpanel : undefined,
	store : undefined,
	radius : undefined,
	schWin : undefined,
	intimeWin : undefined,
	croCmb : undefined,
	XPos : -1,
	YPos : -1,
	crosslsh : 0,
	iload : false,
	btnSearch : undefined,// 按钮
	form : undefined,// form表单
	statsTypeVal : 1,
	dateFormatStr : '',// 日期格式
	statsTypeBox : null,
	laneNoBox : undefined,
	statusTypeName : '车道名称', // 用了存放统计的类型名称
	cartrafficGrid : undefined,
	cartrafficStore : undefined,
	sm : undefined,
	cm : undefined,
	reader : undefined,
	controlItem : new cms.framework.map(),// 用来存储的报表子控件3个grid，3个flash
	report : null,
	searchParams : undefined,
	excelParams : '',
	isReady : false, // 判断Grid的store是否加载完毕
	isConfigured : false,
	treeParams : {
		initGridData : true
	},

	showalarmWin : function(num) {
		var win = this.getalarmWin(num);
		win.show();
	},
	showcrossstateWin : function(num) {
		if(bayclick==true)
		{
		var win = this.getcrossstateWin(num);
		bayclick=false;
		win.show();
		}
	},
	showvehiclealarmWin : function(num) {
		if(bayclick==true)
		{
		var win = this.getvehiclealarmWin(num);
		bayclick=false;
		win.show();
		}
	},
	showvehiclepassWin : function(num) {
		if(bayclick==true)
		{
		var win = this.getvehiclepassWin(num);
		bayclick=false;
		win.show();
		}
	},
	showcartrafficWin : function(num) {
		if(bayclick==true)
		{
		this.iload = true;
		var win = this.getcartrafficWin(num);
		bayclick=false;
		win.show();
		}
	},
	showfre : function(num) {
		if(bayclick==true)
		{
		var win = this.getfreWin(num);
		bayclick=false;
		win.show();
		}
	},
	showbayintime : function(num) {
		var win = this.getbayintimeWin(num);
		win.show();
		return win;
	},
	getalarmWin : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:26:43
		 * @description:处理统计界面
		 */

		this.starttimeField = new cms.form.DateFieldCtrl({
					name : 'starttimeField',
					width : 145,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.stoptimeField = new cms.form.DateFieldCtrl({
					name : 'stoptimeField',
					width : 145,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.crosslsh = num;
		this.btnSearch = new Ext.Button({

					width : 80,
					height : 48,
					layout : 'column',
					text : '统计',
					handler : this.onSearchHandler.createDelegate(this)

				});

		this.store = new Ext.data.JsonStore({
					url : path + '/handleAction!getHandleData.action',
					root : 'root',
					totalProperty : 'total',
					successProperty : 'success',

					fields : [{
								name : 'OrganizationName',
								mapping : 'organizationName'
							}, {
								name : 'CrossingName',
								mapping : 'crossingName'
							}, {
								name : 'NoHandle',
								mapping : 'noHandle'
							}, {
								name : 'HaveHandle',
								mapping : 'haveHandle'
							}, {
								name : 'TotalNumber',
								mapping : 'totalNumber'
							}]
				});
		var cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '所属组织',
								dataIndex : 'OrganizationName',
								align : 'center',
								width : 100
							}, {
								header : top.crossingManageName + '名称',
								dataIndex : 'CrossingName',
								align : 'center',
								width : 100
							}, {
								header : '未处理（条）',
								dataIndex : 'NoHandle',
								align : 'center',
								width : 80
							}, {
								header : '已处理（条）',
								dataIndex : 'HaveHandle',
								align : 'center',
								width : 80
							}, {
								header : '总计（条）',
								dataIndex : 'TotalNumber',
								align : 'center',
								width : 80
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({
			title : '搜索结果',
			ds : this.store,
			height : 230,
			cm : cm,
			viewConfig : {
				forceFit : true
			},
//			view : new Ext.ux.grid.BufferView({
//						rowHeight : 20,
//						scrollDelay : false
//					}),
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
		this.form = new Ext.form.FormPanel({
					// region : 'north',
					columnWidth : .100,
					labelAlign : 'right',
					height : 68,
					border : false,
					frame : false,
					collapseMode : 'mini',
					split : true,
					labelWidth : 72,
					items : [{
						style : 'padding:10px 0px 5px 0px',
						width : 475,
						layout : 'column',
						border : false,
						frame : false,
						defaults : {
							labelWidth : 72,
							layout : 'form',
							border : false,
							frame : false
						},
						items : [{
							columnWidth : .70,
							items : [{
								layout : 'form',
								width : '100%',
								border : false,
								frame : false,
								defaults : {
									labelWidth : 72,
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
									columnWidth : .10,
									items : [this.starttimeField.getControl(),
											this.stoptimeField.getControl()]
								}]

							}]
						}, {
							columnWidth : .20,
							items : [this.btnSearch]
						}]
					}]
				});
		this.schWin = new Ext.Window({
					title : '报警处理查询',
					resizable : false,
					frame : true,
					modal : true,
					border : false,
					width : 475,
					height : 300,
					layout : 'form',
					items : [this.form, this.resultPanel]

				});
		return this.schWin;
	},
	getcrossstateWin : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:27:24
		 * @description:卡口状态界面
		 */
		this.crosslsh = num;
		this.store = new Ext.data.JsonStore({
					url : path + '/crostateAction!getCrostateData.action',
					root : 'root',
					fields : [{
								name : 'DevName',
								mapping : 'devName'
							}, {
								name : 'DevLane',
								mapping : 'devLane'
							}, {
								name : 'DevStats',
								mapping : 'devStats'
							}]
				});
		var cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [{
								header : '设备名称',
								// align: 'center',
								dataIndex : 'DevName',
								menuDisabled : true,
								width : 150
							}, {
								header : '车道',
								// align: 'center',
								dataIndex : 'DevLane',
								// sortable: true,
								menuDisabled : true,
								width : 120
							}, {
								header : '状态',
								// align: 'center',
								dataIndex : 'DevStats',
								menuDisabled : true,
								width : 120,
								renderer : function(value) {
									if (value == '异常' || value == '未知') {
										return "<span style='color:red;'>"
												+ value + "</span>";
									} else {
										return "<span>" + value + "</span>";
									}
								}
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({

					ds : this.store,
					height : 300,
					cm : cm,
					viewConfig : {
						forceFit : true
					},
//					view : new Ext.ux.grid.BufferView({
//								rowHeight : 20,
//								scrollDelay : false
//							}),
					border : false,
					columnLines : false,
					frame : false,
					autoScroll : true,
					trackMouseOver : true,
					loadMask : true,
					stripeRows : true
				});
		this.schWin = new Ext.Window({
					title : top.crossingManageName + '设备状态',
					resizable : false,
					frame : true,
					border : false,
					modal : true,
					width : 423,
					height : 330,
					layout : 'form',
					items : [this.resultPanel],
					listeners : {
						close : function(){bayclick=true;}
					}

				});
		this.store.baseParams = {
			operate : "Search",
			crosslsh : this.crosslsh
			// 获取路口的流水号
		};
		this.store.load();
		return this.schWin;
	},
	getvehiclealarmWin : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:28:14
		 * @description:违章查询界面
		 */
		this.starttimeField = new cms.form.DateFieldCtrl({
					name : 'starttimeField',
					width : 143,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.stoptimeField = new cms.form.DateFieldCtrl({
					name : 'stoptimeField',
					width : 143,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:28:56
		 * @description:hideLabel对现排版显示实车牌号码起作用，应注意。
		 */
		this.crotext = new Ext.form.TextField({
					emptyText : '*或？模糊查询',
					width : 100,
					maskRe : new RegExp("[^(/:;'\"<>|%_\\\\)]"),
					maxLength : 15,
					hideLabel : true
				});
		this.croCmb = new Ext.form.ComboBox({

					width : 50,
					minListWidth : 50,
					name : 'croCmb',
					valueField : 'id',
					displayField : 'value',
					value : '全部',
					selectOnFocus : true,
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					fieldLabel : '车牌号码',
					store : new Ext.data.SimpleStore({
								fields : ['id', 'value'],
								data : BAYONET_PLATE_NO_PRE
							})
				});
		this.alarmActionBox = new cms.form.ComboBoxTypeList({
					valueField : 'Code',
					displayField : 'Name',
					typeListGroup : '1028',
					defaultValue : '全部',
					width : 162,
					fieldLabel : '违法行为'
				});
		this.crosslsh = num;
		this.btnSearch = new Ext.Button({

					width : 100,
					height : 52,
					layout : 'column',
					text : '查询违法信息',
					handler : this.onvehiclealarmHandler.createDelegate(this)

				});
		this.reader = new Ext.data.JsonReader({
					root : 'vehiclePassInfo',
					totalProperty : 'total',
					successProperty : 'success',

					fields : [{
								name : 'vehicleLsh',
								mapping : 'vehicleLsh'
							}, {
								name : 'platePic',
								mapping : 'platePic'
							}, {
								name : 'plateInfo',
								mapping : 'plateInfo'
							}, {
								name : 'passtime',
								mapping : 'passtime'
							}, {
								name : 'crossName',
								mapping : 'crossName'
							}, {
								name : 'laneName',
								mapping : 'laneName'
							}, {
								name : 'directName',
								mapping : 'directName'
							}, {
								name : 'vehicleSpeed',
								mapping : 'vehicleSpeed'
							}, {
								name : 'speedLimit',
								mapping : 'speedLimit'
							}, {
								name : 'picURL',
								mapping : 'picURL'
							}, {
								name : 'vrminfo',
								mapping : 'vrminfo'
							}, {
								name : 'alarmStatus',
								mapping : 'alarmStatus'
							}, {
								name : 'alarmAction',
								mapping : 'alarmAction'
							}]
				});
		this.store = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/breakruleQueryAction!queryData.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.reader,
					listeners : {
						load : this.GridLoad.createDelegate(this)
						// 新增，置换标志位
					}
				});
		this.storepage = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/breakruleQueryAction!queryData.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.reader,
					listeners : {
						load : this.afterload.createDelegate(this)
					}
				});
		this.cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '车牌号码',
								dataIndex : 'plateInfo',
								// align : 'center',
								width : 80
							}, {
								header : '违法时间',
								dataIndex : 'passtime',
								align : 'center',
								width : 150
							}, {
								header : '违法地点',
								dataIndex : 'crossName',
								// align : 'center',
								width : 150
							}, {
								header : '违法行为',
								dataIndex : 'alarmAction',
								// align : 'center',
								width : 80
							}, {
								header : '车道名称',
								dataIndex : 'laneName',
								// align : 'center',
								width : 80
							}, {
								header : '方向名称',
								dataIndex : 'directName',
								// align : 'center',
								width : 80
							}, {
								header : '车速(km/h)',
								dataIndex : 'vehicleSpeed',
								align : 'right',
								width : 70
							}, {
								header : '限速(km/h)',
								dataIndex : 'speedLimit',
								align : 'right',
								width : 70
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({
					title : '搜索结果',
					ds : this.store,
					height : 386,
					// autoHeight:true,
					cm : this.cm,
					viewConfig : {
						forceFit : true
					},
//					view : new Ext.ux.grid.BufferView({
//								rowHeight : 20,
//								scrollDelay : false
//							}),
					border : false,
					columnLines : false,
					frame : false,
					autoScroll : true,
					trackMouseOver : true,
					loadMask : true,
					id : 'vehicleAlarmGrid',
					stripeRows : true
				});
		this.resultPanel.on('rowdblclick', function(grid, rowIndex, event) {
					var vehicleLsh = grid.getStore().getAt(rowIndex)
							.get('vehicleLsh');
					getCarDetailInfoWin(vehicleLsh, "vehicleAlarmGrid", "110",
							1);
				});
		this.form = new Ext.form.FormPanel({
					columnWidth : .100,
					collapseMode : 'mini',
					split : true,
					labelAlign : 'left',
					region : 'north',
					height : 69,
					border : false,
					frame : false,
					labelWidth : 72,
					items : [{
						style : 'padding:10px 0px 0px 10px',
						width : 850,
						layout : 'column',
						border : false,
						frame : false,
						defaults : {
							labelWidth : 72,
							layout : 'form',
							border : false,
							frame : false
						},
						items : [{
							columnWidth : .70,
							// width : 550,
							items : [{
								layout : 'column',
								width : '100%',
								border : false,
								frame : false,
								defaults : {
									labelWidth : 72,
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
											columnWidth : .48,
											labelWidth : 82,
											items : this.starttimeField
													.getControl()
										}, {
											layout : 'column',
											columnWidth : .52,
											border : false,
											frame : false,
											defaults : {
												labelWidth : 82,
												layout : 'form',
												border : false,
												frame : false
											},
											items : [{
														columnWidth : .50,

														items : [this.croCmb]
													}, {
														columnWidth : .50,

														items : [this.crotext]
													}]
										}]
							}, {
								layout : 'column',
								width : '100%',
								border : false,
								frame : false,
								defaults : {
									labelWidth : 72,
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
											columnWidth : .48,
											labelWidth : 82,
											items : [this.stoptimeField
													.getControl()]
										}, {
											columnWidth : .50,
											labelWidth : 82,
											items : [this.alarmActionBox
													.getControl()]
										}]
							}]
						}, {
							columnWidth : .30,
							// width : 230,
							items : [this.btnSearch]
						}]
					}]
				});
		this.schWin = new Ext.Window({
					title : '违法信息查询',
					resizable : false,
					frame : true,
					border : false,
					width : 814,
					height : 510,
					modal : true,
					layout : 'form',
					items : [this.form, this.resultPanel],
					bbar : new Ext.PagingToolbar({
								pageSize : 50,
								store : this.storepage,
								displayInfo : true,
								displayMsg : '第 {0} 到 {1} 条数据 共{2}条',
								emptyMsg : "没有数据"
							}),
					listeners : {
						close : function(){bayclick=true;}
					}
				});
		return this.schWin;
	},
	getvehiclepassWin : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:27:57
		 * @description:过车查询界面
		 */

		this.starttimeField = new cms.form.DateFieldCtrl({
					name : 'starttimeField',
					width : 143,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.stoptimeField = new cms.form.DateFieldCtrl({
					name : 'stoptimeField',
					width : 143,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		this.crotext = new Ext.form.TextField({
					emptyText : '*或？模糊查询',
					width : 100,
					maskRe : new RegExp("[^(/:;'\"<>|%_\\\\)]"),
					maxLength : 15,
					hideLabel : true
				});
		this.croCmb = new Ext.form.ComboBox({
					fieldLabel : '车牌号码',
					width : 50,
					minListWidth : 50,
					name : 'croCmb',
					valueField : 'id',
					displayField : 'value',
					value : '全部',
					selectOnFocus : true,
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					store : new Ext.data.SimpleStore({
								fields : ['id', 'value'],
								data : BAYONET_PLATE_NO_PRE
							})
				});
		this.crosslsh = num;
		this.btnSearch = new Ext.Button({

					width : 100,
					height : 32,
					layout : 'column',
					text : '查询过车信息',
					handler : this.onvehiclepassHandler.createDelegate(this)

				});
		this.reader = new Ext.data.JsonReader({
					root : 'vehiclePassInfo',
					totalProperty : 'total',
					successProperty : 'success',
					fields : [{
								name : 'vehicleLsh',
								mapping : 'vehicleLsh'
							}, {
								name : 'platePic',
								mapping : 'platePic'
							}, {
								name : 'plateInfo',
								mapping : 'plateInfo'
							}, {
								name : 'plateColor',
								mapping : 'plateColor'
							}, {
								name : 'plateType',
								mapping : 'plateType'
							}, {
								name : 'vehicleType',
								mapping : 'vehicleType'
							}, {
								name : 'vehicleLen',
								mapping : 'vehicleLen'
							}, {
								name : 'vehcolorDepth',
								mapping : 'vehcolorDepth'
							}, {
								name : 'vehicleColor',
								mapping : 'vehicleColor'
							}, {
								name : 'passtime',
								mapping : 'passtimeFormat'
							}, {
								name : 'crossName',
								mapping : 'crossName'
							}, {
								name : 'laneName',
								mapping : 'laneName'
							}, {
								name : 'directName',
								mapping : 'directName'
							}, {
								name : 'vehicleSpeed',
								mapping : 'vehicleSpeed'
							}, {
								name : 'picURL',
								mapping : 'picURL'
							}, {
								name : 'vrminfo',
								mapping : 'vrminfo'
							}]
				});
		this.store = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/motorbusQueryAction!queryData.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.reader,
					listeners : {
						load : this.GridLoad.createDelegate(this)
						// 新增，置换标志位
					}
				});
		this.storepage = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/motorbusQueryAction!queryData.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.reader,
					listeners : {
						load : this.afterload.createDelegate(this)
					}
				});
		this.cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : '车牌号码',
								dataIndex : 'plateInfo',
								// align : 'center',
								width : 80
							}, {
								header : '车牌类型',
								dataIndex : 'plateType',
								// align : 'center',
								width : 70
							}, {
								header : '车辆类型',
								dataIndex : 'vehicleType',
								// align : 'center',
								width : 70
							}, {
								header : '车身长度',
								dataIndex : 'vehicleLen',
								align : 'right',
								width : 80
							}, {
								header : '车身颜色',
								dataIndex : 'vehicleColor',
								// align : 'center',
								width : 70
							}, {
								header : '经过时间',
								dataIndex : 'passtime',
								align : 'center',
								width : 150
							}, {
								header : top.crossingManageName + '名称',
								dataIndex : 'crossName',
								// align : 'center',
								width : 120
							}, {
								header : '车道名称',
								dataIndex : 'laneName',
								// align : 'center',
								width : 80
							}, {
								header : '方向名称',
								dataIndex : 'directName',
								// align : 'center',
								width : 80
							}, {
								header : '车速(km/h)',
								dataIndex : 'vehicleSpeed',
								align : 'right',
								width : 70
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({
					title : '搜索结果',
					ds : this.store,
					height : 386,
					// autoHeight:true,
					cm : this.cm,
					viewConfig : {
						forceFit : true
					},
//					view : new Ext.ux.grid.BufferView({
//								rowHeight : 20,
//								scrollDelay : false
//							}),
					border : false,
					columnLines : false,
					frame : false,
					autoScroll : true,
					trackMouseOver : true,
					loadMask : true,
					id : 'vehiclePassGrid',
					stripeRows : true
				});
		this.resultPanel.on('rowdblclick', function(grid, rowIndex, event) {
					var vehicleLsh = grid.getStore().getAt(rowIndex)
							.get('vehicleLsh');
					getCarDetailInfoWin(vehicleLsh, "vehiclePassGrid", "100", 0);
				});
		this.form = new Ext.form.FormPanel({
					columnWidth : .100,
					collapseMode : 'mini',
					split : true,
					labelAlign : 'left',
					region : 'north',
					height : 49,
					border : false,
					frame : false,
					labelWidth : 72,
					items : [{
						style : 'padding:10px 0px 0px 10px',
						width : 910,
						layout : 'column',
						border : false,
						frame : false,
						defaults : {
							labelWidth : 72,
							layout : 'form',
							border : false,
							frame : false
						},
						items : [{
							style : 'padding:5px 0px 0px 0px',
							columnWidth : .85,
							// width : 550,
							items : [{
								layout : 'column',
								width : '100%',
								border : false,
								frame : false,
								defaults : {
									labelWidth : 72,
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
											columnWidth : .33,
											labelWidth : 60,
											items : this.starttimeField
													.getControl()
										},{								
											columnWidth : .33,
											labelWidth : 60,
											items : this.stoptimeField
													.getControl()
									
										},{
											layout : 'column',
											columnWidth : .33,
											border : false,
											frame : false,
											defaults : {
												labelWidth : 60,
												layout : 'form',
												border : false,
												frame : false
											},
											items : [{
														columnWidth : .50,
														items : this.croCmb
													}, {
														columnWidth : .50,
														items : this.crotext
													}]
										}]
							}]
						}, {
							columnWidth : .15,
							// width : 230,
							items : [this.btnSearch]
						}]
					}]
				});
		this.schWin = new Ext.Window({
					title : '过车信息查询',
					resizable : false,
					frame : true,
					border : false,
					width : 924,
					height : 490,
					modal : true,
					layout : 'form',
					items : [this.form, this.resultPanel],
					bbar : new Ext.PagingToolbar({
								pageSize : 50,
								store : this.storepage,
								displayInfo : true,
								displayMsg : '第 {0} 到 {1} 条数据 共{2}条',
								emptyMsg : "没有数据"
							}),
					listeners : {
						close : function(){bayclick=true;}
					}

				});
		return this.schWin;
	},
	// Grid的数据源加载完后，把标记位置为true
	GridLoad : function() {
		this.isReady = true;
	},
	getcartrafficWin : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:33:17
		 * @description:车流统计页面
		 */

		this.crosslsh = num;
		this.laneNoBox = new cms.form.ComboBoxCrossingLane({
					code : 'laneNo',
					crossingLsh : num,
					defaultValue : "全部",
					width : 140,
					fieldLabel : '车道名称'
				});
		this.dIndexBox = new cms.form.ComboBoxCrossingD({
					code : 'dIndex',
					crossingLsh : num,
					defaultValue : "全部",
					width : 140,
					fieldLabel : '方向名称'
				});
		this.carTypeBox = new cms.form.ComboBoxTypeList({
			code : 'carType',
			typeListGroup : '1002',
			defaultValue : "全部",
			width : 140,
			fieldLabel : '车辆类型'
				// hasDefault : '0'
			});
		this.plateTypeBox = new cms.form.ComboBoxTypeList({
					code : 'plateType',
					typeListGroup : '1001',
					defaultValue : "全部",
					width : 140,
					fieldLabel : '车牌类型'
				});
		this.plateColorBox = new cms.form.ComboBoxTypeList({
					code : 'carType',
					typeListGroup : '1003',
					defaultValue : "全部",
					width : 140,
					fieldLabel : '车牌颜色'
				});
		this.VehicleColorBox = new cms.form.ComboBoxTypeList({
					code : 'VehicleColor',
					typeListGroup : '1004',
					defaultValue : "全部",
					width : 140,
					fieldLabel : '车身颜色'
				});
		this.analysisType = new Ext.form.ComboBox({
					store : new Ext.data.ArrayStore({
								fields : ['key', 'value'],
								data : [[1, '统计车道'], [2, '统计方向'],
										[1022, '统计归属地'], [1002, '统计车辆类型'],
										[1001, '统计车牌类型'], [1004, '统计车身颜色']]
							}),
					valueField : 'key',
					displayField : 'value',
					fieldLabel : '统计方式',
					editable : false,
					name : 'analysisType',
					hiddenName : 'analysisType',
					triggerAction : 'all',
					mode : 'local',
					width : 140,
					value : 1
				});
		this.analysisType.on('select', function(combo, record, index) {
					// alert(record.get('key'));
					this.switchAnalysisType(record.get('key'));
				}, this);
		this.gsdBox = new cms.form.ComboBoxTypeList({
					code : 'carType',
					typeListGroup : '1022',
					defaultValue : "全部",
					width : 140,
					fieldLabel : '归属地'
				});

		// 报表类型下拉框
		this.comboReportType = new Ext.form.ComboBox({
					store : new Ext.data.ArrayStore({
								fields : ['key', 'value'],
								data : [[0, '日报表'], [1, '月报表'], [2, '年报表']]
							}),
					valueField : 'key',
					displayField : 'value',
					fieldLabel : '报表类型',
					editable : false,
					name : 'reportType',
					hiddenName : 'reportType',
					triggerAction : 'all',
					mode : 'local',
					width : 140,
					value : 0
				});

		this.comboReportType.on('select', function(combo, record, index) {
					// alert(record.get('key'));
					this.switchReportType(record.get('key'))
				}, this);
		// 统计时段选择框
		var nowDate = cms.util.dateFormat(new Date(), this.dateFormatStr);
		this.dateStartDate = new cms.form.DateFieldCtrl({
					fieldLabel : '统计日期',
					width : 140,
					editable : false,
					dataFormat : 'yyyy-MM-dd',
					defaultValue : new Date()
				});

		this.btnSearch = new Ext.Button({
					width : 80,
					height : 75,
					text : '统计',
					handler : this.oncarSearchHandler.createDelegate(this)
				});
		this.showTypes = [[2, '柱状图展示'], [1, '曲线图展示'], [3, '饼状图展示'], [0, '列表展示']];
		this.showTypeBox = new Ext.form.ComboBox({
					fieldLabel : '显示方式',
					store : new Ext.data.ArrayStore({
								fields : ['key', 'value'],
								data : this.showTypes
							}),
					width : 140,
					valueField : 'key',
					displayField : 'value',
					mode : 'local',
					editable : false,
					triggerAction : 'all',
					value : 2,
					emptyText : '请选择',
					listeners : {
						select : this.switchHandler.createDelegate(this)
					}
				});
		// 上部编辑面板
		this.form = new Ext.form.FormPanel({
					region : 'north',
					columnWidth : .100,
					labelAlign : 'right',
					height : 120,
					border : false,
					frame : false,
					collapseMode : 'mini',
					split : true,
					labelWidth : 72,
					items : [{
						style : 'padding:10px 0px 5px 0px',
						width : 880,
						layout : 'column',
						border : false,
						frame : false,
						defaults : {
							labelWidth : 72,
							layout : 'form',
							border : false,
							frame : false
						},
						items : [{
							columnWidth : .90,
							items : [/* this.analysisType,this.dIndexBox, */{
								layout : 'column',
								width : '100%',
								border : false,
								frame : false,
								defaults : {
									labelWidth : 72,
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
									columnWidth : .3,
									items : [this.analysisType,
											this.plateTypeBox.getControl(),
											this.VehicleColorBox.getControl(),
											this.dateStartDate.getControl()]
								}, {
									columnWidth : .3,
									items : [this.dIndexBox.getControl(),
											this.plateColorBox.getControl(),
											this.comboReportType,
											this.showTypeBox]
								}, {
									columnWidth : .3,
									items : [this.laneNoBox.getControl(),
											this.carTypeBox.getControl()/*
																		 * ,
																		 * this.gsdBox.getControl()
																		 */]
								}]

							}
							// ,
							// this.statsTypeBox
							]
						}, {
							columnWidth : .10,
							style : 'padding:28px 0px 0px 0px',
							items : [this.btnSearch]
						}]
					}]
				});

		this.createFlashChart();
		this.report = new Ext.Panel({
					region : 'center',
					// tbar : this.createToolBar(),
					autoScroll : true,
					height : 361,
					border : false,
					frame : false,
					items : [this.controlItem.get('chart').getControl()]

				});

		this.schWin = new Ext.Window({
					title : '流量统计',
					resizable : false,
					frame : true,
					border : false,
					modal : true,
					width : 1000,
					height : 510,
					layout : 'form',
					// autoScroll : true,
					items : [this.form, this.report],
					listeners : {
						close : this.gridremove.createDelegate(this)
					}

				});
		this.switchAnalysisType(1);
		return this.schWin;
	},
	getfreWin : function(num) {
		this.crosslsh = num;
		this.starttimeField = new cms.form.DateFieldCtrl({
					name : 'starttimeField',
					width : 160,
					fieldLabel : '开始时间',
					defaultValue : new Date(bay.common.getMiniDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});
		/**
		 * 结束日期
		 */
		this.stoptimeField = new cms.form.DateFieldCtrl({
					name : 'stoptimeField',
					width : 160,
					fieldLabel : '结束时间',
					defaultValue : new Date(bay.common.getMaxDate()),
					dataFormat : 'yyyy-MM-dd HH:mm:ss'
				});

		var conditionTypes = [[1, '大于等于'], [-1, '小于等于'], [0, '等于']];
		this.conditionBox = new Ext.form.ComboBox({
			store : new Ext.data.ArrayStore({
						fields : ['key', 'value'],
						data : conditionTypes
					}),
			fieldLabel : '频度设置',
			valueField : 'key',
			displayField : 'value',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			value : 1,
			emptyText : '请选择'
				// ,
				// listeners : { //频度大小是否联动暂时没有做
				// select : this.switchHandler.createDelegate(this)
				// }
			});
		var stepArrays = [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'],
				[6, '6'], [7, '7'], [8, '8'], [9, '9'], [10, '10']];
		this.stepBox = new Ext.form.ComboBox({
			store : new Ext.data.ArrayStore({
						fields : ['key', 'value'],
						data : stepArrays
					}),
			fieldLabel : '频度阈值',
			valueField : 'key',
			displayField : 'value',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			value : 1,
			emptyText : '请选择'
				// ,
				// listeners : { //频度大小是否联动暂时没有做
				// select : this.switchHandler.createDelegate(this)
				// }
			});

		this.btnSearch = new Ext.Button({
					width : 60,
					height : 51,
					text : '分析',
					handler : this.onfreHandler.createDelegate(this)
				});
		this.form = new Ext.form.FormPanel({
					columnWidth : .60,
					collapseMode : 'mini',
					split : true,
					labelAlign : 'right',
					region : 'north',
					height : 72,
					border : false,
					frame : false,
					labelWidth : 72,
					items : [{
						style : 'padding:10px 0px 5px 0px',
						width : 790,
						layout : 'column',
						border : false,
						frame : false,
						defaults : {
							labelWidth : 72,
							layout : 'form',
							border : false,
							frame : false
						},
						items : [{
							// columnWidth : .70,
							width : 545,
							items : [{
										layout : 'column',
										width : '100%',
										border : false,
										frame : false,
										defaults : {
											labelWidth : 72,
											layout : 'form',
											border : false,
											frame : false
										}

									}, {
										layout : 'column',
										width : '100%',
										border : false,
										frame : false,
										defaults : {
											labelWidth : 72,
											layout : 'form',
											border : false,
											frame : false
										},
										items : [{
											columnWidth : .50,
											// labelWidth : 82,
											items : this.starttimeField
													.getControl()
										}, {
											columnWidth : .50,
											// labelWidth : 82,
											items : this.stoptimeField
													.getControl()
										}]

									}, {
										layout : 'column',
										width : '100%',
										border : false,
										frame : false,
										defaults : {
											labelWidth : 72,
											layout : 'form',
											border : false,
											frame : false
										},
										items : [{
													columnWidth : .50,
													// labelWidth : 82,
													items : this.conditionBox
												}, {
													columnWidth : .50,
													// labelWidth : 82,
													items : this.stepBox
												}]

									}]
						}, {
							// columnWidth : .30,
							width : 230,
							items : [this.btnSearch]
						}]
					}]
				});
		this.reader = new Ext.data.JsonReader({
					root : 'root',
					totalProperty : 'total',
					successProperty : 'success',
					fields : [{
								name : 'crossingname',
								mapping : 'crossingname'
							}, {
								name : 'plateinfo',
								mapping : 'plateinfo'
							}, {
								name : 'passcount',
								mapping : 'passcount'
							}, {
								name : 'crosslsh',
								mapping : 'crosslsh'
							}]
				});
		this.store = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/frequencyAction!getSelfData.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.reader,
					listeners : {
						load : this.GridLoad.createDelegate(this)
						// 新增，置换标志位
					}
				});
		this.storepage = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/frequencyAction!getSelfData.action',
								timeout : EXT_QUERY_TIME_OUT
							}),
					reader : this.reader,
					listeners : {
						load : this.afterload.createDelegate(this)
					}
				});
		// var sm = new Ext.grid.CheckboxSelectionModel();
		this.cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : false
						// 不排序
					},
					columns : [new Ext.grid.RowNumberer(), {
								header : crossingManageName + '名称',
								dataIndex : 'crossingname',
								width : 250
							}, {
								header : '车牌',
								dataIndex : 'plateinfo',
								width : 180
							}, {
								header : '频度',
								dataIndex : 'passcount',
								align : 'right',
								width : 150
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({

					ds : this.store,
					height : 383,
					cm : this.cm,
					viewConfig : {
						forceFit : true
					},
//					view : new Ext.ux.grid.BufferView({
//								rowHeight : 20,
//								scrollDelay : false
//							}),
					border : false,
					columnLines : false,
					frame : false,
					autoScroll : true,
					trackMouseOver : true,
					loadMask : true,
					stripeRows : true
				});
		this.resultPanel.on('rowdblclick', function(grid, rowIndex, event) {
	    	var plateNO = grid.getStore().getAt(rowIndex).get('plateinfo');
	    	var crossLsh = grid.getStore().getAt(rowIndex).get('crosslsh');;
	    	var startTime = this.getStore().baseParams.BeginTime;
	    	var stopTime = this.getStore().baseParams.EndTime;
	    	var win = new cms.frequency.carDetailWindow({crossLsh:crossLsh,plateNO:plateNO,startTime:startTime,stopTime:stopTime,isFirstQuery:true});
	    	// 赋给全局变量，当浏览器大小变化时，使详情窗口的位置随之调整
	    	wind = win;
	    	win.getControl().show();
	    });
		this.schWin = new Ext.Window({
					title : '频度分析',
					resizable : false,
					frame : true,
					border : false,
					width : 635,
					modal : true,
					height : 510,
					layout : 'form',
					items : [this.form, this.resultPanel],
					bbar : new Ext.PagingToolbar({
								pageSize : 50,
								store : this.storepage,
								displayInfo : true,
								displayMsg : '第 {0} 到 {1} 条数据 共{2}条',
								emptyMsg : "没有数据"
							}),
					listeners : {
						close : function(){bayclick=true;}
					}
				});

		return this.schWin;

	},
	getbayintimeWin : function(num) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:27:24
		 * @description:实时过车界面
		 */
		this.crosslsh = num;
		var form = new cms.emap.carPicMonitorForm({});
		this.controlItem.add('form', form);

		var carPicMonitorReport = new cms.emap.carPicMonitorReport({});
		this.controlItem.add('carPicMonitorReport', carPicMonitorReport);
		// 导航主面板
		this.intimeWin = new Ext.Window({
					id : 'intime',
					title : '实时过车信息',
					modal : true,
					resizable : false,
					frame : true,
					border : false,
					width : 613,
					height : 510,
					layout : 'form',
					items : [form.getControl(),
							carPicMonitorReport.getControl()],
					listeners : {
						close : this.passremove.createDelegate(this)
					}

				});
		return this.intimeWin;

	},
	showpre : function(num, element) {
		Ext.Ajax.request({
					url : 'crossingConfigAction!findCrossingByElementId.action',
					params : {
						elementId : element
					},
					success : function(response) {
						var jsonResult = Ext.util.JSON
								.decode(response.responseText);
						var crossingIndex = jsonResult[0].crossingIndex;
						var crossingIp = jsonResult[0].crossingIp;
						var drivewayNum = jsonResult[0].drivewayNum;
						var crossingPort = jsonResult[0].crossingPort;
						var serverip = jsonResult[0].serverip;
						var serverport = jsonResult[0].serverport;
						var servername = jsonResult[0].servername;
						/**
						 * @author zhangsl
						 * @date : 2011-6-11 下午07:12:34
						 * @description:以下为初始化连接控件
						 */
						var m_szOCXControl = document
								.getElementById("SeeChanPicOCX");
						if (m_szOCXControl.object == null) {
							cms.ext.alert('提示', "请下载并安装控件！");
							return;
						}

						try {
							m_szOCXControl.SetIVMSType(top.crossingManageName); // 设置显示
							m_szOCXControl.SetIVMSType("20"); // 设置显示毫秒
							var crossNum = 0;
							var XmlDoc = new ActiveXObject("MSXML2.DOMDocument");
							var Instruction = XmlDoc
									.createProcessingInstruction("xml",
											"version='1.0' encoding='utf-8'");
							XmlDoc.appendChild(Instruction);
							var Root = XmlDoc.createNode(1, "RequestAllInfo",
									"");

							var alarmServerInfosRoot = XmlDoc.createNode(1,
									"AlarmServerInfos", ""); // //请求报警服务器

							Element = XmlDoc.createElement("AlarmServerCount"); // //请求报警服务器
							Element.text = drivewayNum;
							alarmServerInfosRoot.appendChild(Element);
							var alarmServerInfoRoot = XmlDoc.createNode(1,
									"AlarmServerInfo", "");
							Element = XmlDoc.createElement("RequestType"); // //请求报警服务器
							Element.text = 0;
							alarmServerInfoRoot.appendChild(Element);

							Element = XmlDoc.createElement("ServerIP");
							Element.text = serverip;
							alarmServerInfoRoot.appendChild(Element);

							Element = XmlDoc.createElement("ServerPort");
							Element.text = serverport;
							alarmServerInfoRoot.appendChild(Element);

							Element = XmlDoc.createElement("ServerName");
							Element.text = servername;
							alarmServerInfoRoot.appendChild(Element);

							var szAllCrossingInfo = XmlDoc.createNode(1,
									"AllCrossingInfo", "");

							// crossNum = 1

							Element = XmlDoc.createElement("CrossingNum");
							Element.text = 1;
							szAllCrossingInfo.appendChild(Element);

							Element = XmlDoc.createElement("CrossingLsh");
							Element.text = num;
							szAllCrossingInfo.appendChild(Element);

							alarmServerInfoRoot.appendChild(szAllCrossingInfo);

							var szSubCrossingInfo = XmlDoc.createNode(1,
									"SubCrossingInfo", "");

							// crossNum = 1

							Element = XmlDoc.createElement("CrossingNum");
							Element.text = 1;
							szSubCrossingInfo.appendChild(Element);

							Element = XmlDoc.createElement("CrossingLsh");
							Element.text = num;
							szSubCrossingInfo.appendChild(Element);

							alarmServerInfoRoot.appendChild(szSubCrossingInfo);

							alarmServerInfosRoot
									.appendChild(alarmServerInfoRoot);
							Root.appendChild(alarmServerInfosRoot);

							var sectionServerInfosRoot = XmlDoc.createNode(1,
									"SectionServerInfos", ""); // //请求报警服务器
							Element = XmlDoc
									.createElement("SectionServerCount"); // //请求报警服务器
							Element.text = 0;
							sectionServerInfosRoot.appendChild(Element);

							for (i = 0; i < 0; i++) {
								var sectionServerInfoRoot = XmlDoc.createNode(
										1, "SectionServerInfo", "");

								Element = XmlDoc.createElement("ServerIP");
								Element.text = quJianServerArray[i].serverIp;
								sectionServerInfoRoot.appendChild(Element);

								Element = XmlDoc.createElement("ServerPort");
								Element.text = quJianServerArray[i].serverPort;
								sectionServerInfoRoot.appendChild(Element);

								Element = XmlDoc.createElement("ServerName");
								Element.text = quJianServerArray[i].serverName;
								sectionServerInfoRoot.appendChild(Element);

								var sectionInfoRoot = XmlDoc.createNode(1,
										"SectionInfo", "");

								var quJianLshArray = quJianServerArray[i].quJianLsh
										.split(",");
								var quJianNum = quJianLshArray.length;

								Element = XmlDoc.createElement("SectionNum");
								Element.text = quJianNum;
								sectionInfoRoot.appendChild(Element);

								for (j = 0; j < quJianNum; j++) {
									Element = XmlDoc
											.createElement("SectionLsh");
									Element.text = quJianLshArray[j];
									sectionInfoRoot.appendChild(Element);
								}

								sectionServerInfoRoot
										.appendChild(sectionInfoRoot);
								sectionServerInfosRoot
										.appendChild(sectionServerInfoRoot);
							}
							Root.appendChild(sectionServerInfosRoot);
							XmlDoc.appendChild(Root);
							m_szOCXControl.LinkToAllServer(XmlDoc.xml);

						} catch (err) {
							cms.ext.alert('提示', err.description);
						}
						// var now = new Date();
						// var exitTime = now.getTime() + 3000;
						// while (true) {
						// now = new Date();
						// if (now.getTime() > exitTime) {
						// break;
						// } else {
						// continue;
						// }
						// }
						o = this;
						setTimeout(function() {
									o.grouphandle(drivewayNum, serverip,
											serverport, servername, num);
								}, 3000);
						// Ext.getCmp("vehicleGird").getStore().removeAll();
						// TryGetWarningPassCarInfo();
						// TryGetPassCarInfo();

					}.createDelegate(this),
					failure : function(response) {
						cms.ext.alert(' 错误', '查询失败!');
					}
				}, this);

	},
	grouphandle : function(drivewayNum, serverip, serverport, servername, num) {
		if (lint === 1) {
			var XmlDoc = new ActiveXObject("MSXML2.DOMDocument");
			var Instruction = XmlDoc.createProcessingInstruction("xml",
					"version='1.0' encoding='utf-8'");
			XmlDoc.appendChild(Instruction);
			var Root = XmlDoc.createNode(1, "RequestInfo", "");
			var Element = XmlDoc.createElement("RequestType"); // //请求报警服务器
			Element.text = 1;
			Root.appendChild(Element);
			Element = XmlDoc.createElement("GroupLaneCount"); // //请求报警服务器
			Element.text = drivewayNum;
			Root.appendChild(Element);

			var groupInfoRoot = XmlDoc.createNode(1, "GroupInfo", "");
			Element = XmlDoc.createElement("AlarmServerIp"); // //请求报警服务器
			Element.text = serverip;;
			groupInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("ServerPort");
			Element.text = serverport;
			groupInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("ServerName");
			Element.text = servername;
			groupInfoRoot.appendChild(Element);

			// var szCrossingInfo = XmlDoc.createNode(1,"CrossingInfo","");
			crossNum = 1;
			Element = XmlDoc.createElement("AlarmLaneCount");
			Element.text = drivewayNum;
			groupInfoRoot.appendChild(Element);

			for (j = 0; j < drivewayNum; j++) {
				Element = XmlDoc.createElement("CrossLsh");
				Element.text = num;
				groupInfoRoot.appendChild(Element);

				Element = XmlDoc.createElement("ChanLsh");
				Element.text = j + 1;
				groupInfoRoot.appendChild(Element);

				Element = XmlDoc.createElement("PlayNum");
				Element.text = 0;
				groupInfoRoot.appendChild(Element);
			}

			Root.appendChild(groupInfoRoot);

			var groupLsh = num;

			XmlDoc.appendChild(Root);
			var m_szOCXControl = document.getElementById("SeeChanPicOCX");
			// alert(XmlDoc.xml);
			m_szOCXControl.GetGroupCrossingEx(1, XmlDoc.xml);
			// TryGetPassCarInfo();
		} else {
			lint = 1
		}
	},
	onfreHandler : function() {
		if (this.starttimeField.getValue().trim() == ''
				|| this.stoptimeField.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.starttimeField.getValue() != ''
				&& this.stoptimeField.getValue() != '') {
			if (cms.util.compareDateTime(this.stoptimeField.getValue(),
					this.starttimeField.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				return;
			}
		}
		this.isReady = false;
		this.isConfigured = false;
		this.resultPanel.reconfigure(this.store, this.cm);
		this.store.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			crossArray : this.crosslsh, // 获取路口的流水号
			BeginTime : this.starttimeField.getValue(), // 开始时间
			EndTime : this.stoptimeField.getValue(), // 结束时间
			conditionBox : this.conditionBox.getValue(),
			stepBox : this.stepBox.getValue(),
			total : 50
			// 获取路口的流水号
		};
		this.store.load();
		this.storepage.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			crossArray : this.crosslsh, // 获取路口的流水号
			BeginTime : this.starttimeField.getValue(), // 开始时间
			EndTime : this.stoptimeField.getValue(), // 结束时间
			conditionBox : this.conditionBox.getValue(),
			stepBox : this.stepBox.getValue(),
			total : -1
			// 获取路口的流水号
		};
		this.storepage.load();

	},
	onSearchHandler : function() {
		if (this.starttimeField.getValue().trim() == ''
				|| this.stoptimeField.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.starttimeField.getValue() != ''
				&& this.stoptimeField.getValue() != '') {
			if (cms.util.compareDateTime(this.stoptimeField.getValue(),
					this.starttimeField.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				return;
			}
		}
		this.store.baseParams = {
			operate : "Search",
			crosslsh : this.crosslsh, // 获取路口的流水号
			starttime : this.starttimeField.getValue(), // 开始时间
			stoptime : this.stoptimeField.getValue()
			// 结束时间
		};
		this.store.load();
	},
	afterload : function() {
		if (this.isReady) {
			if (!this.isConfigured) { // 只在第一次加载完毕的时候，为vehiclePassGrid重新赋数据源
				this.resultPanel.reconfigure(this.storepage, this.cm);
				this.storepage.baseParams.total = this.storepage
						.getTotalCount();
				this.isConfigured = true;
			}
			// else 下一页的情况就不用重复赋数据源了。
		} else {
			var o = this; // 解决setTimeout的参数中有this的问题
			setTimeout(function() {
						o.afterload()
					}, VEHICLEPASSTORE_TIMETERVAL);// VEHICLEPASSTORE_TIMETERVAL毫秒
		}
	},
	onvehiclealarmHandler : function() {
		if (this.starttimeField.getValue().trim() == ''
				|| this.stoptimeField.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.starttimeField.getValue() != ''
				&& this.stoptimeField.getValue() != '') {
			if (cms.util.compareDateTime(this.stoptimeField.getValue(),
					this.starttimeField.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				return;
			}
		}
		var plateBefore = this.croCmb.getValue();
		var plateAfter = this.crotext.getValue().toUpperCase();
		var plateNO = "";
		var alarmAction = this.alarmActionBox.getValue() == '全部'
				? -100
				: this.alarmActionBox.getValue();
		// 车牌号
		if ((plateBefore == "全部" || plateBefore == "-100" || plateBefore == "-1")
				&& plateAfter == "") {
			plateNO = "";
		} else {
			if (plateBefore == "全部" || plateBefore == "-100"
					|| plateBefore == "-1") {
				plateBefore = "%";
			}

			if (plateAfter != "" && plateAfter.indexOf("*") < 0
					&& plateAfter.indexOf("?") < 0) {
				plateAfter = '%' + plateAfter + '%';
			}
			if (plateAfter == "") {
				plateAfter = "%";
			}
			plateAfter = plateAfter.replace(/\?/g, "_");
			plateAfter = plateAfter.replace(/\*/g, "%");
			plateNO = plateBefore + plateAfter;
		}
		this.isReady = false;
		this.isConfigured = false;
		this.resultPanel.reconfigure(this.store, this.cm);
		this.store.baseParams = {
			operate : "Search",
			plateNO : plateNO,
			start : 0,
			limit : 50,
			crossLsh : this.crosslsh, // 获取路口的流水号
			startTime : this.starttimeField.getValue(), // 开始时间
			stopTime : this.stoptimeField.getValue(),
			// 结束时间
			laneID : -100,
			ignorePlateNO : -100,
			directionID:-100,
			alarmAction : alarmAction,
			processStatus : -100,
			total : 50
		};
		this.store.load();
		this.storepage.baseParams = {
			operate : "Search",
			plateNO : plateNO,
			start : 0,
			limit : 50,
			crossLsh : this.crosslsh, // 获取路口的流水号
			startTime : this.starttimeField.getValue(), // 开始时间
			stopTime : this.stoptimeField.getValue(),
			// 结束时间
			laneID : -100,
			ignorePlateNO : -100,
			directionID:-100,
			alarmAction : alarmAction,
			processStatus : -100,
			total : -1
		};
		this.storepage.load();
	},
	onvehiclepassHandler : function() {
		if (this.starttimeField.getValue().trim() == ''
				|| this.stoptimeField.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.starttimeField.getValue() != ''
				&& this.stoptimeField.getValue() != '') {
			if (cms.util.compareDateTime(this.stoptimeField.getValue(),
					this.starttimeField.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				return;
			}
		}
		var plateBefore = this.croCmb.getValue();
		var plateAfter = this.crotext.getValue().toUpperCase();
		var plateNO = "";
		if ((plateBefore == "全部" || plateBefore == "-100" || plateBefore == "-1")
				&& plateAfter == "") {
			plateNO = "";
		} else {
			if (plateBefore == "全部" || plateBefore == "-100"
					|| plateBefore == "-1") {
				plateBefore = "%";
			}

			if (plateAfter != "" && plateAfter.indexOf("*") < 0
					&& plateAfter.indexOf("?") < 0) {
				plateAfter = '%' + plateAfter + '%';
			}
			if (plateAfter == "") {
				plateAfter = "%";
			}
			plateAfter = plateAfter.replace(/\?/g, "_");
			plateAfter = plateAfter.replace(/\*/g, "%");
			plateNO = plateBefore + plateAfter;
		}
		this.isReady = false;
		this.isConfigured = false;
		this.resultPanel.reconfigure(this.store, this.cm);
		this.store.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			crossLsh : this.crosslsh, // 获取路口的流水号
			startTime : this.starttimeField.getValue(), // 开始时间
			stopTime : this.stoptimeField.getValue(),
			laneID : -100,
			carType : -100,
			plateType : -100,
			vehicleColorDepth : -100,
			multiTime : "",
			searchType : 1,
			vehicleColor : "0,6,12,5,11,4,10,3,9,2,8,1,7,-100",
			plateColor : "4,3,2,1,0,-100",
			carSpeedRange : "",
			carLenRange : "",
			directionID:-100,
			plateNO : plateNO,
			total : 50
			// 结束时间
		};
		this.store.load();
		this.storepage.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			crossLsh : this.crosslsh, // 获取路口的流水号
			startTime : this.starttimeField.getValue(), // 开始时间
			stopTime : this.stoptimeField.getValue(),
			laneID : -100,
			carType : -100,
			plateType : -100,
			vehicleColorDepth : -100,
			multiTime : "",
			searchType : 1,
			vehicleColor : "0,6,12,5,11,4,10,3,9,2,8,1,7,-100",
			plateColor : "4,3,2,1,0,-100",
			carSpeedRange : "",
			carLenRange : "",
			directionID:-100,
			plateNO : plateNO,
			total : -1
			// 结束时间
		};
		this.storepage.load();
	},
	oncarSearchHandler : function() {
		this.searchData({
				operate : "Search",
				crossingLsh : this.crosslsh,
				laneId : this.laneNoBox.getValue() == '全部'
						? '-100'
						: this.laneNoBox.getValue(),
				carType : this.carTypeBox.getValue() == '全部'
						? -100
						: this.carTypeBox.getValue(),
				plateType : this.plateTypeBox.getValue() == '全部'
						? -100
						: this.plateTypeBox.getValue(),
				plateColor : this.plateColorBox.getValue() == '全部'
						? -100
						: this.plateColorBox.getValue(),
				vehicleColor : this.VehicleColorBox.getValue() == '全部'
						? -100
						: this.VehicleColorBox.getValue(),
				directionIndex : this.dIndexBox.getValue() == '全部'
						? -100
						: this.dIndexBox.getValue(),
				belong : '-100',
				reportType : this.comboReportType.getValue(),
				timeRange : this.dateStartDate.getValue(),
				timeStart : '00:00:00',
				timeEnd : '23:59:59',
				statsType : this.statsTypeVal,
				crossType : 0
			});
//		var eventObject = {
//			eventCode : 'CartrafficFormEvent1',
//			sender : this,
//			params : {
//				operate : "Search",
//				crossingLsh : this.crosslsh,
//				laneId : this.laneNoBox.getValue() == '全部'
//						? '-100'
//						: this.laneNoBox.getValue(),
//				carType : this.carTypeBox.getValue() == '全部'
//						? -100
//						: this.carTypeBox.getValue(),
//				plateType : this.plateTypeBox.getValue() == '全部'
//						? -100
//						: this.plateTypeBox.getValue(),
//				plateColor : this.plateColorBox.getValue() == '全部'
//						? -100
//						: this.plateColorBox.getValue(),
//				vehicleColor : this.VehicleColorBox.getValue() == '全部'
//						? -100
//						: this.VehicleColorBox.getValue(),
//				directionIndex : this.dIndexBox.getValue() == '全部'
//						? -100
//						: this.dIndexBox.getValue(),
//				belong : '-100',
//				reportType : this.comboReportType.getValue(),
//				timeRange : this.dateStartDate.getValue(),
//				timeStart : '00:00:00',
//				timeEnd : '23:59:59',
//				statsType : this.statsTypeVal,
//				crossType : 0
//			}
//		};
//		this.fireEvent(eventObject.eventCode, eventObject);
	},
	switchAnalysisType : function(reportType) {
		this.laneNoBox.enable();
		this.carTypeBox.enable();
		this.plateTypeBox.enable();
		this.VehicleColorBox.enable();
		this.dIndexBox.enable();
		// this.gsdBox.enable();
		this.statsTypeVal = parseInt(reportType, 10);
		switch (reportType) {
			case 1 :
				this.laneNoBox.setValue('全部');
				this.laneNoBox.disable();
				break;
			case 2 : // 方向
				this.dIndexBox.setValue('全部');
				this.dIndexBox.disable();
				break;
			case 1002 :
				this.carTypeBox.setValue('全部');
				this.carTypeBox.disable();
				break;
			case 1001 :
				this.plateTypeBox.setValue('全部');
				this.plateTypeBox.disable();
				break;
			case 1004 :
				this.VehicleColorBox.setValue('全部');
				this.VehicleColorBox.disable();
				break;
			/*
			 * case 1022 : // 归属地 this.gsdBox.setValue('全部');
			 * this.gsdBox.disable(); break;
			 */
			default :
				break;
		}
	},

	switchReportType : function(reportType) {
		switch (reportType) {
			case 0 : // 日报
				this.dateFormatStr = 'yyyy-MM-dd';
				this.dateStartDate.setLabel("统计日期:");
				break;
			case 1 : // 月报
				this.dateFormatStr = "yyyy-MM";
				this.dateStartDate.setLabel("统计月份:");
				break;
			case 2 : // 年报
				this.dateFormatStr = "yyyy";
				this.dateStartDate.setLabel("统计年份:");
				break;
			default :
				break;
		}
		var now = new Date();
		this.dateStartDate.setNowValue(now, this.dateFormatStr);
		this.dateStartDate.onClick(this.dateFormatStr);
	},
	createToolBar : function() {
		// 布控
		this.showTypes = [[2, '柱状图展示'], [1, '曲线图展示'], [3, '饼状图展示'], [0, '列表展示']];
		this.showTypeBox = new Ext.form.ComboBox({
					store : new Ext.data.ArrayStore({
								fields : ['key', 'value'],
								data : this.showTypes
							}),
					valueField : 'key',
					displayField : 'value',
					mode : 'local',
					editable : false,
					triggerAction : 'all',
					value : 2,
					emptyText : '请选择',
					listeners : {
						select : this.switchShowTypeHandler.createDelegate(this)
					}
				});
		return toolbar = new Ext.Toolbar({
					width : '100%',
					height : 30,
					cls : 'analysis-toolbar',
					items : [this.showTypeBox, {
								xtype : 'tbfill'
							}]
				});
	},
	getWidthOfCUIC : function() {
		var width_CUIC;
		switch (Ext.getBody().getWidth()) {
			case 1680 :
				width_CUIC = 130;
				break;
			case 1280 :
				width_CUIC = 130;
				break;
			case 1024 :
				width_CUIC = 70;
				break;
			default :
				width_CUIC = 70;
				break;
		}
		return width_CUIC;
	},
	createTrafficGrid : function() {
		this.cartrafficStore = new Ext.data.Store({

			proxy : new Ext.data.HttpProxy({

						url : path
								+ '/analysisbayAction!findCarTrafficReport.action'
					}),
			reader : new Ext.data.JsonReader({
						root : 'root',
						totalProperty : 'total',
						successProperty : 'success',
						fields : [{
									name : 'typeName'
								}, {
									name : 'sum'
								}, {
									name : 'time1'
								}, {
									name : 'time2'
								}, {
									name : 'time3'
								}, {
									name : 'time4'
								}, {
									name : 'time5'
								}, {
									name : 'time6'
								}, {
									name : 'time7'
								}, {
									name : 'time8'
								}, {
									name : 'time9'
								}, {
									name : 'time10'
								}, {
									name : 'time11'
								}, {
									name : 'time12'
								}, {
									name : 'time13'
								}, {
									name : 'time14'
								}, {
									name : 'time15'
								}, {
									name : 'time16'
								}, {
									name : 'time17'
								}, {
									name : 'time18'
								}, {
									name : 'time19'
								}, {
									name : 'time20'
								}, {
									name : 'time21'
								}, {
									name : 'time22'
								}, {
									name : 'time23'
								}, {
									name : 'time24'
								}, {
									name : 'time25'
								}, {
									name : 'time26'
								}, {
									name : 'time27'
								}, {
									name : 'time28'
								}, {
									name : 'time29'
								}, {
									name : 'time30'
								}, {
									name : 'time31'
								}]
					}),
					listeners : {
							load : function(){ExtWaitSerach(0);}
						}
		});

		this.cartrafficStore.load();
		this.sm = new Ext.grid.CheckboxSelectionModel();
		this.cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : false, // 不排序
						width : 45
					},
					columns : [{
								header : this.statusTypeName,
								dataIndex : 'typeName',
								width : 110
							}, {
								header : '1',
								dataIndex : 'time1',
								align : 'center'
							}, {
								header : '2',
								dataIndex : 'time2',
								align : 'center'
							}, {
								header : '3',
								dataIndex : 'time3',
								align : 'center'
							}, {
								header : '4',
								dataIndex : 'time4',
								align : 'center'
							}, {
								header : '5',
								dataIndex : 'time5',
								align : 'center'
							}, {
								header : '6',
								dataIndex : 'time6',
								align : 'center'
							}, {
								header : '7',
								dataIndex : 'time7',
								align : 'center'
							}, {
								header : '8',
								dataIndex : 'time8',
								align : 'center'
							}, {
								header : '9',
								dataIndex : 'time9',
								align : 'center'
							}, {
								header : '10',
								dataIndex : 'time10',
								align : 'center'
							}, {
								header : '11',
								dataIndex : 'time11',
								align : 'center'
							}, {
								header : '12',
								dataIndex : 'time12',
								align : 'center'
							}, {
								header : '13',
								dataIndex : 'time13',
								align : 'center'
							}, {
								header : '14',
								dataIndex : 'time14',
								align : 'center'
							}, {
								header : '15',
								dataIndex : 'time15',
								align : 'center'
							}, {
								header : '16',
								dataIndex : 'time16',
								align : 'center'
							}, {
								header : '17',
								dataIndex : 'time17',
								align : 'center'
							}, {
								header : '18',
								dataIndex : 'time18',
								align : 'center'
							}, {
								header : '19',
								dataIndex : 'time19',
								align : 'center'
							}, {
								header : '20',
								dataIndex : 'time20',
								align : 'center'
							}, {
								header : '21',
								dataIndex : 'time21',
								align : 'center'
							}, {
								header : '22',
								dataIndex : 'time22',
								align : 'center'
							}, {
								header : '23',
								dataIndex : 'time23',
								align : 'center'
							}, {
								header : '24',
								dataIndex : 'time24',
								align : 'center'
							}, {
								header : '25',
								dataIndex : 'time25',
								align : 'center'
							}, {
								header : '26',
								dataIndex : 'time26',
								align : 'center'
							}, {
								header : '27',
								dataIndex : 'time27',
								align : 'center'
							}, {
								header : '28',
								dataIndex : 'time28',
								align : 'center'
							}, {
								header : '29',
								dataIndex : 'time29',
								align : 'center'
							}, {
								header : '30',
								dataIndex : 'time30',
								align : 'center'
							}, {
								header : '31',
								dataIndex : 'time31',
								align : 'center'
							}, {
								header : '小计',
								dataIndex : 'sum',
								align : 'center',
								width : 60
							}]
				});
		this.cartrafficGrid = new Ext.grid.GridPanel({
					style : 'padding:3px 0px 0px 0px',
					region : 'center',
					store : this.cartrafficStore,
					border : false,
					autoScroll : true,
					frame : false,
					sm : this.sm,
					cm : this.cm,
					// forceFit : true,
					// viewConfig : {
					// forceFit : true
					// },
					height : 336,
					width : '100%'
				});
		this.controlItem.add('cartrafficGrid', this.cartrafficGrid);
		return this.cartrafficGrid;
	},
	searchData : function(params) {
		ExtWaitSerach(1);
		this.iload = false;
		this.searchParams = params;
		this.searchParams.queryFlag = 0;
		this.treeParams.initGridData = false;
		this.switchHandler();
	},
	ctrlReportLoad : function(typestr) {
		typeCode = 'cartrafficGrid';
		notCode = 'chart';
		for (var ind = 0, len = this.report.items.items.length; ind < len; ind++) {
			var item = this.report.items.items[ind];
			if (!item.hidden && item.code == notCode) {
				item.hide();
			} else if (item.code != notCode) {
				item.show();
			}
		}
		var grid = this.controlItem.get(typeCode);
		if (grid) {
			this.searchParams ? this.searchParams.initGridData = false : null;
			grid.treeParams = this.searchParams;
			this.report.doLayout();
		} else {
			grid = this.createTrafficGrid();
			grid.treeParams = this.searchParams;
			this.report.add(grid);
			this.report.doLayout();
		}

		for (var i = 13; i < 32; i++)
			grid.getColumnModel().setHidden(i, false);
		switch (typestr) {
			case 2 : // 年报表
				for (var i = 13; i < 32; i++)
					grid.getColumnModel().setHidden(i, true);
				break;
			case 1 : // 月报表
				var yearmonth = this.searchParams
						? this.searchParams.timeRange
						: '2011-01';
				var daynum = this.getMothDay(yearmonth);
				for (var i = daynum + 1; i < 32; i++)
					grid.getColumnModel().setHidden(i, true);
				break;
			case 0 :// 日报表

				for (var i = 25; i < 32; i++)
					grid.getColumnModel().setHidden(i, true);
				break;
			default :
				break;
		}
		return grid;
	},
	createFlashChart : function() {
		this.chart = new Ext.ux.OFC({
					code : 'chart',
					width : 945,
					height : 330,
					chartURL : '/common/js/ext/flash/open-flash-chart.swf',
					chartType : 'bar',
					dataURL : '/analysisbayAction!getChartData4CarTrafficStats.action'

				});

		this.controlItem.add('chart', this.chart);
	},
	/**
	 * 切换成flashreport
	 */
	switchFlashReport : function() {
		for (var ind = 0, len = this.report.items.items.length; ind < len; ind++) {
			var item = this.report.items.items[ind];
			if (!item.hidden && item.code != 'chart') {
				item.hide();
			} else if (item.code == 'chart') {
				item.show();
			}
			this.report.doLayout();
		}
		// [[0, '列表展示'], [1, '曲线图展示'], [2, '柱状图展示'], [3,
		// '饼状图展示']];
		
		switch (this.showTypeBox.getValue()) {
			case 0 :
				break;
			case 1 :
				this.chart.chartType = 'line';
				break;
			case 2 :
				this.chart.chartType = 'bar';
				break;
			case 3 :
				this.chart.chartType = 'pie';
				break;
			default :
				break
		}
		this.chart.reload(this.searchParams);
	},
	switchShowTypeHandler : function() {
						if(this.searchParams != null)
						{
						    this.searchParams.queryFlag = 1;
						}
						this.switchHandler();
					},
	/**
	 * 总的处理类
	 * 
	 * @param {}
	 *            params
	 */
	switchHandler : function() {
		if(this.searchParams != null)
		{
			ExtWaitSerach(1);
		}
		if (this.showTypeBox.getValue() > 0) {
			// flash
			this.switchFlashReport();
		} else {
			// grid
			this.switchGridReport();
		}
	},

	getMothDay : function(year_month) {
		var year = year_month.split('-')[0];
		var month = year_month.split('-')[1];
		month = parseInt(month, 10) + 1;
		var d = new Date(year + "/" + month + "/0");
		return d.getDate();
	},
	/**
	 * 
	 * @param {}
	 *            params
	 * @return {}
	 */
	switchGridReport : function() {
		var grid;
		grid = this.ctrlReportLoad(this.searchParams
				? this.searchParams.reportType
				: 0);
		switch (this.searchParams ? this.searchParams.statsType : 1) {
			case 1 :// 车道：
				statusTypeName = '车道名称';
				break;
			case 1002 :// 车辆类型
				statusTypeName = '车辆类型';
				break;
			case 1001 :// 车牌类型
				statusTypeName = '车牌类型';
				break;
			case 1004 :// 车身颜色
				statusTypeName = '车身颜色';
				break;
			case 2 :
				statusTypeName = '方向名称';
				break;
			case 1022 :
				statusTypeName = '归属地';
				break;
			default :
				break;
		}
		// alert(this.iload);
		if (this.iload == false) {

			this.cartrafficStore.load({
						params : this.searchParams
					});

		}
		this.iload = false;
		grid.getColumnModel().setColumnHeader(0, statusTypeName);
		return grid;
	},
	gridremove : function() {
		bayclick=true;
		if (this.cartrafficStore != null) {
			this.cartrafficStore.removeAll();
		}
		this.controlItem.remove('cartrafficGrid');

	},
	passremove : function() {
		bayclick=true;
		RemovePassCarInfo();
	}

});
