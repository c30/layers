/**
 * @description 添加监控点的属性form,用于设置监控点的
 * @date 2011/05/16
 * @author zhangsl
 */
Ext.namespace('cms.emap');
cms.emap.propertyForm = function(config) {
	this.title = '地图：无';
	cms.emap.propertyForm.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.propertyForm, Ext.ux.BaseControl, {
			fnPanelItem : new cms.framework.map(),// 用来存储的子控件
			treeLoader : undefined,
			tBar : undefined,
			tree : undefined,
			form : undefined,
			/**
			 * 创建控件
			 * 
			 * @param {}
			 * 
			 */
			getControl : function() {
				Ext.QuickTips.init();
				this.fontColorBox = new Ext.ux.ColorField({
							width : 100,
							labelWidth : 70,
							fieldLabel : '字体颜色',
							value : '#000000',
							msgTarget : 'qtip',
							fallback : true
						});

				this.fontSizes = [[6, 6], [8, 8], [9, 9], [10, 10], [11, 11],
						[12, 12], [14, 14], [16, 16], [18, 18], [20, 20]];

				this.fontSizeBox = new Ext.form.ComboBox({
							store : new Ext.data.ArrayStore({
										fields : ['key', 'value'],
										data : this.fontSizes
									}),
							width : 120,
							fieldLabel : '字号',
							valueField : 'key',
							displayField : 'value',
							mode : 'local',
							triggerAction : 'all',
							value : 12,
							editable : false,
							forceSelection : true
						});
				this.bgColorBox = new Ext.ux.ColorField({
							width : 100,
							fieldLabel : '背景色',
							value : '#FFFFFF',
							msgTarget : 'qtip',
							fallback : true
						});
				this.bgCheckBox = new Ext.form.Checkbox({
							hideLabel : true,
							boxLabel : '背景是否透明'
						});
				this.viewColorBox = new Ext.ux.ColorField({
							width : 100,
							fieldLabel : '视角背景',
							value : '#FFFFFF',
							msgTarget : 'qtip',
							fallback : true
						});

				this.viewTranField = new Ext.form.NumberField({
							labelWidth : 100,
							width : 40,
							minValue : 0,
							maxValue : 255,
							value : 0,
							allowBlank : false,
							fieldLabel : '视角透明度(0-255)'

						});

				this.direcs = [[0, '0度'], [45, '45度'], [90, '90度'],
						[135, '135度'], [180, '180度']];

				this.direcBox = new Ext.form.ComboBox({
							store : new Ext.data.ArrayStore({
										fields : ['key', 'value'],
										data : this.direcs
									}),
							width : 100,
							fieldLabel : '方向',
							valueField : 'key',
							displayField : 'value',
							mode : 'local',
							triggerAction : 'all',
							value : 0,
							editable : false,
							forceSelection : true
						});
				this.descripField = new Ext.form.TextArea({
							fieldLabel : '描述',
							width : 120,
							height : 80
						});
				this.perspectField = new Ext.form.NumberField({
							width : 100,
							minValue : 0,
							maxValue : 360,
							allowBlank : false,
							value : 0,
							fieldLabel : '视角(0-360)'
						});
				this.radiusField = new Ext.form.NumberField({
							width : 100,
							allowBlank : false,
							value : 0,
							fieldLabel : '半径(厘米)'
						});
				this.form = new Ext.form.FormPanel({
							title : this.title,
							labelAlign : 'left',
							border : false,
							frame : false,
							items : [{
								style : 'padding:10px 0px 5px 10px',
								width : 410,
								layout : 'column',
								border : false,
								frame : false,
								defaults : {
									layout : 'form',
									border : false,
									frame : false
								},
								items : [{
											labelWidth : 80,
											columnWidth : .5,
											items : [this.fontColorBox,
													this.bgColorBox
											// ,this.viewColorBox,
											// this.direcBox,
											// this.perspectField,
											// this.radiusField
											]
										}, {
											labelWidth : 40,
											columnWidth : .5,
											items : [this.fontSizeBox,
													this.bgCheckBox
											// ,
											// {
											// layout : 'form',
											// border : false,
											// frame : false,
											// labelWidth : 120,
											// items : [this.viewTranField]
											// }, this.descripField

											]
										}]
							}],
							buttons : [{
								text : '确定',
								handler : this.confirmHandler
										.createDelegate(this)
							}, {
								text : '取消',
								handler : this.cancelHandler
										.createDelegate(this)
							}],
							buttonAlign : "right"
						});

				return this.form;

			},
			confirmHandler : function() {
				if (this.form.getForm().isValid()) {
					var data = {
						FontSize : this.fontSizeBox.getValue(),
						FontColor : this.fontColorBox.getValue(),
						BKGroundColor : this.bgColorBox.getValue(),
						BKTransparent : this.bgCheckBox.getValue() == true
								? 1
								: 0
						// ,
						// ViewBKColor : this.viewColorBox.getValue(),
						// ViewBKTrans : this.viewTranField.getValue(),
						// EleAngle : this.direcBox.getValue(),
						// ViewAngle : this.perspectField.getValue(),
						// Radius : this.radiusField.getValue() / 100
					};
					var eventObject = {
						eventCode : 'AddNodeFormEvent',
						sender : this,
						params : {
							operate : "ConfirmBtn",
							data : data
						}
					};
					this.fireEvent(eventObject.eventCode, eventObject);
				}

			},
			cancelHandler : function() {
				var eventObject = {
					eventCode : 'AddNodeFormEvent',
					sender : this,
					params : {
						operate : "CancelBtn",
						data : {}
					}
				};
				this.fireEvent(eventObject.eventCode, eventObject);
			}
		});
