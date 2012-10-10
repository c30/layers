/**
 * @description 实时过车信息画面布局
 * @date 2011/05/19
 * @author zhou xiaolong
 */
Ext.namespace('cms.emap');
cms.emap.carPicMonitorLoad = function(config) {
	cms.emap.carPicMonitorLoad.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.carPicMonitorLoad, Ext.ux.BaseControl, {
			controlItem : new cms.framework.map(),// 用来存储的子控件
			/**
			 * 创建控件
			 * 
			 * @param {}
			 * 
			 */
			getControl : function() {
				var form = new cms.emap.carPicMonitorForm({
							listeners : {
								carPicMonitorFormEvent : this.carPicMonitorFormEvent
										.createDelegate(this)
							}
						});
				this.controlItem.add('form', form);

				var carPicMonitorReport = new cms.emap.carPicMonitorReport({});
				this.controlItem
						.add('carPicMonitorReport', carPicMonitorReport);
				// 导航主面板
				var fnRegion = new Ext.Panel({
							// layout : 'border',
							border : false,
							frame : false,
							items : [form.getControl(),
									carPicMonitorReport.getControl()],
							listeners : {
								resize : this.resizeReportHandler
										.createDelegate(this)
							}
						});
				return fnRegion;

			},
			resizeReportHandler : function(p, width, height) {
				var w = width - 100;
				var h = height - 120;
				if (w > 700) {
					w = 700;
				} else if (w < 250) {
					w = 250;
				}
				if (h > 350) {
					h = 350;
				} else if (h < 125) {
					h = 125;
				}
				// $("#SeeChanPicOCX").height(230);
				m_sz_gridWidth = width - 2;
				Ext.getCmp('gridForm').setSize(width - 2, 250);
				Ext.getCmp('vehicleGird').setSize(width - 2, 190);
				Ext.getCmp('warningCarPassInfoGrid').setSize(width - 2, 190);
				if (height - 250 > 0) {
					Ext.getCmp('picForm').setSize(width - 2, height - 250);
					document.getElementById('picDiv').style.height = height
							- 250;
				} else {
					Ext.getCmp('picForm').setSize(width - 2, 1);
					document.getElementById('picDiv').style.height = 1;
				}
				document.getElementById('picDiv').style.width = width - 2;

				if (Ext.isIE) {
					if (Ext.get('ext-gen87')) {
						// Ext.get('ext-gen87').setWidth(w);
						// Ext.get('ext-gen87').setHeight(h);
					}
				} else {
					if (Ext.get('ext-gen83')) {
						// Ext.get('ext-comp-1034').setWidth(width - 80);
						// Ext.get('ext-comp-1034').setHeight(height - 100);
						// Ext.get('ext-gen83').setWidth(width - 80);
						// Ext.get('ext-gen83').setHeight(height - 100);
					}
				}
			},
			carPicMonitorFormEvent : function(event) {
				switch (event.params.operate) {
					case 'Search' :
						this.controlItem.get('carPicMonitorReport')
								.searchData(event.params);
						break;
					default :
						break;
				}
			}
		});
