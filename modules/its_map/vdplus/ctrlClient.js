/**
 * @description 添加监控点的属性form,用于设置监控点的
 * @date 2011/05/16
 * @author zhangsl
 */
Ext.namespace('cms.emap');
cms.emap.ctrlClient = function(config) {
	this.mapApp = undefined;
	this.title = '显示内容';
	this.updateNodeUrl = '/ezEmapInfoAction!changeElementXmlRev.action';
	cms.emap.ctrlClient.superclass.constructor.call(this, config);
};

Ext.extend(cms.emap.ctrlClient, Ext.ux.BaseControl, {
	form : undefined,
	sm : undefined,
	cm : undefined,
	serachBtn : undefined,
	loadMapBtn : undefined,
	printBtn : undefined,
	toolbar : undefined,
	tabpanel : undefined,
	store : undefined,
	radius : undefined,
	schWin : undefined,
	Rectangle : [],
	shuzu : [],
	Rectangle : [],
	str : '',
	cameraCheckBox : undefined,
	ioInCheckBox : undefined,
	ioOutCheckBox : undefined,
	elObj : undefined,
	cameraId : undefined,
	playOCXObj : undefined,
	updateFlag : false,
	reader : undefined,
	isReady : false, // 判断Grid的store是否加载完毕
	isConfigured : false,
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		this.cameraCheckBox = new Ext.form.Checkbox({
					hideLabel : true,
					code : 'cameraCheckBox',
					boxLabel : '监控点',
					checked : true,
					listeners : {
						check : this.swtchDisMode.createDelegate(this)

					}
				});
		this.ioInCheckBox = new Ext.form.Checkbox({
					hideLabel : true,
					code : 'ioInCheckBox',
					boxLabel : '报警输入',
					checked : true,
					listeners : {
						check : this.swtchDisMode.createDelegate(this)

					}
				});
		this.ioOutCheckBox = new Ext.form.Checkbox({
					hideLabel : true,
					code : 'ioOutCheckBox',
					checked : true,
					boxLabel : '报警输出',
					listeners : {
						check : this.swtchDisMode.createDelegate(this)

					}
				});
		this.displayRegion = new Ext.form.FormPanel({
					title : this.title,
					labelAlign : 'left',
					border : false,
					frame : false,
					height : 100,
					items : [{
						width : 200,
						layout : 'column',
						border : false,
						frame : false,
						defaults : {
							layout : 'form',
							border : false,
							frame : false
						},
						items : [{
									style : 'padding:10px 0px 0px 10px',
									labelWidth : 56,
									columnWidth : 0.5,
									items : [this.cameraCheckBox,
											this.ioInCheckBox]
								}, {
									style : 'padding:10px 0px 0px 10px',
									labelWidth : 56,
									columnWidth : 0.5,
									items : [this.ioOutCheckBox]
								}]
					}]
				});
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
		this.rectBtn = new Ext.Button({
					width : 70,
					text : '开始选择',
					handler : this.rectHandler.createDelegate(this)
				});
		this.bayseachBtn = new Ext.Button({
					width : 70,
					text : '查询',
					handler : this.carNum.createDelegate(this)

				});
		this.celrectBtn = new Ext.Button({
					width : 70,
					text : '重置'/*,
					handler : this.celrectHandler.createDelegate(this)
*/
				});
		this.bayseachBtn1 = new Ext.Button({
			width : 100,
			text : '查询'
				// handler : this.rectHandler.createDelegate(this),

			});
		this.qypz = new Ext.form.FormPanel({
					title : "区域碰撞",
					labelAlign : 'left',
					border : false,
					frame : false,
					height : 150,
					labelWidth : 62,
					items : [{
								width : 230,
								layout : 'column',
								border : false,
								frame : false,
								defaults : {
									labelWidth : 62,
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
											style : 'padding:5px 0px 0px 1px',
											items : this.starttimeField
													.getControl()
										}, {
											style : 'padding:0px 0px 0px 1px',
											items : this.stoptimeField
													.getControl()
										}, {
											layout : 'column',
											style : 'padding:5px 0px 0px 1px',
											items : [this.rectBtn, {
														width : 3
													}, this.bayseachBtn, {
														width : 3
													}, this.celrectBtn]
										}]
							}]
				});
		this.presetPanel = new cms.emap.presetCtrl({
					mapApp : this.mapApp
				});
		this.allPanel = new Ext.Panel({
					layout : 'column',
					width : 235,
					height : 245,
					border : true,
					frame : true,
					items : [/* this.displayRegion, */
					this.presetPanel.getControl(), this.qypz]
				});

		return this.allPanel;

	},
	carNum : function(gsshuzu) {
		this.gsshuzu = gsshuzu;
		if (gsshuzu == "" || gsshuzu.length == 0) {
			Ext.MessageBox.alert("错误提示", "请选择元素");
			return
		}
		var win = this.getCarNum();
		win.show();
		this.isReady = false;
		this.isConfigured = false;
		this.resultPanel.reconfigure(this.store, this.cm);
		this.store.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			shuzu : gsshuzu,
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
			plateNO : "",
			total : 50
			// 获取路口的流水号
		};
		this.store.load();
		this.storepage.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			shuzu : gsshuzu,
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
			plateNO : "",
			total : -1
			// 获取路口的流水号
		};
		this.storepage.load();
	},
	bayseachHandler : function(gsshuzu,platenum) {
		this.gsshuzu = gsshuzu;
		if (gsshuzu == "" || gsshuzu.length == 0) {
			Ext.MessageBox.alert("错误提示", "请选择元素");
			return
		}
		var win = this.getvehiclepassWin();
		win.show();
		this.isReady = false;
		this.isConfigured = false;
		this.resultPanel.reconfigure(this.store, this.cm);
		this.store.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			shuzu : gsshuzu,
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
			plateNO : platenum,
			total : 50
			// 获取路口的流水号
		};
		this.store.load();
		this.storepage.baseParams = {
			operate : "Search",
			start : 0,
			limit : 50,
			shuzu : gsshuzu,
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
			plateNO : platenum,
			total : -1
			// 获取路口的流水号
		};
		this.storepage.load();
	},
	getCarNum : function() {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:27:24
		 * @description:卡口状态界面
		 */
		this.reader = new Ext.data.JsonReader({
					root : 'vehiclePassInfo',
					totalProperty : 'total',
					successProperty : 'success',
					fields : [{
								name : 'plateInfo',
								mapping : 'plateInfo'
							}]
				});
		this.crosslsh = 1;
		this.store = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/motorbusQueryAction!regionCollisionData.action',
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
										+ '/motorbusQueryAction!regionCollisionData.action',
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
								width : 250
							}]
				});
		this.resultPanel = new Ext.grid.GridPanel({
					ds : this.store,
					height : 455,
					// autoHeight:true,
					cm : this.cm,
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
					id : 'vehiclePassGridnum',
					stripeRows : true
				});
		this.resultPanel.on('rowdblclick', function(grid, rowIndex, event) {
					var plateInfo = grid.getStore().getAt(rowIndex)
							.get('plateInfo');
					this.bayseachHandler(this.gsshuzu,plateInfo);
				}.createDelegate(this));
		this.schWin = new Ext.Window({
					title : '区域碰撞车牌查询',
					resizable : false,
					frame : true,
					border : false,
					modal : true,
					width : 410,
					height : 510,
					modal : true,
					layout : 'form',
					items : [this.resultPanel],
					bbar : new Ext.PagingToolbar({
								pageSize : 50,
								store : this.storepage,
								displayInfo : true,
								displayMsg : '第 {0} 到 {1} 条数据 共{2}条',
								emptyMsg : "没有数据"
							}),
					listeners : {
						close : function() {
							this.gsshuzu.length = 0;
							var eventObject = {
								eventCode : 'ccRectEvent',
								sender : this,
								params : {
									operate : 'rectpre'
								}
							};
							this.fireEvent(eventObject.eventCode, eventObject);
							this.gis = 0;
						}.createDelegate(this)
					}

				});
		return this.schWin;
	},
	getvehiclepassWin : function(plateInfo) {
		/**
		 * @author zhangsl
		 * @date : 2011-5-17 上午10:27:24
		 * @description:卡口状态界面
		 */
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
		this.crosslsh = 1;
		this.store = new Ext.data.Store({
					proxy : new Ext.data.HttpProxy({
								url : path
										+ '/motorbusQueryAction!regionCollisionDetailData.action',
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
										+ '/motorbusQueryAction!regionCollisionDetailData.action',
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
					ds : this.store,
					height : 455,
					// autoHeight:true,
					cm : this.cm,
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
					id : 'vehiclePassGrid',
					stripeRows : true
				});
		this.resultPanel.on('rowdblclick', function(grid, rowIndex, event) {
					var vehicleLsh = grid.getStore().getAt(rowIndex)
							.get('vehicleLsh');
					getCarDetailInfoWin(vehicleLsh, "vehiclePassGrid", "100", 0);
				});
		this.schWin = new Ext.Window({
					title : '区域碰撞信息查询',
					resizable : false,
					frame : true,
					border : false,
					modal : true,
					width : 924,
					height : 510,
					modal : true,
					layout : 'form',
					items : [this.resultPanel],
					bbar : new Ext.PagingToolbar({
								pageSize : 50,
								store : this.storepage,
								displayInfo : true,
								displayMsg : '第 {0} 到 {1} 条数据 共{2}条',
								emptyMsg : "没有数据"
							})
				});
		return this.schWin;
	},
	// Grid的数据源加载完后，把标记位置为true
	GridLoad : function() {
		this.isReady = true;
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
	swtchDisMode : function(box, value) {
		if (this.elObj) {
			switch (box.code) {
				case 'fontColor' :
					this.elObj.style.fontColor = value.removeStart('#');
					break;
				case 'fontSize' :
					this.elObj.style.fontSize = box.value;
					break;
				case 'bgColor' :
					this.elObj.style.bKGroundColor = value.removeStart('#');
					break;
				case 'bgCheckBox' :
					this.elObj.style.bKTransparent = value;
					break;
			}
			var eventObject = {
				eventCode : 'UpdateNodeEvent',
				sender : this,
				params : {
					operate : "UpdateNode",
					elObj : this.elObj
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}
	},
	updateNodeSuccess : function(response) {
		if (response.status == 200 && response.statusText == "OK"
				&& response.responseText == '1') {
			var eventObject = {
				eventCode : 'UpdateNodeEvent',
				sender : this,
				params : {
					operate : "UpdateNode",
					elObj : this.elObj
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		} else {
			cms.ext.alert('提示', "更新失败！");
		}
	},
	updateNodeFailure : function(response) {

	},
	updateNodeForm : function(elObj) {

		this.elObj = elObj;
		this.labelField.setText('监控点:' + elObj.nodeInfo.name);
		this.fontColorBox.setValue('#' + elObj.style.fontColor);
		this.fontColorBox.afterRender();
		this.fontSizeBox.setValue(elObj.style.fontSize);
		this.bgColorBox.setValue('#' + elObj.style.bKGroundColor);
		this.bgColorBox.afterRender();
		this.bgCheckBox.setValue(elObj.style.bKTransparent);
		this.updateFlag = elObj.style.bKTransparent ? false : true;
	}
});
