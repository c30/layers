/**
 * @description 异常牌照查询结果表格
 * @date 2011/05/12
 * @author zhou xiaolong
 */
Ext.namespace('cms.emap');

cms.emap.carPicMonitorReport = function(config) {
	this.gridDataURL = '';
	cms.emap.carPicMonitorReport.superclass.constructor.call(this, config);
};
var pageSize = 20;
Ext.extend(cms.emap.carPicMonitorReport, Ext.ux.BaseControl, {
	controlItem : new cms.framework.map(), // 用来存储的报表子控件
	report : null,
	vehiclePassGrid : undefined, // 违章grid
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		this.vehiclePassStore = new Ext.data.SimpleStore({
					fields : [
							/*
							 * { name: 'rowIndex', type: 'int' },
							 */
							{
						name : 'icon',
						type : 'string'
					}, {
						name : 'passTime',
						type : 'string'
					}, {
						name : 'bayonetName',
						type : 'string'
					}, {
						name : 'plateNo',
						type : 'string'
					}, {
						name : 'carSpeedG',
						type : 'string'
					}, {
						name : 'limitSpeedG',
						type : 'string'
					}, {
						name : 'alarmAction',
						type : 'string'
					}, {
						name : 'lineNo',
						type : 'string'
					}, {
						name : 'vehicleColor',
						type : 'string'
					}, {
						name : 'plateColor',
						type : 'string'
					}, {
						name : 'vehicleType',
						type : 'string'
					}, {
						name : 'plateTypeG',
						type : 'string'
					}, {
						name : 'directionNo',
						type : 'string'
					}, {
						name : 'vehiclePassId',
						type : 'int'
					}, {
						name : 'alarmPlanInfo',
						type : 'string'
					}, {
						name : 'carLength',
						type : 'string'
					}]
				});

		// this.vehiclePassStore.load();

		this.CreateVehiclePassGrid();

		this.tabs = new Ext.TabPanel({
					activeTab : 0,// 设置默认选项卡
					enableTabScroll : true,
					height : 210,
					border : false,
					items : [/*
								 * { title : '全部报警信息', //layout : 'fit', id :
								 * '0', defaultType : 'textfield',
								 * items:[this.controlItem.get('warningCarPassInfoGrid')],
								 * //items : [gridFactory], listeners : {
								 * 'activate' :
								 * this.SelectTableHandler.createDelegate(this) } },
								 */{
						title : '卡口过车信息',
						// layout : 'fit',
						id : '1',
						defaultType : 'textfield',
						items : [this.controlItem.get('vehiclePassGrid')],
						// items : [gridContractors],
						listeners : {
							'activate' : this.SelectTableHandler
									.createDelegate(this)
						}
					}]
				});

		this.report = new Ext.Panel({
					id : 'gridForm',
					region : 'center',
					// tbar : this.createToolBar(),
					border : false,
					frame : false,
					height : 225,
					items : [/* this.tabs */this.vehiclePassGrid]
				});

		return this.report;
	},

	createToolBar : function() {

		// 清除报警声音
		var btnClearMusic = new Ext.Button({
					text : '手动清除声音',
					height : 17,
					id : 'btnClearMusic',
					// disabled:true//,
					handler : StopPlayMusic
				});

		// 车辆详情
		var btnCarDetail = new Ext.Button({
					text : '显示详情',
					height : 17,
					id : 'btnCarDetail',
					// disabled:true//,
					handler : ShowPreviewList
				});

		return toolbar = new Ext.Toolbar({
					width : '100%',
					height : 23,
					// cls: 'analysis-toolbar',
					items : [{
								xtype : 'tbfill'
							}, btnClearMusic, btnCarDetail]
				});
	},

	/**
	 * 显示小图片
	 */
	showMinIcon : function(url) {
		return "<img src= '" + top.path + "/skin/red/images/baynet/nopic.jpg'"
				+ " style='width:80px;height:25px'>";
	},

	/**
	 * 改变Tab
	 */
	SelectTableHandler : function(tabPabel) {
		m_selTabId = tabPabel.id;
	},

	/**
	 * 创建表格
	 */
	CreateVehiclePassGrid : function() {
		var sm = new Ext.grid.CheckboxSelectionModel();
		var cm = new Ext.grid.ColumnModel({
					// defaults : {
					// sortable : false //不排序
					// },
					columns : [
							// new Ext.grid.RowNumberer(),
							// sm,
							/*
							 * { header: '车牌图片 ', align: 'center', dataIndex:
							 * 'icon', renderer: this.showIcon, //sortable:
							 * true, //menuDisabled:true, width: 80 },
							 */{
						header : '时间 ',
						align : 'center',
						dataIndex : 'passTime',
						menuDisabled : true,
						width : 150
					}, {
						header : top.crossingManageName + '名称',
						dataIndex : 'bayonetName',
						menuDisabled : true,
						width : 80
					}, {
						header : '车牌号码',
						dataIndex : 'plateNo',
						menuDisabled : true,
						width : 80
					}, {
						header : '车速',
						dataIndex : 'carSpeedG',
						menuDisabled : true,
						align : 'right',
						width : 50
					}, {
						header : '限速',
						dataIndex : 'limitSpeedG',
						menuDisabled : true,
						align : 'right',
						width : 50
					}, {
						header : '行车状态',
						dataIndex : 'alarmAction',
						menuDisabled : true,
						width : 60
					}, {
						header : '车道号',
						dataIndex : 'lineNo',
						align : 'right',
						menuDisabled : true,
						width : 50
					}, /*
						 * { header: '车身长度(m)', dataIndex: 'carLength', align:
						 * 'right', menuDisabled:true, width: 70//,
						 * //hidden:m_bCarLengthHidden }, { header: '车身颜色',
						 * dataIndex: 'vehicleColor', menuDisabled:true, width:
						 * 80 }, { header: '车牌颜色', dataIndex: 'plateColor',
						 * menuDisabled:true, width: 80 },
						 */{
						header : '车辆类型',
						dataIndex : 'vehicleType',
						menuDisabled : true,
						width : 60
					}/*
						 * , { header: '车牌类型', dataIndex: 'plateTypeG',
						 * menuDisabled:true, width: 80 }, { header: '方向名称',
						 * dataIndex: 'directionNo', menuDisabled:true, width:
						 * 80 }
						 */
					]
				});

		this.vehiclePassGrid = new Ext.grid.EditorGridPanel({
			cm : cm,
			id : 'vehicleGird',
			ds : this.vehiclePassStore,
			region : 'center',
			border : true,
			columnLines : true,
			autoScroll : true,
			trackMouseOver : true,
			stripeRows : true,
			// loadMask : true,
			height : 174,
			selModel : new Ext.grid.RowSelectionModel()
				// height : cms.util.getBodyHeight() - 345,
				// width : cms.util.getBodyWidth()-258
			});

		var alrmCm = new Ext.grid.ColumnModel({
					columns : [{
								header : '车牌图片 ',
								align : 'center',
								dataIndex : 'icon',
								renderer : this.showIcon,
								sortable : true,
								// menuDisabled:true,
								width : 80
							}, {
								header : '时间 ',
								align : 'center',
								dataIndex : 'passTime',
								menuDisabled : true,
								width : 150
							}, {
								header : top.crossingManageName + '名称',
								dataIndex : 'bayonetName',
								menuDisabled : true,
								width : 80
							}, {
								header : '车牌号码',
								dataIndex : 'plateNo',
								menuDisabled : true,
								width : 80
							}, {
								header : '车速',
								dataIndex : 'carSpeedG',
								menuDisabled : true,
								align : 'right',
								width : 50
							}, {
								header : '限速',
								dataIndex : 'limitSpeedG',
								menuDisabled : true,
								align : 'right',
								width : 50
							}, {
								header : '违法行为',
								dataIndex : 'alarmAction',
								menuDisabled : true,
								width : 80
							}, {
								header : '车道号',
								dataIndex : 'lineNo',
								align : 'right',
								menuDisabled : true,
								width : 60
							}, {
								header : '车身长度(m)',
								dataIndex : 'carLength',
								align : 'right',
								menuDisabled : true,
								width : 80
								// hidden:m_bCarLengthHidden
						}	, {
								header : '车身颜色',
								dataIndex : 'vehicleColor',
								menuDisabled : true,
								width : 80
							}, {
								header : '车牌颜色',
								dataIndex : 'plateColor',
								menuDisabled : true,
								width : 80
							}, {
								header : '车辆类型',
								dataIndex : 'vehicleType',
								menuDisabled : true,
								width : 80
							}, {
								header : '车牌类型',
								dataIndex : 'plateTypeG',
								menuDisabled : true,
								width : 80
							}, {
								header : '方向名称',
								dataIndex : 'directionNo',
								menuDisabled : true,
								width : 80
							}, {
								header : '报警预案',
								dataIndex : 'alarmPlanInfo',
								menuDisabled : true,
								width : 100
							}]
				});

		this.warningPassInfoStore = new Ext.data.SimpleStore({
					fields : [
							/*
							 * { name: 'rowIndex', type: 'int' },
							 */
							{
						name : 'icon',
						type : 'string'
					}, {
						name : 'passTime',
						type : 'string'
					}, {
						name : 'bayonetName',
						type : 'string'
					}, {
						name : 'plateNo',
						type : 'string'
					}, {
						name : 'carSpeedG',
						type : 'string'
					}, {
						name : 'limitSpeedG',
						type : 'string'
					}, {
						name : 'alarmAction',
						type : 'string'
					}, {
						name : 'lineNo',
						type : 'string'
					}, {
						name : 'vehicleColor',
						type : 'string'
					}, {
						name : 'plateColor',
						type : 'string'
					}, {
						name : 'vehicleType',
						type : 'string'
					}, {
						name : 'plateTypeG',
						type : 'string'
					}, {
						name : 'directionNo',
						type : 'string'
					}, {
						name : 'vehiclePassId',
						type : 'int'
					}, {
						name : 'alarmPlanInfo',
						type : 'string'
					}, {
						name : 'carLength',
						type : 'string'
					}]
				});

		this.warningCarPassInfoGrid = new Ext.grid.EditorGridPanel({
			cm : alrmCm,
			// sm : sm,
			id : 'warningCarPassInfoGrid',
			ds : this.warningPassInfoStore,
			region : 'center',
			border : true,
			columnLines : true,
			autoScroll : true,
			trackMouseOver : true,
			stripeRows : true,
			selModel : new Ext.grid.RowSelectionModel(),
			// loadMask : true,
			height : 190
				// height : cms.util.getBodyHeight() - 345,
				// width : cms.util.getBodyWidth()-248//,
				// bbar : this.barInfos
			});

		// 正常过车信息行被单击前触发
		this.vehiclePassGrid.on('rowmousedown',
				function(grid, rowIndex, event) {
					selRowIndex = rowIndex;
					isSelected = true;
					selRowTop = grid.getView().scroller.dom.scrollTop;
				});

		this.vehiclePassGrid.on('rowdblclick', function(grid, rowIndex, event) {
					// var vehicleLsh =
					// grid.getStore().getAt(rowIndex).get('vehiclePassId');
					// getCarDetailInfoWin(vehicleLsh,"vehicleGird","11",0);
					selRowIndex = rowIndex;
					isSelected = false;
					selRowTop = grid.getView().scroller.dom.scrollTop;
				});

		// 违章过车信息行被单击前触发
		this.warningCarPassInfoGrid.on('rowmousedown', function(grid, rowIndex,
						event) {
					selRowIndex = rowIndex;
					isSelected = true;
					selRowTop = grid.getView().scroller.dom.scrollTop;
				});

		this.warningCarPassInfoGrid.on('rowdblclick', function(grid, rowIndex,
				event) {
			var vehicleLsh = grid.getStore().getAt(rowIndex)
					.get('vehiclePassId');
			getCarDetailInfoWin(vehicleLsh, "warningCarPassInfoGrid", "011", 1);
		});

		// //区间违章信息行被单击前触发
		// this.quJianAlarmInfoGrid.on('rowmousedown', function(grid, rowIndex,
		// event) {
		// selRowIndex = rowIndex;
		// isSelected = true;
		// selRowTop = grid.getView().scroller.dom.scrollTop;
		// });

		this.controlItem.add('vehiclePassGrid', this.vehiclePassGrid);
		this.controlItem.add('warningCarPassInfoGrid',
				this.warningCarPassInfoGrid);
		// return this.vehiclePassGrid;
	},
	/**
	 * 显示小图片
	 */
	showIcon : function(url) {
		return "<img src= '" + top.path + "/skin/red/images/baynet/nopic.jpg'"
				+ " style='width:75px;height:25px'>";
	}
});
