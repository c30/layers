/**
 * @author : zhangsl
 * @date : 2011-9-24 上午11:30:54
 * @description:主控面板
 */
Ext.namespace('cms.emap');
cms.emap.ctrlpanel = function(config) {
	this.searchUrl = '/ezEmapInfoAction!queryElement.action';
	cms.emap.ctrlpanel.superclass.constructor.call(this, config);
};
Ext.override(Ext.grid.CheckboxSelectionModel, {
	onMouseDown : function(e, t) {
		if (e.button === 0 && t.className == 'x-grid3-row-checker') {
			e.stopEvent();
			var row = e.getTarget('.x-grid3-row');

			if (!this.mouseHandled && row) {
				// alert(this.grid.store.getCount());
				var gridEl = this.grid.getEl();// 得到表格的EL对象
				var hd = gridEl.select('div.x-grid3-hd-checker');// 得到表格头部的全选CheckBox框
				var index = row.rowIndex;
				if (this.isSelected(index)) {
					this.deselectRow(index);
					var isChecked = hd.hasClass('x-grid3-hd-checker-on');
					// 判断头部的全选CheckBox框是否选中，如果是，则删除
					if (isChecked) {
						hd.removeClass('x-grid3-hd-checker-on');
					}
				} else {
					this.selectRow(index, true);
					// 判断选中当前行时，是否所有的行都已经选中，如果是，则把头部的全选CheckBox框选中
					if (gridEl.select('div.x-grid3-row-selected').elements.length == gridEl
							.select('div.x-grid3-row').elements.length) {
						hd.addClass('x-grid3-hd-checker-on');
					};
				}
			}
		}
		this.mouseHandled = false;
	},
	onHdMouseDown : function(e, t) {
		/**
		 * 由原来的t.className修改为t.className.split(' ')[0]
		 * 为什么呢？这个是我在快速点击头部全选CheckBox时，
		 * 操作过程发现，有的时候x-grid3-hd-checker-on这个样式还没有删除或者多一个空格，结果导致下面这个判断不成立
		 * 去全选或者全选不能实现
		 */
		if (t.className.split(' ')[0] == 'x-grid3-hd-checker') {
			e.stopEvent();
			var hd = Ext.fly(t.parentNode);
			var isChecked = hd.hasClass('x-grid3-hd-checker-on');
			if (isChecked) {
				hd.removeClass('x-grid3-hd-checker-on');
				this.clearSelections();
			} else {
				hd.addClass('x-grid3-hd-checker-on');
				this.selectAll();
			}
		}
	}
});
Ext.extend(cms.emap.ctrlpanel, Ext.ux.BaseControl, {

	mapApp : undefined,
	pRectangle : undefined,
	Rectangle : [],
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
	XPos : -1,
	YPos : -1,
	isavilable : 0,
	gisavilable : 0,
	gisfirst : 0,
	str : '',
	gis : 0,
	graphicQueryWin : undefined,
	graphicGridPanel : undefined,
	graphicStore : undefined,
	elementType : 0,
	previewWin : undefined,
	previewCtrl : undefined,
	cameraId : undefined,
	wndNum : undefined,
	arrDelIds : [],
	previewType : 0,// 0为双击监控点预览；1为框选预览，2为双击框选框一行
	getControl : function() {
		Ext.QuickTips.init();
		var confFlag = parseInt(mapMode, 10) == 1 ? true : false;
		this.cruiseBtn = new Ext.Button({
					tipText : '漫游',
					iconCls : 'gis_cruise_image',
					style : 'margin:0 3px;',
					handler : this.cruiseMapHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.zoomInBtn = new Ext.Button({
					tipText : '框选放大',
					iconCls : 'gis_zoomIn_image',
					style : 'margin:0 3px;',
					handler : this.zoomInMapHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});

		this.zoomOutBtn = new Ext.Button({
					tipText : '框选缩小',
					iconCls : 'gis_zoomOut_image',
					style : 'margin:0 3px;',
					handler : this.zoomOutMapHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.areaBtn = new Ext.Button({
					tipText : '测量面积',
					iconCls : 'gis_area_image',
					style : 'margin:0 3px;',
					handler : this.areaHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.lengthBtn = new Ext.Button({
					tipText : '测量距离',
					iconCls : 'gis_ruler_image',
					style : 'margin:0 3px;',
					handler : this.lengthHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.serachBtn = new Ext.Button({
					tipText : '查询',
					iconCls : 'gis_search_image',
					style : 'margin:0 3px;',
					handler : this.serachHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});

		this.recbetloy = new Ext.Button({
					tipText : '框选查询',
					hidden : confFlag,
					iconCls : 'gis_rec_select',
					style : 'margin:0 3px;',
					handler : this.rectHandlerploy.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.printBtn = new Ext.Button({
					tipText : '打印',
					iconCls : 'gis_print_image',
					style : 'margin:0 3px;',
					handler : this.printHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.canelBtn = new Ext.Button({
					tipText : '清除操作',
					iconCls : 'gis_clean',
					style : 'margin:0 3px;',
					handler : this.canelHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.rectBtn = new Ext.Button({
					tipText : '多边形查询',
					hidden : confFlag,
					iconCls : 'gis_mul_select',
					style : 'margin:0 3px;',
					handler : this.rectHandler.createDelegate(this),
					listeners : {
						afterrender : this.createTip.createDelegate(this)
					}
				});
		this.labelField = {
			xtype : 'label'
		};
		this.toolbar = new Ext.Panel({
					width : '100%',
					height : 60,
					border : true,
					frame : true,
					items : [this.labelField, {
						layout : 'column',
						border : false,
						frame : false,
						items : [this.cruiseBtn, this.zoomInBtn,
								this.zoomOutBtn, this.areaBtn, this.lengthBtn,
								this.serachBtn, /*
												 * this.loadMapBtn,
												 * this.printBtn,
												 */this.canelBtn, this.recbetloy, this.rectBtn]
					}]
				});
		return this.toolbar;
	},
	createTip : function(component) {
		new Ext.ToolTip({
					target : component.id,
					anchor : 'right',
					trackMouse : true,
					html : component.tipText
				});
	},
	cruiseMapHandler : function() {
		this.mapApp.changeDragMode('pan', null, null, null);
	},
	zoomInMapHandler : function() {
		this.mapApp.zoomInExt();
	},
	zoomOutMapHandler : function() {
		this.mapApp.zoomOutExt();
	},
	canelHandler : function() {
		this.mapApp.clearOverlays();
	},
	loadMapHandler : function() {
		var pos = this.mapApp.getBoundsLatLng();
		this.mapApp.downloadMap(pos.minX, pos.minY, pos.maxX, pos.maxY,
				this.mapApp.getZoomLevel());
	},
	printHandler : function() {
		window.print();
	},
	areaHandler : function() {
		this.mapApp.measureArea(function(iArea) {
					cms.ext.alert('提示', "总面积为:" + iArea);
				}.createDelegate(this));
	},
	recallback : function(strs) {
		var str = "";
		for (var i = 0; i < strs.length; i++) {
			str = strs[i].x + ',' + strs[i].y + ',' + str
			str = str.trim().substring(0, str.length - 1);
		}
		this.gis = 1;
		this.str = str;
		if (this.gisavilable == 1) {
			var param="";
			var larm=[];
			for (var i = 0; i < this.store.data.length; i++) {
   				param= this.store.getAt(i).get('elementId');
   				larm.push(param)
			}
			this.store.baseParams = {
				elementName : '',
				larm:larm,
				strlen : str,
				multab : 6000,
				rect : 1
			};
			this.store.load({
						add : true
					});
			var param1="";
			var larm1=[];
			for (var i = 0; i < this.store1.data.length; i++) {
   				param1= this.store1.getAt(i).get('elementId');
   				larm1.push(param1)
			}
			this.store1.baseParams = {
				elementName : '',
				larm:larm1,
				strlen : str,
				multab : 3000,
				rect : 1
			};
			this.store1.load({
						add : true
					});
			this.duxuanwin.setVisible(true)
			return this.duxuanwin;
		}
		// this.canelHandler();
		this.duxuanwin = this.getrectWin(str, 1);
		this.duxuanwin.setPosition(document.body.clientWidth - 242, 37)
		if (this.gisavilable != 1) {
			this.duxuanwin.show();
		}
		this.gisavilable = 1;
		return this.duxuanwin;
	},
	recallbackploy : function(str) {
		this.str = str;
		this.pRectangle = new Rectangle(str, "#99D9EA", 0, 0.7, "#99D9EA");
		this.Rectangle.push(this.pRectangle);
		this.mapApp.addOverlay(this.pRectangle);
		this.mapApp.changeDragMode('drawRect', null, null, null);
		if (this.gisavilable == 1) {
			this.store.baseParams = {
				elementName : '',
				strlen : str,
				multab : 6000,
				rect : 0
			};
			this.store.load({
						add : true
					});
			this.store1.baseParams = {
				elementName : '',
				strlen : str,
				multab : 3000,
				rect : 0
			};
			this.store1.load({
						add : true
					});
			return;
		}
		// this.canelHandler();
		this.setPreviewType(1);
		var win = this.getrectWin(str, 0);
		win.show();
		this.gisavilable = 1;
	},
	getrectWin : function(str, rect) {
		this.store = new Ext.data.JsonStore({
					url : '/ezEmapInfoAction!queryRect.action',
					root : 'emapElements',
					fields : ['linkId', 'elementId', 'elementName',
							'elementType']

				});
		this.store1 = new Ext.data.JsonStore({
					url : '/ezEmapInfoAction!queryRect.action',
					root : 'emapElements',
					fields : ['linkId', 'elementId', 'elementName',
							'elementType']

				});
		var sm = new Ext.grid.CheckboxSelectionModel({
					handleMouseDown : Ext.emptyFn
				});
		var sm1 = new Ext.grid.CheckboxSelectionModel({
					handleMouseDown : Ext.emptyFn
				});
		var cm = new Ext.grid.ColumnModel({
					defaults : {
						sortable : true
					},
					columns : [new Ext.grid.RowNumberer(), sm, {
								header : 'LINKID',
								hidden : true,
								dataIndex : 'linkId'
							}, {
								header : '元素ID',
								hidden : true,
								dataIndex : 'elementId'
							}, {
								header : '资源名称',
								dataIndex : 'elementName',
								width : 164
							}/*
								 * , { header : '类型', dataIndex : 'elementType',
								 * width : 60, sortable : true, renderer :
								 * function(value) { var type; switch
								 * (parseInt(value, 10)) { case 3000 : type =
								 * '监控点'; break; case 4000 : type = '报警输入';
								 * break; case 4001 : type = '报警输出'; break; case
								 * 5000 : type = 'GPS'; break; case 6000 : type =
								 * top.crossingManageName; break; default : type =
								 * '监控点'; break; } return type; } }
								 */]
				});
		this.resultPanel = new Ext.grid.GridPanel({
					// title : '元素列表',
					ds : this.store,
					height : 323,
					cm : cm,
					sm : sm,
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
					stripeRows : true,
					listeners : {
						rowclick : this.locationMapEL.createDelegate(this)
					}
				});
		this.resultPanel1 = new Ext.grid.GridPanel({
					// title : '元素列表',
					ds : this.store1,
					height : 323,
					cm : cm,
					sm : sm1,
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
					stripeRows : true,
					listeners : {
						rowclick : this.locationMapEL.createDelegate(this)
					}
				});
		// if (!/MSIE (5\.5|6)/.test(navigator.userAgent)) {
		// this.store.on('load', function() {
		// sm.selectAll(); // 选中表中所有记录
		// var hd = sm.grid.getEl()
		// .select('div.x-grid3-hd-checker');
		// hd.addClass('x-grid3-hd-checker-on');
		// });
		// this.store1.on('load', function() {
		// sm1.selectAll(); // 选中表中所有记录
		// var hd1 = sm1.grid.getEl()
		// .select('div.x-grid3-hd-checker');
		// hd1.addClass('x-grid3-hd-checker-on');
		// });
		// }
		this.schBtn = new Ext.Button({
					text : '过车查询',
					width : 76,
					height : 30,
					handler : this.mulHandler.createDelegate(this)
				});
		this.schBtn1 = new Ext.Button({
					text : '违章查询',
					width : 76,
					height : 30,
					handler : this.mulalarmHandler.createDelegate(this)
				});
		this.schBtn4 = new Ext.Button({
					text : '频度查询',
					width : 76,
					height : 30,
					handler : this.mulfreHandler.createDelegate(this)
				});
		this.schBtn2 = new Ext.Button({
					text : '视频预览',
					width : 228,
					height : 30,
					handler : this.mulvediopreHandler.createDelegate(this)
				});
		this.schBtn3 = new Ext.Button({
					text : '视频回放',
					width : 134,
					height : 30,
					handler : this.mulvediobackHandler.createDelegate(this)
				});
		this.tabpanel = new Ext.TabPanel({
					activeTab : 0,// 设置默认选项卡
					width : '100%',
					height : 410,
					border : false,
					frame : false,
					defaults : {
						frame : false,
						border : false
					},
					items : [{
						layout : 'form',
						id : 'kak',
						// labelWidth : 75,
						title : top.crossingManageName,
						items : [this.resultPanel, {
									layout : 'column',
									frame : false,
									border : false,
									items : [this.schBtn, this.schBtn1,
											this.schBtn4]
								}]
					}, {
						layout : 'form',
						id : 'veo',
						title : '监控点',
						// labelWidth : 75,
						items : [this.resultPanel1, {
									layout : 'column',
									frame : false,
									border : false,
									items : [this.schBtn2/* , this.schBtn3 */]
								}]
					}],
					listeners : {
						'afterrender' : function() {
							this.tabpanel.setActiveTab('veo');
							this.tabpanel.setActiveTab('kak');
							this.store.baseParams = {
								elementName : '',
								strlen : str,
								larm:"",
								multab : 6000,
								rect : rect
							};
							this.store.load();
							this.store1.baseParams = {
								elementName : '',
								strlen : str,
								larm:"",
								multab : 3000,
								rect : rect
							};
							this.store1.load();
						}.createDelegate(this)
					}

				});
		this.schWin = new Ext.Window({
					title : '框选查询',
					resizable : false,
					frame : true,
					border : false,
					width : 240,
					height : 410,
					maximizable : false,
					collapsible : true,
					anchorPosition : "auto",
					layout : 'form',
					items : [this.tabpanel/* , this.resultPanel */],
					listeners : {
						close : function() {
							this.setPreviewType(0);
							this.gisavilable = 0;
							this.gisfirst = 0;
							var eventObject = {
								eventCode : 'RectEventdftm',
								sender : this,
								params : {
									operate : 'rectpre'
								}
							};
							this.fireEvent(eventObject.eventCode, eventObject);
							// for (ir = 0; ir < this.Rectangle.length; ir++) {
							// this.mapApp.removeOverlay(this.Rectangle[ir]);
							// }
							// var fnPanel = mainCtrl.fnPanelItem.get('emap');
							// var mappanel = fnPanel.controlItem.get('map');
							this.gis = 0;
						}.createDelegate(this)
					}

				});
		return this.schWin;
	},
	mulHandler : function(event) {
		var i = this.resultPanel.getSelectionModel().getSelections();
		if (i == "") {
			Ext.MessageBox.alert("错误提示", "请选择元素");
			return;
		}
		var records = i[0].get('linkId');
		for (var m = 1; m < i.length; m++) {
			var kk = i[m];
			var record = kk.get('linkId');
			records += "," + record;
		}
		new cms.emap.bayonetsearch().showvehiclepassWin(records);

	},
	mulalarmHandler : function(event) {
		var i = this.resultPanel.getSelectionModel().getSelections();
		if (i == "") {
			Ext.MessageBox.alert("错误提示", "请选择元素");
			return;
		}
		var records = i[0].get('linkId');
		for (var m = 1; m < i.length; m++) {
			var kk = i[m];
			var record = kk.get('linkId');
			records += "," + record;
		}
		new cms.emap.bayonetsearch().showvehiclealarmWin(records);

	},
	mulfreHandler : function(event) {
		var i = this.resultPanel.getSelectionModel().getSelections();
		if (i == "") {
			Ext.MessageBox.alert("错误提示", "请选择元素");
			return;
		}
		var records = i[0].get('linkId');
		for (var m = 1; m < i.length; m++) {
			var kk = i[m];
			var record = kk.get('linkId');
			records += "," + record;
		}
		new cms.emap.bayonetsearch().showfre(records);

	},
	mulvediopreHandler : function(event) {
		this.setPreviewType(1);
		var i = this.resultPanel1.getSelectionModel().getSelections();
		if (i == "") {
			Ext.MessageBox.alert("错误提示", "请选择元素");
			return;
		}
		var records = "";// =this.resultPanel.getStore().getAt(0).get('linkId');
		for (var m = 0; m < i.length; m++) {
			var kk = i[m];
			var record = kk.get('linkId');
			var type = kk.get('elementType');
			if (type != 6000) {
				records += record + ",";
			}

		}
		records = records.substring(0, records.length - 1);
		this.previewByClkEl(records)

	},
	mulvediobackHandler : function(event) {
		var i = this.resultPanel1.getSelectionModel().getSelections();
		var records = "";// =this.resultPanel.getStore().getAt(0).get('linkId');
		for (var m = 0; m < i.length; m++) {
			var kk = i[m];
			var record = kk.get('linkId');
			var type = kk.get('elementType');
			if (type != 6000) {
				records += record + ",";
			}

		}
		records = records.substring(0, records.length - 1);
		// alert(records);
		var eventObject = {
			eventCode : 'RectEvent',
			sender : this,
			params : {
				operate : 'rectback',
				elementId : records
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);

	},
	rectHandler : function() {
		this.mapApp.changeDragMode('drawPolygon', null, null, this.recallback
						.createDelegate(this));

	},
	rectHandlerploy : function() {
		this.mapApp.changeDragMode('drawRect', null, null, this.recallbackploy
						.createDelegate(this));

	},
	lengthHandler : function() {
		this.mapApp.measureLength(function(iLength) {
					cms.ext.alert('提示', "距离总长:" + iLength);
				}.createDelegate(this));
	},
	serachHandler : function() {
		this.showSearchWin(0);
	},
	showSearchWin : function(num) {
		if (this.isavilable == 1) {
			this.arzbwin.setVisible(true);
			return
		}
		this.arzbwin = this.getSearchWin();
		switch (parseInt(num)) {
			case 0 :
				this.tabpanel.setActiveTab('fullQuery');
				break;
			case 1 :
				this.tabpanel.setActiveTab('aroundQuery');
				break;
			default :
				break;
		}
		this.arzbwin.setPosition(document.body.clientWidth - 242, 37);
		this.arzbwin.show();
		this.isavilable = 1;
		return this.arzbwin;
	},
	getSearchWin : function() {
		this.schData = [['0', '所有元素'], ['3000', '监控点']/* , ['5000', '车载'] *//*
																			 * ,
																			 * ['4000',
																			 * '报警输入'],
																			 * ['4100',
																			 * '报警输出'],['5000',
																			 * '车载'],['5100',
																			 * '单兵']
																			 */, ['6000', top.crossingManageName]];
		this.schType1 = new Ext.form.ComboBox({
					width : 150,
					code : 'schType1',
					valueField : 'id',
					displayField : 'value',
					selectOnFocus : true,
					fieldLabel : '查询类型',
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					value : 0,
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
		this.schType2 = new Ext.form.ComboBox({
					width : 150,
					code : 'schType2',
					valueField : 'id',
					displayField : 'value',
					selectOnFocus : true,
					fieldLabel : '查询类型',
					editable : false,
					forceSelection : true,
					triggerAction : 'all',
					mode : 'local',
					value : 0,
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
					width : 150,
					fieldLabel : '关键字',
					maxLength : 48,
					maskRe : new RegExp("[^(/:;,#$&*?^!@'\"<>|%_\\\\)]"),
					enableKeyEvents : true,
					allowBlank : false,
					name : 'keyword',
					listeners : {
						keyup : function(textField, e) {
							if (e.getKey() == 13) {
								this.searchHandler();
							}
						}.createDelegate(this)
					}
				});
		this.store = new Ext.data.JsonStore({
					url : this.searchUrl,
					root : 'emapElements',
					fields : ['elementId', 'elementName', 'elementType'],
					baseParams : {
						elementName : '',
						elementType : 0
					}
				});
		var cm = new Ext.grid.ColumnModel({
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
								width : 126
							}, {
								header : '类型',
								dataIndex : 'elementType',
								width : 60,
								sortable : true,
								renderer : function(value) {
									var type;
									switch (parseInt(value)) {
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
											type = top.crossingManageName;
											break;
										default :
											type = '监控点';
											break;
									}
									return type;
								}
							}]
				});
		this.resultPanelar = new Ext.grid.GridPanel({
					title : '设备清单',
					ds : this.store,
					height : 230,
					cm : cm,
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
					stripeRows : true,
					listeners : {
						rowclick : this.locationMapEL.createDelegate(this)
					}
				});
		this.centerStation = new Ext.form.Label({
					text : '中心位置: （请用鼠标选择中心点）'
				});
		this.radius = new Ext.form.NumberField({
					width : 150,
					fieldLabel : '半径(米)',
					maxLength : 6,
					minValue : 1,
					name : 'radius',
					allowBlank : false,
					allowNegative : false,
					value : '100'
				});

		this.schBtn = new Ext.Button({
					text : '查询',
					width : 227,
					handler : this.searchHandler.createDelegate(this)
				});

		this.tabpanel = new Ext.TabPanel({
			activeTab : 0,// 设置默认选项卡
			width : '100%',
			height : 116,
			border : false,
			frame : false,
			buttons : [this.schBtn],
			defaults : {
				frame : false,
				border : false
			},
			items : [{
						layout : 'form',
						id : 'aroundQuery',
						style : 'padding:5px 10px 10px 10px',
						// title : '周边资源',
						labelWidth : 75,
						items : [this.centerStation, this.schType2, this.radius]
					}],
			listeners : {
				'tabchange' : function() {
					// alert(this.tabpanel.getActiveTab())
				}.createDelegate(this)
			}

		});
		this.schWin = new Ext.Window({
					title : '周边资源查询',
					resizable : false,
					frame : true,
					border : false,
					width : 240,
					height : 330,
					layout : 'form',
					maximizable : false,
					collapsible : true,
					anchorPosition : "auto",
					labelWidth : 65,
					items : [this.centerStation, this.radius, this.schBtn,
							this.resultPanelar],
					listeners : {
						close : function() {
							this.isavilable = 0;
							this.XPos = -1;
							var eventObject = {
								eventCode : 'dehyun',
								sender : this,
								params : {
									operate : 'locationMapEL'
								}
							};
							this.fireEvent(eventObject.eventCode, eventObject);
						}.createDelegate(this)
					}

				});
		return this.schWin;

	},
	locationMapEL : function(grid, rowIndex, event) {
		var record = grid.getStore().getAt(rowIndex);
		var eventObject = {
			eventCode : 'CtrlPanelEvent',
			sender : this,
			params : {
				operate : 'locationMapEL',
				elementId : record.get('elementId')
			}
		};
		this.fireEvent(eventObject.eventCode, eventObject);
	},
	updateCenterStation : function(eg) {
		if (this.centerStation && this.centerStation.el
				&& this.centerStation.el.dom) {
			this.XPos = eg.lon;
			this.YPos = eg.lat;
			this.centerStation.setText('位置: (' + eg.lon.toFixed(5) + ',' + eg.lat.toFixed(5)+')');
		}
	},
	setPreviewType : function(type) {
		this.previewType = type;
	},
	createPreviewWin : function() {
		this.previewCtrl = new cms.emap.previewCtrl({
					previewUrl : 'preview!getCameraInfoForPreview.action',
					previewByGraphicUrl : 'preview!getCameraInfosForPreview.action',
					listeners : {
						PreviewCtrlEvent : this.previewCtrlEventHandler
								.createDelegate(this)
					}
				});
		this.previewWin = new Ext.Window({
					title : '视频预览',
					resizable : false,
					closeAction : 'hide',
					plain : true,
					width : 680,
					height : 510,
					layout : 'fit',
					items : [this.previewCtrl.getControl()]

				});
		// this.previewWin.setPosition(document.body.clientWidth / 2 - 100,
		// document.body.clientHeight / 2 + 60);
		this.previewWin.show();

	},
	getCameraIds : function() {
		var preCameraIds = '';
		var selections = this.resultPanel1.getSelectionModel().getSelections();
		if (selections.length == 0) {
			cms.ext.alert('提示', '请选择监控点');
		} else {
			for (var index = 0, len = selections.length; index < len; index++) {
				if (index >= 25) {
					break;
				}
				if (0 == index) {
					preCameraIds = selections[index].get('linkId');
				} else {
					preCameraIds += '|' + selections[index].get('linkId');
				}

			}
		}
		return preCameraIds;
	},
	previewByGraphicRow : function(cameraId) {
		this.setPreviewType(2);
		this.cameraId = cameraId;
		if (!this.previewWin) {
			this.createPreviewWin();
			this.wndNum = 1;
		} else {
			if (this.previewWin.hidden) {
				this.previewCtrl.stopAllPreview();
				this.previewCtrl.cleanWndInfoMap();
				this.wndNum = 1;
			}
			this.previewWin.show(document.body);
			this.previewCtrl.setWndNum(this.wndNum);
			this.previewCtrl.setPreviewType(this.previewType);
			this.previewCtrl.previewGraphicHandler(cameraId);
		}
	},
	previewByClkEl : function(cameraId) {
		this.cameraId = cameraId;
		if (!this.previewWin) {
			this.createPreviewWin();
			this.wndNum = 1;
		} else {
			this.previewCtrl.stopAllPreview();
			this.previewCtrl.cleanWndInfoMap();
			this.wndNum = 1;
			this.previewWin.show(document.body);
			if (this.previewType == 1) {
				this.previewCtrl.previewGraphicHandler(this.getCameraIds());
			} else if (this.previewType == 0) {
				this.previewCtrl.previewHandler(this.cameraId)
			}
		}
	},
	previewCtrlEventHandler : function(eventObject) {
		this.previewCtrl.setWndNum(this.wndNum);
		switch (eventObject.params.operate) {
			case 'OcxRender' :
				if (this.previewType == 1) {
					this.previewCtrl.setPreviewType(this.previewType);
					this.previewCtrl.previewGraphicHandler(this.getCameraIds());
				} else if (this.previewType == 0) {
					this.previewCtrl.previewHandler(this.cameraId);
				} else if (this.previewType == 2) {
					this.previewCtrl.setPreviewType(this.previewType);
					this.previewCtrl.previewGraphicHandler(this.cameraId);
				}

				break;
			default :
				break;
		}
	},
	searchHandler : function() {
		if (this.tabpanel.getActiveTab().id == 'fullQuery') {
			if (this.keyword.getValue().trim() == "") {
				cms.ext.alert('错误', '请输入关键字 ！');
				return;
			}
			this.store.baseParams = {
				searchType : 0,
				mapMode : mapMode,
				elementType : this.schType1.getValue(),
				elementName : this.keyword.getValue()
			};
			this.store.load();
		} else if (this.tabpanel.getActiveTab().id == 'aroundQuery') {
			if (this.XPos == -1 || this.YPos == -1) {
				cms.ext.alert('提示', '请用鼠标选择中心点!');
				return;
			}
			if (!this.radius.isValid()) {
				cms.ext.alert('提示', '半径为空，过短或长度大于6个字符!');
				return;
			}
			this.store.baseParams = {
				searchType : 1,
				elementType : this.schType2.getValue(),
				mapMode : mapMode,
				XPos : this.XPos,
				YPos : this.YPos,
				radius : this.radius.getValue()
			};
			this.store.load();
			var eventObject = {
				eventCode : 'hyun',
				sender : this,
				params : {
					operate : 'locationMapEL',
					XPos : this.XPos,
					YPos : this.YPos,
					radius : this.radius.getValue()
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}

	}

});