/**
 * @description 实时过车信息提示窗口
 * @date 2011/05/24
 * @author zhou xiaolong
 */
Ext.namespace('cms.emap');
cms.emap.optionInfoWindow = function(config) {

	cms.emap.optionInfoWindow.superclass.constructor.call(this, config);
};

Ext.extend(cms.emap.optionInfoWindow, Ext.ux.BaseControl, {
			controlItem : new cms.framework.map(), // 用来存储的报表子控件
			optionInfoGrid : undefined, // 违章grid

			/**
			 * 创建控件
			 * 
			 * @param {}
			 * 
			 */
			getControl : function() {

				optionInfoRecord = Ext.data.Record.create([{
							name : 'rowIndex',
							type : 'int'
						}, {
							name : 'RtimeAlarmType',
							type : 'string'
						}, {
							name : 'RtimeAlarmAdd',
							type : 'string'
						}, {
							name : 'RtimeAlarmDate',
							type : 'string'
						}, {
							name : 'RtimeAlarmDescript',
							type : 'string'
						}]);

				// 提示信息对应数据存储对象
				optionInfoStore = new Ext.data.Store({
							proxy : new Ext.data.MemoryProxy(),
							reader : new Ext.data.ArrayReader({},
									optionInfoRecord)
						});
				RtimeAlarmCm = new Ext.grid.ColumnModel({
							columns : [{
										header : '提示类型',
										// align: 'center',
										dataIndex : 'RtimeAlarmType',
										menuDisabled : true,
										width : 120
									}, {
										header : '地点',
										// align: 'center',
										dataIndex : 'RtimeAlarmAdd',
										// sortable: true,
										menuDisabled : true,
										width : 80
									}, {
										header : '时间',
										// align: 'center',
										dataIndex : 'RtimeAlarmDate',
										renderer : this.getNowOnlyTime,
										menuDisabled : true,
										width : 80
									}, {
										header : '备注',
										// align: 'center',
										dataIndex : 'RtimeAlarmDescript',
										// sortable: true,
										menuDisabled : true,
										width : 100
									}]
						});

				var optionInfoGrid = new top.Ext.grid.EditorGridPanel({
							cm : RtimeAlarmCm,
							id : 'optionInfoGrid',
							ds : optionInfoStore,
							region : 'center',
							border : true,
							columnLines : true,
							autoScroll : true,
							trackMouseOver : true,
							stripeRows : true,
							loadMask : true,
							width : 430,
							height : 220
						});

				var win = new top.Ext.Window({
							title : "提示信息",
							resizable : false,
							frame : true,
							border : false,
							width : 440,
							height : 250,
							modal : true,
							bodyBorder : false,
							closable : true,
							closeAction : 'close',
							autoDestroy : true,
							resizable : false,
							plain : true,
							layout : 'form',
							items : [optionInfoGrid]
						});

				return win;
			},

			/*******************************************************************
			 * Function: getNowOnlyTime Description: 当前日期+时间 Input: 无 Output: 无
			 * Return: time: 当前系统时间
			 ******************************************************************/
			getNowOnlyTime : function() {
				var DateTime = new Date();
				return DateTime.getHours() + ":" + DateTime.getMinutes() + ":"
						+ DateTime.getSeconds();
			}
		});
